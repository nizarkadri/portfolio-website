import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { pieceGeometry, disposePieces, cnTower, PieceKind } from './pieces';
import { MIRROR } from './mirror';
import { buildLogo, Logo, STATIONS } from './logos';
import { asTexture, boardCanvas, cloudCanvas, gradientCanvas, paleSkyCanvas, radialCanvas, stoneCanvas } from './textures';

/* ==========================================================================
   The Long Game: one continuous place, rendered live.
   A pale, quiet studio with no walls: the board runs away into mist, the
   pieces stand on it like sculpture, one thread of blue light runs the length
   of it and climbs the tower at the far end. Between the game and the city the
   path is lined with where he studied and worked: each one its own mark, in its
   own colours, made solid and standing over a square of the board. Scroll moves
   one camera along one line; nothing in the world pops or rises, and the only
   things that stir are those marks, turning to whoever walks past.
   ========================================================================== */

export interface WorldOptions {
  mobile: boolean;
  tower: string[];         // certificate + cover images for the tower
  figure?: string;         // unused by this world; kept so callers need not change
  still?: boolean;         // render on demand only (reduced motion / posters)
}

/** Viewport heights of scroll the landing act owns. Landing reads this for its own windows. */
export const SPAN = 15;

const BLUE = 0x3f7fe0;
const THREAD = 0x4f8fff;
const CANVAS = 0xe3f2fb;
const INK = 0x0e1013;

const Z_BACK = 34;         // where the board begins, behind the opening camera
const Z_SHAFT = -48;       // where the shaft begins
const CX = 0, CZ = -60;    // the tower's axis
const RIM = 24;            // where the cloud closes under the last board
const SUMMIT = 27.5;       // the last board floats above the rim
const ORBIT_END = Math.PI * 0.92;
const PATH_Z = -10.5;      // the first mark on the path, and how far it is to the next
const PATH_GAP = 4;
const FLOAT = 1.6;         // how high a mark hangs over its square

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ss = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const sq = (file: number, rank: number) => new THREE.Vector3(file - 3.5, 0, 3.5 - rank);

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/* ------------------------------------------------------------ the camera
   Keys are placed in viewport-heights of scroll (v). A pair of close keys is a
   dwell: the camera drifts while the copy is read. The gaps between pairs are
   travel, and each gap is sized to its distance so the pace stays even. */
interface Key { v: number; pos: [number, number, number]; look: [number, number, number] }

function buildKeys(): Key[] {
  const keys: Key[] = [
    { v: 0.0, pos: [-2.2, 1.8, 13.6], look: [-3.3, 1.45, -2.6] },
    { v: 1.1, pos: [-2.25, 1.72, 12.3], look: [-3.3, 1.45, -3.6] },
    { v: 2.3, pos: [-3.1, 0.95, 2.9], look: [2.2, 1.3, -2.8] },
    { v: 3.4, pos: [-2.7, 0.9, 1.9], look: [2.4, 1.35, -3.5] },
    { v: 3.95, pos: [-1.8, 2.3, -0.2], look: [0.9, 1.4, -11] },
    // the path: seen whole from a little above, then walked, with a mark passing on each side in turn
    { v: 4.5, pos: [0, 3.6, -1.2], look: [0, 1.25, -16] },
    { v: 5.05, pos: [0, 3.4, -2.4], look: [0, 1.25, -17] },
    { v: 5.75, pos: [0.15, 2.4, -8.6], look: [0.2, 1.7, -22] },
    { v: 6.4, pos: [-0.15, 2.15, -15.6], look: [0.9, 2.2, -29] },
    { v: 6.95, pos: [-1.2, 2.35, -22.0], look: [2.2, 3.0, -35] },
    { v: 7.3, pos: [-1.7, 2.5, -24.0], look: [2.7, 3.3, -36] },
    { v: 8.4, pos: [-1.4, 2.6, -25.6], look: [2.8, 3.5, -36] },
    { v: 9.7, pos: [0, 2.3, -45.6], look: [-1.4, 4.6, CZ] },
    { v: 10.1, pos: [0, 1.9, CZ + 10.4], look: [-2.4, 5.6, CZ] },
  ];
  // the climb: half a turn round the tower, rising at one steady rate
  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    const u = i / steps;
    const th = u * ORBIT_END;
    const R = 10.4 - u * 0.9;
    const y = 1.9 + u * 22.2;
    const lookUp = 3.7 * (1 - u) + 0.4;
    const off = 2.4 * (1 - u * 0.55);
    keys.push({
      v: 10.1 + u * 2.6,
      pos: [CX + Math.sin(th) * R, y, CZ + Math.cos(th) * R],
      look: [CX - Math.cos(th) * off, y + lookUp, CZ + Math.sin(th) * off],
    });
  }
  // the summit: looking down on the last board from the side the climb ended on
  const s = Math.sin(ORBIT_END), c = Math.cos(ORBIT_END);
  const local = (x: number, y: number, z: number): [number, number, number] => [CX + x * c + z * s, SUMMIT + y, CZ - x * s + z * c];
  keys.push({ v: 14.3, pos: local(0, 16.7, 18.6), look: local(0, 0, 4.7) });
  keys.push({ v: SPAN, pos: local(0, 16.1, 18.1), look: local(0, 0, 4.7) });
  return keys;
}

/** Monotone cubic through (p_i, i): scroll progress to a position along the keys, with no stop-go at the joins. */
function pacing(xs: number[]) {
  const n = xs.length;
  const d: number[] = [], m: number[] = new Array(n);
  for (let i = 0; i < n - 1; i++) d.push(1 / (xs[i + 1] - xs[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) {
    const h0 = xs[i] - xs[i - 1], h1 = xs[i + 1] - xs[i];
    m[i] = (3 * (h0 + h1)) / ((2 * h1 + h0) / d[i - 1] + (h1 + 2 * h0) / d[i]);
  }
  return (p: number) => {
    if (p <= xs[0]) return 0;
    if (p >= xs[n - 1]) return n - 1;
    let i = 0;
    while (i < n - 2 && p > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (p - xs[i]) / h, t2 = t * t, t3 = t2 * t;
    return i + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) + (t3 - t2) * h * m[i + 1];
  };
}

const GAME: Array<[PieceKind, number, number, 'dark' | 'bone', number?]> = [
  ['king', 4, 3, 'dark'],
  ['queen', 6, 5, 'bone', 0.4],
  ['rook', 2, 5, 'dark'],
  ['bishop', 3, 4, 'bone'],
  ['knight', 6, 2, 'dark', -2.2],
  ['pawn', 2, 2, 'dark'],
  ['pawn', 3, 2, 'dark'],
  ['pawn', 5, 3, 'bone'],
  ['pawn', 4, 6, 'bone'],
  ['rook', 7, 7, 'bone'],
  ['pawn', 7, 4, 'dark'],
  ['bishop', 5, 6, 'dark'],
];

/** Pieces that carry a label in the HTML layer: [file, rank, height]. Order matches Landing's TAGS. */
const TAGGED: Array<[number, number, number]> = [
  [4, 3, 2.08], [6, 5, 1.9], [2, 5, 1.24], [3, 4, 1.68], [6, 2, 1.44], [3, 2, 1.12],
];

/** Candidate lines the board is "calculating": from square to square, with a lift. */
const LINES: Array<[number, number, number, number, number]> = [
  [6, 2, 4, 3, 1.3], [6, 2, 5, 4, 0.9], [6, 5, 3, 2, 1.5], [3, 4, 6, 7, 1.2], [2, 5, 2, 7, 0.8], [4, 3, 4, 4, 0.5], [6, 5, 6, 7, 0.7],
];

const THREAD_VERT = /* glsl */ `
  attribute vec3 aTangent;
  attribute float aSide;
  attribute float aS;
  uniform float uTime;
  uniform float uWidth;
  varying float vSide;
  varying float vS;
  varying float vEdge;
  #include <common>
  #include <fog_pars_vertex>
  void main() {
    vec3 p = position;
    p.y += 0.07 * sin(aS * 0.52 + uTime * 0.42);
    p.x += 0.05 * sin(aS * 0.35 - uTime * 0.3 + 1.3);
    vec4 w = modelMatrix * vec4(p, 1.0);
    vec3 T = normalize(mat3(modelMatrix) * aTangent);
    vec3 V = normalize(cameraPosition - w.xyz);
    vec3 across = cross(T, V);
    float edge = length(across);
    w.xyz += (across / max(edge, 0.0001)) * aSide * uWidth;
    vEdge = smoothstep(0.05, 0.32, edge);   // seen end-on, the thread lets go instead of folding
    vSide = aSide;
    vS = aS;
    vec4 mvPosition = viewMatrix * w;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;
const THREAD_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uGain;
  uniform float uFall;
  uniform float uAlpha;
  varying float vSide;
  varying float vS;
  varying float vEdge;
  #include <common>
  #include <fog_pars_fragment>
  void main() {
    float a = exp(-vSide * vSide * uFall);
    float pulse = 0.84 + 0.16 * sin(vS * 0.45 - uTime * 0.7);
    gl_FragColor = vec4(uColor * uGain * pulse, a * uAlpha * vEdge);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export class World {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private raf = 0;
  private running = false;
  private disposed = false;
  private target = 0;
  private p = 0;
  private pointer = new THREE.Vector2();
  private pointerEased = new THREE.Vector2();
  private look = new THREE.Vector3();
  private v1 = new THREE.Vector3();
  private loader = new THREE.ImageLoader();
  private fog: THREE.FogExp2;
  private game = new THREE.Group();
  private finale = new THREE.Group();
  private stations: Array<{ at: THREE.Vector3; holder: THREE.Group; ring: THREE.Mesh; glow: THREE.Mesh; pool: THREE.Mesh; phase: number; half: number; unit: number; here: number; parts: Logo['parts'] }> = [];
  private sky!: THREE.Mesh;
  private mirror: Reflector | null = null;
  private threadMats: THREE.ShaderMaterial[] = [];
  private replySquare!: THREE.Mesh;
  private replyGlow!: THREE.Mesh;
  private replyPawn!: THREE.Mesh;
  private replyLight!: THREE.PointLight;
  private replyT = -1;
  private replyResolve: (() => void) | null = null;
  private disposables: Array<{ dispose: () => void }> = [];
  private arcs: Array<{ mesh: THREE.Mesh; ring: THREE.Mesh; total: number; phase: number }> = [];
  private tex: Record<string, THREE.Texture> = {};
  private path: THREE.CatmullRomCurve3;
  private aim: THREE.CatmullRomCurve3;
  private pace: (p: number) => number;
  private segments: number;
  private fogHall = new THREE.Color(0xe3f0fa);
  private fogShaft = new THREE.Color(0xe3f0fa);
  private fogSky = new THREE.Color(0xe6f1fb);
  private clouds: THREE.Mesh[] = [];

  constructor(private canvas: HTMLCanvasElement, private opts: WorldOptions) {
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false }));
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 1.75));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NeutralToneMapping;
    r.toneMappingExposure = 1.0;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.VSMShadowMap;
    r.shadowMap.autoUpdate = false;       // the world is static: light it once
    r.setClearColor(CANVAS, 1);

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 500);
    this.fog = new THREE.FogExp2(this.fogHall.getHex(), 0.026);
    this.scene.fog = this.fog;

    const keys = buildKeys();
    this.segments = keys.length - 1;
    this.path = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.pos)), false, 'centripetal');
    this.aim = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.look)), false, 'centripetal');
    this.pace = pacing(keys.map((k) => k.v / SPAN));

    this.buildTextures();
    this.buildLight();
    this.buildHall();
    this.buildShaft();
    this.buildPieces();
    this.buildArcs();
    this.buildPath();
    this.buildCity();
    this.buildTower();
    this.buildSummit();
    this.buildThread();
    this.buildMirror();

    this.resize();
    this.apply(0, 0);
    r.shadowMap.needsUpdate = true;
    try { r.compile(this.scene, this.camera); } catch { /* compile is a warm-up, never a requirement */ }
  }

  /* ----------------------------------------------------------- building */
  private keep<T extends { dispose: () => void }>(x: T) { this.disposables.push(x); return x; }

  private buildTextures() {
    const carrara = stoneCanvas('carrara', 512, 3);
    const marquina = stoneCanvas('marquina', 512, 9);
    this.tex.carrara = asTexture(carrara, [1, 1]);
    this.tex.marquina = asTexture(marquina, [1, 1]);
    this.tex.board = asTexture(boardCanvas(carrara, stoneCanvas('mist', 512, 21), 3, '#e6ecf3', 0.16), [1, 1]);
    this.tex.sky = asTexture(paleSkyCanvas());
    this.tex.blob = asTexture(radialCanvas(128, [[0, 'rgba(38,58,88,0.6)'], [0.45, 'rgba(38,58,88,0.26)'], [1, 'rgba(38,58,88,0)']]));
    this.tex.glow = asTexture(radialCanvas(128, [[0, 'rgba(255,255,255,0.9)'], [0.3, 'rgba(255,255,255,0.32)'], [0.65, 'rgba(255,255,255,0.07)'], [1, 'rgba(255,255,255,0)']]));
    this.tex.doorway = asTexture(gradientCanvas([[0, '#f6d9b8'], [0.5, '#e9a56f'], [1, '#b85e2c']]));
  }

  /** A repeat of one of the stone tiles, sized in world units per tile. */
  private tile(name: string, w: number, h: number, per: number) {
    const t = this.tex[name].clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(w / per, h / per);
    t.needsUpdate = true;
    return this.keep(t);
  }

  private buildLight() {
    // Reflections: a soft white studio. Pale sky all round, one broad light overhead.
    const env = new THREE.Scene();
    const dome = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), new THREE.MeshBasicMaterial({ map: this.tex.sky, side: THREE.BackSide }));
    env.add(dome);
    const panel = (color: number, k: number, w: number, h: number, pos: [number, number, number]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
    };
    panel(0xffffff, 1.7, 26, 26, [4, 16, 6]);     // the soft box overhead
    panel(0xdde8f3, 1, 40, 14, [-18, 4, 0]);      // a broad fill
    panel(0x6f7f95, 1, 80, 80, [0, -7, 0]);       // the floor, so undersides keep their shape
    const pm = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.keep(pm.fromScene(env, 0.03)).texture;
    this.scene.environmentIntensity = 0.85;
    pm.dispose();
    dome.geometry.dispose(); (dome.material as THREE.Material).dispose();

    this.sky = new THREE.Mesh(
      new THREE.SphereGeometry(400, 48, 24),
      new THREE.MeshBasicMaterial({ map: this.tex.sky, side: THREE.BackSide, fog: false, depthWrite: false })
    );
    this.scene.add(this.sky);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xc6d2e0, 1.0));

    // one soft key from the side and above: short, gentle shadows
    const key = new THREE.DirectionalLight(0xffffff, 1.45);
    key.position.set(22, 24, -27);
    key.target.position.set(0, 0, -27);
    key.castShadow = true;
    const kc = key.shadow.camera;
    kc.left = -62; kc.right = 62; kc.top = 27; kc.bottom = -12; kc.near = 1; kc.far = 70;
    key.shadow.mapSize.set(this.opts.mobile ? 2048 : 4096, this.opts.mobile ? 512 : 1024);
    key.shadow.radius = 7; key.shadow.blurSamples = 14; key.shadow.bias = -0.0004;
    this.scene.add(key, key.target);

    const fill = new THREE.DirectionalLight(0xe4edf7, 0.4);
    fill.position.set(-8, 7, 30);
    fill.target.position.set(2, 2, -30);
    this.scene.add(fill, fill.target);
  }

  private buildHall() {
    const g = new THREE.Group();
    const len = Z_BACK - Z_SHAFT, mid = (Z_BACK + Z_SHAFT) / 2;

    // the ground: pale and glossy, with nothing on it but the board
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      new THREE.MeshStandardMaterial({ color: 0xe9f1f8, roughness: 0.36, metalness: 0, envMapIntensity: 0.35 })
    );
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.03, -20); ground.receiveShadow = true;

    // the board runs the whole length and out of sight
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, len),
      new THREE.MeshStandardMaterial({ map: this.tile('board', 8, len, 8), roughness: 0.3, metalness: 0, envMapIntensity: 0.35 })
    );
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, mid); floor.receiveShadow = true;
    g.add(ground, floor);
    this.scene.add(g);
  }

  private buildShaft() {
    // the tower stands on a board of its own
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshStandardMaterial({ map: this.tex.board, roughness: 0.3, metalness: 0, envMapIntensity: 0.35 })
    );
    board.rotation.x = -Math.PI / 2; board.position.set(CX, 0, CZ); board.receiveShadow = true;
    this.scene.add(board);
  }

  private stone(kind: 'dark' | 'bone', shift = 0) {
    const map = this.tex[kind === 'dark' ? 'marquina' : 'carrara'].clone();
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1, 1.4); map.offset.set(shift, shift * 0.61); map.needsUpdate = true;
    this.keep(map);
    return kind === 'dark'
      ? new THREE.MeshPhysicalMaterial({ map, roughness: 0.22, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.16, envMapIntensity: 0.8 })
      : new THREE.MeshPhysicalMaterial({ map, roughness: 0.34, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.22, envMapIntensity: 0.85 });
  }

  private piece(kind: PieceKind, at: THREE.Vector3, mat: THREE.Material, ry = 0) {
    const m = new THREE.Mesh(pieceGeometry(kind), mat);
    m.position.copy(at); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  /** A soft dark pool under whatever stands on the floor, so it sits rather than floats. */
  private blob(at: THREE.Vector3, size: number, opacity = 0.6) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({ map: this.tex.blob, transparent: true, opacity, depthWrite: false, toneMapped: false })
    );
    m.rotation.x = -Math.PI / 2; m.position.set(at.x, at.y + 0.006, at.z); m.renderOrder = 2;
    return m;
  }

  private buildPieces() {
    GAME.forEach(([kind, f, r, c, ry], i) => {
      this.game.add(this.piece(kind, sq(f, r), this.stone(c, i * 0.173), ry ?? 0));
      this.game.add(this.blob(sq(f, r), 1.25));
    });
    this.scene.add(this.game);
  }

  /** The search made visible: fine lines of light from a piece to the squares it is considering. */
  private buildArcs() {
    const mat = () => new THREE.MeshBasicMaterial({ color: 0x2f62c4, transparent: true, opacity: 0, depthWrite: false });
    LINES.forEach(([f1, r1, f2, r2, lift], i) => {
      const a = sq(f1, r1).setY(0.05), b = sq(f2, r2).setY(0.05);
      const mid = a.clone().lerp(b, 0.5).setY(lift);
      const geo = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 64, 0.0075, 6, false);
      const mesh = new THREE.Mesh(geo, mat());
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.66, 4, 1, Math.PI / 4), mat());
      ring.rotation.x = -Math.PI / 2; ring.position.copy(b).setY(0.012);
      mesh.renderOrder = 3; ring.renderOrder = 3;
      this.game.add(mesh, ring);
      this.arcs.push({ mesh, ring, total: geo.index ? geo.index.count : 0, phase: i * 0.37 });
    });
  }

  /** Load an image, scale it to at most `max` on its long side, and hand back a texture already on the GPU. */
  private image(url: string, max: number, onLoad?: (t: THREE.Texture, aspect: number) => void) {
    // No image until it has loaded: the texture is allocated once, at its final size.
    const t = new THREE.Texture();
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16;
    this.keep(t);
    this.loader.load(url, (img) => {
      if (this.disposed) return;
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const el = document.createElement('canvas');
      el.width = Math.max(4, Math.round(img.width * k)); el.height = Math.max(4, Math.round(img.height * k));
      const c = el.getContext('2d')!;
      c.imageSmoothingQuality = 'high';
      c.drawImage(img, 0, 0, el.width, el.height);
      t.image = el;
      t.needsUpdate = true;
      onLoad?.(t, img.width / img.height);
      try { this.renderer.initTexture(t); } catch { /* uploaded on first use instead */ }
    });
    return t;
  }

  /** The path to the tower: where he studied and worked, each as its own mark hanging over a square of the board. */
  private buildPath() {
    const m = this.opts.mobile;
    const X = m ? 1.5 : 2.5, size = m ? 0.75 : 1;
    STATIONS.forEach((spec, i) => {
      const at = new THREE.Vector3((i % 2 ? 1 : -1) * X, 0, PATH_Z - i * PATH_GAP);
      const holder = new THREE.Group();
      holder.position.set(at.x, FLOAT, at.z);
      // the square it hangs over, marked the way the board marks a move
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.62, 0.665, 4, 1, Math.PI / 4),
        new THREE.MeshBasicMaterial({ color: 0x2f62c4, transparent: true, opacity: 0.22, depthWrite: false })
      );
      ring.rotation.x = -Math.PI / 2; ring.position.set(at.x, 0.012, at.z); ring.renderOrder = 3;
      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(2.8, 2.8),
        new THREE.MeshBasicMaterial({ map: this.tex.glow, color: THREAD, transparent: true, opacity: 0, depthWrite: false })
      );
      glow.rotation.x = -Math.PI / 2; glow.position.set(at.x, 0.009, at.z); glow.renderOrder = 2;
      const pool = this.blob(at, 2.6, 0.32);
      const st = { at, holder, ring, glow, pool, phase: i * 1.7, half: 0.6, unit: 1, here: 0, parts: [] as Logo['parts'] };
      this.stations.push(st);
      this.scene.add(holder, ring, glow, pool);
      fetch(spec.file)
        .then((r) => (r.ok ? r.text() : Promise.reject(new Error(spec.file))))
        .then((svg) => {
          if (this.disposed) return;
          const logo = buildLogo(svg, spec, size);
          holder.add(logo.root);
          st.parts = logo.parts; st.unit = logo.unit; st.half = logo.height / 2;
          if (!this.running) { this.apply(this.p, 0); this.render(); }
        })
        .catch(() => { /* its square stays empty */ });
    });
  }

  /** Toronto, as one more piece on the home board. */
  private buildCity() {
    const { shaft, pod, mast, ring } = cnTower();
    const g = new THREE.Group();
    const dark = this.stone('dark', 0.4), bone = this.stone('bone', 0.7);
    const parts: Array<[THREE.BufferGeometry, THREE.Material]> = [
      [shaft, dark], [pod, bone], [mast, dark],
      [ring, new THREE.MeshBasicMaterial({ color: BLUE, side: THREE.DoubleSide })],
    ];
    for (const [geo, mat] of parts) {
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = true; m.receiveShadow = true;
      g.add(m);
    }
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 1.5), this.stone('bone', 0.2));
    plinth.position.y = 0.15; plinth.castShadow = true; plinth.receiveShadow = true;
    g.children.forEach((c) => { if (c !== plinth) c.position.y = 0.3; });
    g.add(plinth);
    g.position.set(3.0, 0, -36);
    this.scene.add(g, this.blob(g.position, 3.0, 0.55));
  }

  /** The tower: everything built and earned, hung in a slow helix round the thread. Nothing in it moves. */
  private buildTower() {
    const r = rng(77);
    // the tower holds pictures only: every frame is something built or earned
    const imgs = [...this.opts.tower];
    for (let i = imgs.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [imgs[i], imgs[j]] = [imgs[j], imgs[i]]; }
    const N = Math.max(12, Math.min(imgs.length || 24, this.opts.mobile ? 24 : 36));
    const tower = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: INK, roughness: 0.42, metalness: 0.5, envMapIntensity: 0.7 });
    const backMat = new THREE.MeshStandardMaterial({ color: 0x0e1014, roughness: 0.7, metalness: 0.1 });
    for (let i = 0; i < N; i++) {
      const door = !imgs.length;                      // nothing to hang: a plain lit pane
      const w = 1.15 + r() * 0.65;
      const h = w * 0.77;
      const g = new THREE.Group();
      const slab = new THREE.Mesh(new THREE.BoxGeometry(w + 0.09, h + 0.09, 0.06), frameMat);
      slab.castShadow = true; slab.receiveShadow = true;
      const src = door ? '' : imgs[i % imgs.length];
      const tex = src
        ? this.image(src, 640, (_t, aspect) => {
            // hang each picture at its own proportions rather than stretching it to the frame
            g.scale.y = (1 / aspect) / (h / w);
          })
        : this.tex.doorway;
      const picture = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: tex })
      );
      picture.position.z = 0.0315;
      const other = door ? '' : imgs[(i + Math.floor(N / 2) + 3) % imgs.length];
      const back = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        other ? new THREE.MeshBasicMaterial({ map: this.image(other, 640) }) : backMat
      );
      back.position.z = -0.0315; back.rotation.y = Math.PI;
      g.add(slab, picture, back);
      const a = i * 2.39996, rad = 2.1 + r() * 1.5;
      const y = 1.7 + i * (22.4 / N) + r() * 0.25;
      g.position.set(Math.sin(a) * rad, y, Math.cos(a) * rad);
      g.rotation.set((r() - 0.5) * 0.1, a + (r() - 0.5) * 0.4, (r() - 0.5) * 0.05);
      tower.add(g);
    }
    tower.position.set(CX, 0, CZ);
    this.scene.add(tower);
  }

  /** The last board, floating clear of the shaft under the open sky. */
  private buildSummit() {
    const g = this.finale;
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(9, 0.5, 9),
      new THREE.MeshStandardMaterial({ color: 0x0c0e12, roughness: 0.3, metalness: 0, envMapIntensity: 0.5 })
    );
    slab.position.y = -0.251; slab.receiveShadow = true;
    const top = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshStandardMaterial({ map: this.tex.board, roughness: 0.22, metalness: 0, envMapIntensity: 0.75 })
    );
    top.rotation.x = -Math.PI / 2; top.receiveShadow = true;
    g.add(slab, top);

    g.add(this.piece('king', sq(4, 0), this.stone('dark', 0.1)), this.blob(sq(4, 0), 1.25));
    g.add(this.piece('pawn', sq(4, 3), this.stone('dark', 0.5)), this.blob(sq(4, 3), 1.1));
    g.add(this.piece('king', sq(4, 7), this.stone('bone', 0.3)), this.blob(sq(4, 7), 1.25));
    this.replyPawn = this.piece('pawn', sq(4, 6), this.stone('bone', 0.8));
    g.add(this.replyPawn);

    // the square that waits for the reply (e5), lit from underneath by the thread
    this.replySquare = new THREE.Mesh(
      new THREE.PlaneGeometry(0.95, 0.95),
      new THREE.MeshBasicMaterial({ color: THREAD, transparent: true, opacity: 0, depthWrite: false })
    );
    this.replySquare.rotation.x = -Math.PI / 2;
    this.replySquare.position.copy(sq(4, 4)).setY(0.004);
    this.replySquare.renderOrder = 3;
    this.replyLight = new THREE.PointLight(THREAD, 0, 4.5, 1.6);
    this.replyLight.position.copy(sq(4, 4)).setY(0.8);
    this.replyGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 3.4),
      new THREE.MeshBasicMaterial({ map: this.tex.glow, color: THREAD, transparent: true, opacity: 0, depthWrite: false })
    );
    this.replyGlow.rotation.x = -Math.PI / 2;
    this.replyGlow.position.copy(sq(4, 4)).setY(0.008);
    this.replyGlow.renderOrder = 4;
    g.add(this.replySquare, this.replyGlow, this.replyLight);

    g.position.set(CX, SUMMIT, CZ);
    g.rotation.y = ORBIT_END;
    this.scene.add(g);

    // two slow decks of cloud under it
    [RIM + 0.6, RIM - 2.4].forEach((y, i) => {
      const map = asTexture(cloudCanvas(512, 41 + i * 7), [i ? 11 : 15, i ? 11 : 15]);
      this.keep(map);
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(520, 520),
        new THREE.MeshBasicMaterial({ map, color: i ? 0xdce8f4 : 0xffffff, transparent: true, opacity: 0, depthWrite: false })
      );
      m.rotation.x = -Math.PI / 2; m.position.set(CX, y, CZ); m.renderOrder = i ? 0 : 1; m.visible = false;
      this.clouds.push(m);
      this.scene.add(m);
    });
  }

  /** One thread of light from the first square to the top of the tower. */
  private buildThread() {
    const pts: Array<[number, number, number]> = [
      [2.3, 6.0, 20], [1.7, 5.5, 12], [1.25, 4.3, 5], [0.9, 3.55, 0.6], [0.55, 4.3, -5], [0.35, 5.2, -12],
      [0.5, 5.6, -20], [0.75, 5.3, -28], [0.8, 5.4, -36], [0.3, 5.0, -42], [0, 4.5, -48], [0.3, 3.9, -54],
    ];
    const turns = 22;
    for (let k = 0; k <= turns; k++) {
      const a = 0.6 + k * 0.92;
      pts.push([CX + Math.sin(a) * 1.0, 3.3 + k * ((SUMMIT - 0.9 - 3.3) / turns), CZ + Math.cos(a) * 1.0]);
    }
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
    const N = this.opts.mobile ? 700 : 1400;
    const pos = new Float32Array((N + 1) * 2 * 3), tan = new Float32Array((N + 1) * 2 * 3);
    const side = new Float32Array((N + 1) * 2), arc = new Float32Array((N + 1) * 2);
    const idx: number[] = [];
    const P = new THREE.Vector3(), T = new THREE.Vector3(), prev = new THREE.Vector3();
    let s = 0;
    for (let i = 0; i <= N; i++) {
      curve.getPoint(i / N, P); curve.getTangent(i / N, T);
      if (i) s += P.distanceTo(prev);
      prev.copy(P);
      for (let j = 0; j < 2; j++) {
        const o = (i * 2 + j) * 3;
        pos[o] = P.x; pos[o + 1] = P.y; pos[o + 2] = P.z;
        tan[o] = T.x; tan[o + 1] = T.y; tan[o + 2] = T.z;
        side[i * 2 + j] = j ? 1 : -1; arc[i * 2 + j] = s;
      }
      if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aTangent', new THREE.BufferAttribute(tan, 3));
    geo.setAttribute('aSide', new THREE.BufferAttribute(side, 1));
    geo.setAttribute('aS', new THREE.BufferAttribute(arc, 1));
    geo.setIndex(idx);
    const layer = (width: number, gain: number, fall: number, alpha: number, additive: boolean, order: number) => {
      const mat = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          { uTime: { value: 0 }, uWidth: { value: width }, uGain: { value: gain }, uFall: { value: fall }, uAlpha: { value: alpha }, uColor: { value: new THREE.Color(THREAD) } },
        ]),
        vertexShader: THREAD_VERT, fragmentShader: THREAD_FRAG,
        transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true,
        blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      const m = new THREE.Mesh(geo, mat);
      m.frustumCulled = false; m.renderOrder = order;
      this.threadMats.push(mat);
      this.scene.add(m);
    };
    layer(0.42, 1, 6, 0.16, false, 5);        // the air round it
    layer(0.032, 1, 2.2, 1, false, 6);        // the thread itself
  }

  private buildMirror() {
    const w = 70, len = Z_BACK - (CZ - 18);
    const mirror = new Reflector(new THREE.PlaneGeometry(w, len), {
      textureWidth: 512, textureHeight: 512, clipBias: 0.003, shader: MIRROR, multisample: 0,
    });
    mirror.rotation.x = -Math.PI / 2;
    mirror.position.set(0, 0.003, (Z_BACK + CZ - 18) / 2);
    const mat = mirror.material as THREE.ShaderMaterial;
    mat.transparent = true; mat.depthWrite = false;
    mirror.renderOrder = 1;
    this.mirror = mirror;
    this.scene.add(mirror);
  }

  /* ---------------------------------------------------------- per frame */
  setProgress(p: number) { this.target = clamp(p); if (this.opts.still) this.p = this.target; }
  setPointer(x: number, y: number) { this.pointer.set(x, y); }

  /** Where a mark's caption goes on screen, just under it, and how present it is: only the marks within reach are named. */
  station(i: number) {
    const s = this.stations[i];
    if (!s) return null;
    const cam = this.camera.position;
    const dist = Math.hypot(cam.x - s.at.x, cam.z - s.at.z);
    this.v1.set(s.at.x, FLOAT - s.half - 0.16, s.at.z).project(this.camera);
    const seen = this.v1.z < 1 ? ss(1.0, 0.8, Math.abs(this.v1.x)) : 0;
    // a mark further down the same side is named once the one in front of it is being passed, never through it
    const before = this.stations[i - 2];
    const clear = before ? ss(before.at.z + 4.2, before.at.z + 1.6, cam.z) : 1;
    return {
      x: (this.v1.x * 0.5 + 0.5) * this.canvas.clientWidth,
      y: (-this.v1.y * 0.5 + 0.5) * this.canvas.clientHeight,
      on: seen * clear * s.here * ss(14.6, 12.2, dist) * ss(3.6, 5.2, dist),
    };
  }

  /** Screen position just above a tagged piece, for its stack label. */
  tag(i: number) {
    const t = TAGGED[i];
    if (!t) return null;
    this.v1.copy(sq(t[0], t[1])).setY(t[2]).project(this.camera);
    return {
      x: (this.v1.x * 0.5 + 0.5) * this.canvas.clientWidth,
      y: (-this.v1.y * 0.5 + 0.5) * this.canvas.clientHeight,
      on: this.v1.z < 1 && Math.abs(this.v1.x) < 0.84 && this.v1.y < 0.72 && this.v1.y > -0.9,
    };
  }

  /** The visitor plays the reply: the pawn steps onto the lit square. */
  playReply() {
    return new Promise<void>((resolve) => {
      if (this.replyT >= 0) return resolve();
      this.replyT = 0; this.replyResolve = resolve;
      if (!this.running) { this.replyT = 1; this.apply(this.p, 0); this.renderer.shadowMap.needsUpdate = true; this.render(); resolve(); }
    });
  }

  private cameraAt(p: number, t: number) {
    const u = this.pace(p) / this.segments;
    this.path.getPoint(u, this.camera.position);
    this.aim.getPoint(u, this.look);
    if (this.opts.mobile) {
      // portrait: step back along the line of sight so the subject still fits
      this.v1.copy(this.camera.position).sub(this.look).multiplyScalar(p < 0.6 ? 0.16 : 0.1);
      this.camera.position.add(this.v1);
      // the opening looks down the hall on a phone: the wall cannot carry the name in portrait
      this.look.x += (1 - ss(0.07, 0.15, p)) * 3.2;
    }
    const px = this.pointerEased.x, py = this.pointerEased.y;
    this.camera.position.x += px * 0.16;
    this.camera.position.y += py * 0.08 + Math.sin(t * 0.22) * 0.025;
    this.camera.lookAt(this.look.x - px * 0.1, this.look.y, this.look.z);
  }

  private apply(p: number, t: number) {
    this.cameraAt(p, t);

    // the marks on the path. They are not there while the game is being read: each turns into its place, one after
    // the other, as the view comes round to the path. After that each turns to whoever is walking past and rides its
    // own slow swell, a wave passes through its letters, and the square under it lights as it is reached.
    const cam = this.camera.position, vv = p * SPAN;
    this.stations.forEach((s, i) => {
      const dx = cam.x - s.at.x, dz = cam.z - s.at.z;
      const near = ss(17, 9, Math.hypot(dx, dz));
      const here = (s.here = ss(3.5 + i * 0.13, 4.15 + i * 0.13, vv));
      s.holder.visible = here > 0.002;
      s.holder.scale.setScalar(0.55 + 0.45 * here);
      s.holder.rotation.y = Math.atan2(dx, dz) * 0.72 + Math.sin(t * 0.55 + s.phase) * 0.2 + (1 - here) * (i % 2 ? -1.9 : 1.9);
      s.holder.rotation.x = Math.sin(t * 0.41 + s.phase * 1.7) * 0.045;
      s.holder.position.y = FLOAT + Math.sin(t * 0.8 + s.phase) * 0.06 - (1 - here) * 0.5;
      const swell = (0.022 + 0.03 * near) / s.unit;
      for (const part of s.parts) part.node.position.z = Math.sin(t * 1.15 - part.phase) * swell;
      (s.ring.material as THREE.MeshBasicMaterial).opacity = (0.22 + near * 0.6) * here;
      (s.glow.material as THREE.MeshBasicMaterial).opacity = near * 0.3 * here;
      (s.pool.material as THREE.MeshBasicMaterial).opacity = 0.32 * here;
    });

    // air: a slate haze in the hall, darker in the shaft, pale cloud at the top
    const v = p * SPAN;
    const inShaft = ss(9.1, 10.0, v), out = ss(12.4, 13.8, v);
    this.fog.color.copy(this.fogHall).lerp(this.fogShaft, inShaft).lerp(this.fogSky, out);
    const hush = ss(8.5, 9.4, v) * (1 - ss(9.7, 10.5, v));
    this.fog.density = 0.026 + hush * 0.085 - inShaft * 0.008 - out * 0.008;

    // above the rim the cloud closes underneath, and the last board is alone with the sky
    const deck = ss(13.1, 14.1, v);
    this.clouds.forEach((c, i) => {
      (c.material as THREE.MeshBasicMaterial).opacity = deck * (i ? 1 : 0.94);
      c.visible = deck > 0.002;
      const map = (c.material as THREE.MeshBasicMaterial).map!;
      map.offset.set(t * 0.0014 * (i ? 1.7 : 1), t * 0.0009 * (i ? -1 : 1));
    });

    // calculation lines: each one draws itself, holds, and lets go
    const think = (1 - ss(3.5, 4.1, v)) * (0.45 + ss(1.6, 2.4, v) * 0.55);
    for (const a of this.arcs) {
      const k = (t * 0.11 + a.phase) % 1;
      const draw = ss(0, 0.42, k), fade = 1 - ss(0.74, 1, k);
      a.mesh.geometry.setDrawRange(0, Math.floor((a.total * draw) / 3) * 3);
      (a.mesh.material as THREE.MeshBasicMaterial).opacity = think * fade * 0.85;
      (a.ring.material as THREE.MeshBasicMaterial).opacity = think * fade * ss(0.36, 0.52, k) * 0.8;
    }

    for (const m of this.threadMats) m.uniforms.uTime.value = t;
    this.sky.rotation.y = t * 0.0016;

    // the last position
    const fin = ss(13.3, 14.2, v);
    const pulse = 0.6 + Math.sin(t * 1.5) * 0.18;
    const played = this.replyT < 0 ? 0 : ss(0, 1, this.replyT);
    const lit = (0.72 + pulse * 0.35) * (1 - played) + played * 0.45;
    (this.replySquare.material as THREE.MeshBasicMaterial).opacity = fin * Math.min(1, lit);
    (this.replyGlow.material as THREE.MeshBasicMaterial).opacity = fin * lit * 0.5;
    this.replyLight.intensity = fin * (7 + pulse * 5);
    const from = sq(4, 6), to = sq(4, 4);
    this.replyPawn.position.lerpVectors(from, to, played).setY(Math.sin(played * Math.PI) * 0.35);
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private tick = () => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.tick);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    this.p += (this.target - this.p) * (1 - Math.pow(0.003, dt));
    this.pointerEased.lerp(this.pointer, 1 - Math.pow(0.03, dt));
    if (this.replyT >= 0 && this.replyT < 1) {
      this.replyT = Math.min(1, this.replyT + dt / 0.75);
      this.renderer.shadowMap.needsUpdate = true;
      if (this.replyT >= 1 && this.replyResolve) { this.replyResolve(); this.replyResolve = null; }
    }
    this.apply(this.p, t);
    this.render();
  };

  /** One frame, no loop: reduced motion and poster capture. */
  renderStill(p: number) {
    this.p = this.target = clamp(p);
    this.apply(this.p, 0);
    this.render();
  }

  start() {
    if (this.running || this.disposed) return;
    this.running = true; this.clock.start(); this.tick();
  }
  stop() { this.running = false; cancelAnimationFrame(this.raf); this.clock.stop(); }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth, h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    const portrait = w / h < 0.8;
    this.camera.fov = portrait ? 60 : w / h < 1.25 ? 48 : 40;
    this.camera.updateProjectionMatrix();
    if (this.mirror) {
      const k = this.renderer.getPixelRatio() * (this.opts.mobile ? 0.4 : 0.5);
      const mw = Math.max(64, Math.round(w * k)), mh = Math.max(64, Math.round(h * k));
      this.mirror.getRenderTarget().setSize(mw, mh);
      ((this.mirror.material as THREE.ShaderMaterial).uniforms.uTexel.value as THREE.Vector2).set(1 / mw, 1 / mh);
    }
    if (!this.running) { this.apply(this.p, 0); this.render(); }
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry && !(m.geometry as THREE.BufferGeometry).userData.shared) m.geometry.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose?.();
    });
    Object.values(this.tex).forEach((t) => t.dispose());
    this.disposables.forEach((d) => d.dispose());
    this.mirror?.dispose();
    disposePieces();
    this.renderer.dispose();
  }
}
