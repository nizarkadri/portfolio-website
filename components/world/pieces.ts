import * as THREE from 'three';

/** Chess pieces as real geometry: lathed stone, one square = one unit. */
export type PieceKind = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

type P = [number, number];

const BASE: P[] = [
  [0, 0], [0.37, 0], [0.385, 0.03], [0.385, 0.07], [0.35, 0.1], [0.3, 0.13], [0.29, 0.17], [0.31, 0.2], [0.27, 0.24],
];

const PROFILES: Record<Exclude<PieceKind, 'knight'>, P[]> = {
  pawn: [
    ...BASE, [0.19, 0.3], [0.14, 0.44], [0.115, 0.58], [0.2, 0.62], [0.215, 0.655], [0.14, 0.69],
    [0.17, 0.75], [0.205, 0.84], [0.19, 0.93], [0.13, 1.0], [0, 1.03],
  ],
  rook: [
    ...BASE, [0.24, 0.3], [0.2, 0.5], [0.19, 0.78], [0.25, 0.84], [0.275, 0.88], [0.28, 1.1], [0.2, 1.1], [0.2, 1.02], [0, 1.02],
  ],
  bishop: [
    ...BASE, [0.2, 0.32], [0.13, 0.6], [0.105, 0.88], [0.2, 0.93], [0.21, 0.97], [0.12, 1.01],
    [0.17, 1.1], [0.195, 1.2], [0.16, 1.33], [0.08, 1.44], [0.045, 1.47], [0.075, 1.52], [0.05, 1.57], [0, 1.585],
  ],
  queen: [
    ...BASE, [0.22, 0.33], [0.14, 0.7], [0.115, 1.1], [0.21, 1.15], [0.225, 1.19], [0.13, 1.23],
    [0.15, 1.36], [0.24, 1.56], [0.26, 1.6], [0.2, 1.6], [0.12, 1.57], [0.09, 1.64], [0.07, 1.7], [0.085, 1.75], [0.05, 1.8], [0, 1.81],
  ],
  king: [
    ...BASE, [0.23, 0.33], [0.15, 0.72], [0.125, 1.16], [0.225, 1.21], [0.24, 1.25], [0.14, 1.29],
    [0.16, 1.42], [0.245, 1.62], [0.25, 1.67], [0.16, 1.7], [0.07, 1.72], [0, 1.72],
  ],
};

function lathe(points: P[], segments = 56) {
  // Densify with a spline so shoulders read as turned stone, not polygons.
  const curve = new THREE.SplineCurve(points.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0001), y)));
  const pts = curve.getPoints(points.length * 5);
  pts[0].x = 0.0001;
  pts[pts.length - 1].x = 0.0001;
  const g = new THREE.LatheGeometry(pts, segments);
  g.computeVertexNormals();
  return g;
}

function merge(parts: THREE.BufferGeometry[]) {
  // Minimal merge (position + normal), enough for stone without UVs.
  let count = 0;
  const prepared = parts.map((p) => {
    const g = p.index ? p.toNonIndexed() : p;
    count += g.attributes.position.count;
    return g;
  });
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  let o = 0;
  for (const g of prepared) {
    pos.set(g.attributes.position.array as Float32Array, o);
    nor.set(g.attributes.normal.array as Float32Array, o);
    o += g.attributes.position.count * 3;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  return out;
}

function box(w: number, h: number, d: number, x: number, y: number, z: number, ry = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (ry) g.rotateY(ry);
  g.translate(x, y, z);
  return g;
}

function knight() {
  const s = new THREE.Shape();
  s.moveTo(-0.2, 0);
  s.lineTo(0.22, 0);
  s.bezierCurveTo(0.2, 0.2, 0.08, 0.3, 0.13, 0.43);
  s.bezierCurveTo(0.19, 0.52, 0.33, 0.5, 0.39, 0.57);
  s.lineTo(0.41, 0.69);
  s.bezierCurveTo(0.31, 0.82, 0.17, 0.9, 0.11, 1.0);
  s.lineTo(0.085, 1.13);
  s.lineTo(-0.02, 1.01);
  s.bezierCurveTo(-0.21, 0.92, -0.31, 0.6, -0.27, 0.3);
  s.bezierCurveTo(-0.26, 0.15, -0.23, 0.07, -0.2, 0);
  const head = new THREE.ExtrudeGeometry(s, {
    depth: 0.2, bevelEnabled: true, bevelThickness: 0.045, bevelSize: 0.04, bevelSegments: 4, curveSegments: 20,
  });
  head.translate(0, 0, -0.1);
  head.scale(0.95, 0.95, 1);
  head.translate(0, 0.27, 0);
  head.rotateY(Math.PI / 2);
  const base = lathe([...BASE, [0.25, 0.27], [0.2, 0.3], [0, 0.3]]);
  return merge([base, head]);
}

const cache = new Map<PieceKind, THREE.BufferGeometry>();

export function pieceGeometry(kind: PieceKind): THREE.BufferGeometry {
  const hit = cache.get(kind);
  if (hit) return hit;
  let g: THREE.BufferGeometry;
  if (kind === 'knight') {
    g = knight();
  } else if (kind === 'king') {
    g = merge([lathe(PROFILES.king), box(0.075, 0.3, 0.075, 0, 1.86, 0), box(0.22, 0.075, 0.075, 0, 1.89, 0)]);
  } else if (kind === 'rook') {
    const teeth: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      teeth.push(box(0.13, 0.1, 0.09, Math.sin(a) * 0.235, 1.15, Math.cos(a) * 0.235, a));
    }
    g = merge([lathe(PROFILES.rook), ...teeth]);
  } else {
    g = lathe(PROFILES[kind]);
  }
  cache.set(kind, g);
  return g;
}

export function disposePieces() {
  cache.forEach((g) => g.dispose());
  cache.clear();
}
