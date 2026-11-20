import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/* ==========================================================================
   The marks along the path: each one is its own logo, in its own colours,
   made solid. The drawing is cut out of the SVG and given thickness; where
   one colour is painted over another it stands a little proud of it, the way
   enamel sits in a badge. Letters and emblems stay separate pieces, so a slow
   wave can pass through the word.
   ========================================================================== */

export interface LogoSpec {
  name: string;
  file: string;
  /** The box the logo is fitted into, in world units. */
  w: number;
  h: number;
  /** How thick it is, how soft its edge is, and how far each later colour stands proud of the one under it. */
  depth: number;
  bevel: number;
  step: number;
  /** Points per curve. */
  curve: number;
  /** Fills the loader cannot read (gradients), swapped for a flat colour before parsing. */
  swap?: Array<[RegExp, string]>;
  /** Colours that are polished metal rather than enamel. */
  metal?: string[];
}

/** In the order they are met on the way to the tower. */
export const STATIONS: LogoSpec[] = [
  { name: 'University of Windsor', file: '/images/companies/University_of_Windsor.svg', w: 3.2, h: 1.25, depth: 0.12, bevel: 0.003, step: 0.016, curve: 8 },
  {
    name: 'Fiera Capital', file: '/images/companies/Fiera_Capital.svg', w: 3.5, h: 1.2, depth: 0.1, bevel: 0.0028, step: 0.016, curve: 8,
    swap: [[/url\(#linear-gradient(-\d)?\)/g, '#c9cbcd']], metal: ['#a7a9ac', '#c9cbcd'],
  },
  { name: 'CGI', file: '/images/companies/CGI.svg', w: 2.7, h: 1.25, depth: 0.24, bevel: 0.018, step: 0, curve: 28 },
  { name: 'Google DevFest', file: '/images/companies/Google_DevFest.svg', w: 2.3, h: 1.3, depth: 0.2, bevel: 0.018, step: 0.12, curve: 20 },
];

export interface Logo {
  root: THREE.Group;
  /** The separate pieces (letters, emblems), each with its place in the wave. `rest` is in the logo's own units. */
  parts: Array<{ node: THREE.Group; phase: number }>;
  /** World units per unit of the drawing: multiply a world distance by `1 / unit` to move a part. */
  unit: number;
  width: number;
  height: number;
}

interface Item { shapes: THREE.Shape[]; fill: string; stroke: string; sw: number; box: THREE.Box2; order: number }

const BACK = 0.003;   // each later layer starts this much further forward at the back, so nothing fights there either
const PROUD = 0.035;  // how far an outlined colour stands out of its own rim

function material(colour: string, metal: boolean) {
  return metal
    ? new THREE.MeshPhysicalMaterial({ color: colour, roughness: 0.3, metalness: 0.9, envMapIntensity: 1.1 })
    : new THREE.MeshPhysicalMaterial({ color: colour, roughness: 0.42, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.24, envMapIntensity: 0.55 });
}

export function buildLogo(svg: string, spec: LogoSpec, size = 1): Logo {
  let text = svg;
  for (const [a, b] of spec.swap ?? []) text = text.replace(a, b);
  const data = new SVGLoader().parse(text);

  const items: Item[] = [];
  const all = new THREE.Box2();
  data.paths.forEach((path, order) => {
    const st = (path.userData?.style ?? {}) as { fill?: string; stroke?: string; strokeWidth?: number };
    if (!st.fill || st.fill === 'none') return;
    const shapes = SVGLoader.createShapes(path);
    if (!shapes.length) return;
    const stroke = st.stroke && st.stroke !== 'none' ? st.stroke.toLowerCase() : '';
    const sw = stroke ? st.strokeWidth ?? 1 : 0;
    const box = new THREE.Box2();
    for (const s of shapes) for (const p of s.getPoints(6)) box.expandByPoint(p);
    box.expandByScalar(sw / 2);
    all.union(box);
    items.push({ shapes, fill: st.fill.toLowerCase(), stroke, sw, box, order });
  });

  const bw = all.max.x - all.min.x, bh = all.max.y - all.min.y;
  const unit = Math.min(spec.w / bw, spec.h / bh) * size;
  const u = 1 / unit;

  // pieces: whatever touches belongs together (a shield and what is drawn on it); what stands apart is its own piece
  const parent = items.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++)
      if (items[i].box.intersectsBox(items[j].box)) parent[find(i)] = find(j);
  const groups = new Map<number, Item[]>();
  items.forEach((it, i) => { const k = find(i); groups.set(k, [...(groups.get(k) ?? []), it]); });

  const mats = new Map<string, THREE.Material>();
  const mat = (c: string) => {
    let m = mats.get(c);
    if (!m) { m = material(c, !!spec.metal?.includes(c)); mats.set(c, m); }
    return m;
  };
  const bevel = spec.bevel * u;
  const solid = (shapes: THREE.Shape[], offset: number, depth: number, back: number) => {
    const g = new THREE.ExtrudeGeometry(shapes, {
      depth: depth * u, steps: 1, curveSegments: spec.curve,
      bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.9, bevelOffset: offset - bevel * 0.9, bevelSegments: 3,
    });
    g.translate(0, 0, bevel + back * u);
    return g;
  };

  const root = new THREE.Group();
  const parts: Logo['parts'] = [];
  for (const list of groups.values()) {
    list.sort((a, b) => a.order - b.order);
    const byColour = new Map<string, THREE.BufferGeometry[]>();
    const add = (c: string, g: THREE.BufferGeometry) => byColour.set(c, [...(byColour.get(c) ?? []), g]);
    const box = new THREE.Box2();
    let layer = 0, last = '';
    for (const it of list) {
      if (last && it.fill !== last) layer++;
      last = it.fill;
      box.union(it.box);
      const depth = spec.depth + layer * spec.step;
      if (it.stroke) {
        // an outlined shape: a dark rim the width of the line, and the colour set into it
        add(it.stroke, solid(it.shapes, it.sw / 2, depth, layer * BACK));
        add(it.fill, solid(it.shapes, -it.sw / 2, depth + PROUD, layer * BACK));
      } else add(it.fill, solid(it.shapes, 0, depth, layer * BACK));
    }
    const node = new THREE.Group();
    byColour.forEach((geos, c) => {
      const merged = geos.length > 1 ? mergeGeometries(geos, false) : geos[0];
      if (geos.length > 1) geos.forEach((g) => g.dispose());
      if (merged) node.add(new THREE.Mesh(merged, mat(c)));
    });
    root.add(node);
    parts.push({ node, phase: (((box.min.x + box.max.x) / 2 - all.min.x) / bw) * Math.PI * 2 * 1.15 });
  }

  // the drawing has y down and its own origin: turn it over and centre it
  root.scale.set(unit, -unit, unit);
  root.position.set(-((all.min.x + all.max.x) / 2) * unit, ((all.min.y + all.max.y) / 2) * unit, -spec.depth / 2);
  return { root, parts, unit, width: bw * unit, height: bh * unit };
}
