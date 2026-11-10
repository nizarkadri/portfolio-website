import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { pieceGeometry, disposePieces, PieceKind } from './pieces';

/* ==========================================================================
   The Long Game: one continuous place, rendered live.
   A black stone board at the edge of Lake Ontario at night. Scroll flies one
   camera through it; nothing here is a section.
   ========================================================================== */

export interface WorldOptions {
  mobile: boolean;
  covers: string[];        // three featured project covers
  tower: string[];         // certificate + cover images for the tower
  figure: string;          // alpha cutout portrait
  skyline?: string;        // optional photographic skyline plate
  still?: boolean;         // render on demand only (reduced motion / posters)
}

const EMBER = 0xff8a4c;
const CANVAS = 0x07090c;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ss = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** 0 → 1 → 1 → 0 across [a,b] rise and [c,d] fall. */
const win = (x: number, a: number, b: number, c: number, d: number) => ss(a, b, x) * (1 - ss(c, d, x));
const sq = (file: number, rank: number) => new THREE.Vector3(file - 3.5, 0, 3.5 - rank);

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/* ------------------------------------------------------------- textures */
function canvasTex(size: number, draw: (c: CanvasRenderingContext2D, s: number) => void, srgb = true) {
  const el = document.createElement('canvas');
  el.width = el.height = size;
  draw(el.getContext('2d')!, size);
  const t = new THREE.CanvasTexture(el);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function boardTex() {
  const r = rng(7);
  return canvasTex(2048, (c, s) => {
    const q = s / 8;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const light = (x + y) % 2 === 0;
      c.fillStyle = light ? '#262d38' : '#0b0e13';
      c.fillRect(x * q, y * q, q, q);
      // veining, so the stone is not a flat fill
      c.save();
      c.beginPath(); c.rect(x * q, y * q, q, q); c.clip();
      for (let i = 0; i < 7; i++) {
        c.strokeStyle = light ? `rgba(160,180,205,${0.03 + r() * 0.06})` : `rgba(120,140,170,${0.02 + r() * 0.04})`;
        c.lineWidth = 0.6 + r() * 2.4;
        c.beginPath();
        let px = x * q + r() * q, py = y * q + r() * q;
        c.moveTo(px, py);
        for (let k = 0; k < 5; k++) { px += (r() - 0.5) * q * 0.7; py += (r() - 0.5) * q * 0.7; c.lineTo(px, py); }
        c.stroke();
      }
      c.restore();
      c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 3; c.strokeRect(x * q + 1.5, y * q + 1.5, q - 3, q - 3);
    }
  });
}

/** Circuit traces etched into every square: the board thinks. */
function traceTex() {
  const r = rng(21);
  return canvasTex(2048, (c, s) => {
    c.fillStyle = '#000'; c.fillRect(0, 0, s, s);
    const q = s / 8;
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const n = 2 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) {
        const g = q / 8;
        let px = x * q + g * (1 + Math.floor(r() * 7));
        let py = y * q + g * (1 + Math.floor(r() * 7));
        const a = 0.35 + r() * 0.65;
        c.strokeStyle = `rgba(255,150,90,${a})`; c.fillStyle = `rgba(255,190,140,${a})`;
        c.lineWidth = 2.2;
        c.beginPath(); c.arc(px, py, 4.5, 0, 7); c.fill();
        c.beginPath(); c.moveTo(px, py);
        let dir = Math.floor(r() * 4);
        for (let k = 0; k < 4; k++) {
          const len = g * (1 + Math.floor(r() * 3));
          const dx = [1, 0, -1, 0][dir], dy = [0, 1, 0, -1][dir];
          px = clamp(px + dx * len, x * q + g * 0.6, (x + 1) * q - g * 0.6);
          py = clamp(py + dy * len, y * q + g * 0.6, (y + 1) * q - g * 0.6);
          c.lineTo(px, py);
          dir = (dir + (r() > 0.5 ? 1 : 3)) % 4;
        }
        c.stroke();
        c.beginPath(); c.arc(px, py, 4.5, 0, 7); c.fill();
      }
    }
  });
}

function cloudTex() {
  const r = rng(3);
  return canvasTex(256, (c, s) => {
    for (let i = 0; i < 26; i++) {
      const x = s * (0.2 + r() * 0.6), y = s * (0.3 + r() * 0.4), rad = s * (0.1 + r() * 0.24);
      const g = c.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, 'rgba(255,255,255,0.14)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.fillRect(0, 0, s, s);
    }
  });
}

function glowTex() {
  return canvasTex(128, (c, s) => {
    const g = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.4)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, s, s);
  });
}

function windowTex(seed: number) {
  const r = rng(seed);
  return canvasTex(128, (c, s) => {
    c.fillStyle = '#05070a'; c.fillRect(0, 0, s, s);
    const cols = 8, rows = 22, w = s / cols, h = s / rows;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const v = r();
      if (v > 0.6) {
        c.fillStyle = v > 0.93 ? 'rgba(255,170,110,0.95)' : `rgba(${150 + r() * 60},${180 + r() * 50},${220 + r() * 35},${0.25 + r() * 0.6})`;
        c.fillRect(x * w + w * 0.2, y * h + h * 0.25, w * 0.6, h * 0.5);
      }
    }
  });
}

function skyTex() {
  return canvasTex(512, (c, s) => {
    const g = c.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, '#020305'); g.addColorStop(0.42, '#060a11'); g.addColorStop(0.5, '#101a28');
    g.addColorStop(0.53, '#1c2530'); g.addColorStop(0.56, '#0a0f16'); g.addColorStop(1, '#030507');
    c.fillStyle = g; c.fillRect(0, 0, s, s);
    const r = rng(11);
    for (let i = 0; i < 220; i++) {
      c.fillStyle = `rgba(210,225,255,${0.15 + r() * 0.5})`;
      c.fillRect(r() * s, r() * s * 0.4, 1, 1);
    }
  });
}

function doorwayTex() {
  return canvasTex(256, (c, s) => {
    const g = c.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, '#fff3e2'); g.addColorStop(0.55, '#ffc48f'); g.addColorStop(1, '#ff8a4c');
    c.fillStyle = g; c.fillRect(0, 0, s, s);
  });
}

function reservedTex() {
  return canvasTex(256, (c, s) => {
    c.fillStyle = '#0d1117'; c.fillRect(0, 0, s, s);
    c.strokeStyle = 'rgba(255,138,76,0.5)'; c.lineWidth = 2; c.setLineDash([10, 10]);
    c.strokeRect(22, 22, s - 44, s - 44);
  });
}

/* ------------------------------------------------------------- the world */
interface Key { p: number; pos: [number, number, number]; look: [number, number, number] }

const KEYS: Key[] = [
  { p: 0.0, pos: [5.6, 2.5, 7.9], look: [-4.0, 1.0, 0.4] },
  { p: 0.11, pos: [4.9, 2.15, 7.0], look: [-3.7, 1.05, 0.4] },
  { p: 0.2, pos: [-2.2, 0.85, 4.6], look: [4.2, 1.25, -1.4] },
  { p: 0.32, pos: [-1.5, 0.78, 3.9], look: [4.6, 1.3, -1.6] },
  { p: 0.39, pos: [0, 1.7, 10.8], look: [0, 1.0, 2.6] },
  { p: 0.52, pos: [0, 1.55, 9.9], look: [0, 1.0, 2.6] },
  { p: 0.585, pos: [-3.4, 2.3, 4.6], look: [9, 5.2, -70] },
  { p: 0.665, pos: [-3.0, 2.7, 2.6], look: [11, 6.2, -70] },
  { p: 0.725, pos: [0.4, 1.6, 10.8], look: [-1.7, 2.6, 0] },
  { p: 0.775, pos: [0.9, 2.1, 10.4], look: [-1.8, 3.8, 0] },
  { p: 0.85, pos: [4.2, 7.5, 12.0], look: [-1.8, 7.4, 0] },
  { p: 0.915, pos: [-2.4, 14.5, 11.0], look: [-1.6, 13.6, 0] },
  { p: 0.955, pos: [0, 8.6, 8.4], look: [0, 0, 2.3] },
  { p: 1.0, pos: [0, 7.8, 7.9], look: [0, 0, 2.2] },
];

const GAME: Array<[PieceKind, number, number, 'dark' | 'bone', number?]> = [
  ['king', 4, 3, 'dark'],
  ['queen', 6, 5, 'bone', 0.4],
  ['rook', 1, 5, 'dark'],
  ['bishop', 2, 4, 'bone'],
  ['knight', 6, 2, 'dark', -2.2],
  ['pawn', 0, 2, 'dark'],
  ['pawn', 3, 2, 'dark'],
  ['pawn', 5, 3, 'bone'],
  ['pawn', 2, 6, 'bone'],
  ['rook', 7, 7, 'bone'],
  ['pawn', 7, 4, 'dark'],
  ['bishop', 4, 6, 'dark'],
];

/** Pieces that carry a label in the HTML layer: [file, rank, height]. Order matches Landing's TAGS. */
const TAGGED: Array<[number, number, number]> = [
  [4, 3, 2.08], [6, 5, 1.9], [1, 5, 1.24], [2, 4, 1.68], [6, 2, 1.44], [3, 2, 1.12],
];

/** Candidate lines the board is "calculating": from square to square, with a lift. */
const LINES: Array<[number, number, number, number, number]> = [
  [6, 2, 4, 3, 1.3], [6, 2, 5, 4, 0.9], [6, 5, 3, 2, 1.5], [2, 4, 5, 7, 1.2], [1, 5, 1, 1, 1.0], [4, 3, 4, 4, 0.5], [6, 5, 6, 7, 0.7],
];

export class World {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private composer: EffectComposer | null = null;
  private bloom: UnrealBloomPass | null = null;
  private clock = new THREE.Clock();
  private raf = 0;
  private running = false;
  private disposed = false;
  private target = 0;
  private p = 0;
  private pointer = new THREE.Vector2();
  private pointerEased = new THREE.Vector2();
  private dirty = true;
  private look = new THREE.Vector3();
  private v1 = new THREE.Vector3();
  private v2 = new THREE.Vector3();
  private loader = new THREE.TextureLoader();
  private fog: THREE.FogExp2;
  private boardMat!: THREE.MeshStandardMaterial;
  private game = new THREE.Group();
  private finale = new THREE.Group();
  private doors: Array<{ group: THREE.Group; leaf: THREE.Group; light: THREE.PointLight; anchor: THREE.Vector3 }> = [];
  private tower = new THREE.Group();
  private towerItems: Array<{ g: THREE.Group; y: number; leaf?: THREE.Group; delay: number }> = [];
  private figure: THREE.Mesh | null = null;
  private mists: Array<{ s: THREE.Sprite; base: THREE.Vector3; sp: number; op: number }> = [];
  private embers!: THREE.Points;
  private kingLight!: THREE.PointLight;
  private kingGlow!: THREE.Sprite;
  private skyline = new THREE.Group();
  private skyMats: THREE.Material[] = [];
  private replySquare!: THREE.Mesh;
  private replyPawn!: THREE.Mesh;
  private replyLight!: THREE.PointLight;
  private replyT = -1;
  private replyResolve: (() => void) | null = null;
  private disposables: Array<{ dispose: () => void }> = [];
  private arcs: Array<{ mesh: THREE.Mesh; ring: THREE.Mesh; total: number; phase: number }> = [];
  private tex: Record<string, THREE.Texture> = {};

  constructor(private canvas: HTMLCanvasElement, private opts: WorldOptions) {
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !opts.mobile, powerPreference: 'high-performance', alpha: false }));
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 1.75));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.15;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.setClearColor(CANVAS, 1);

    this.camera = new THREE.PerspectiveCamera(opts.mobile ? 60 : 40, 1, 0.1, 400);
    this.fog = new THREE.FogExp2(0x080b10, 0.05);
    this.scene.fog = this.fog;

    this.tex.cloud = cloudTex();
    this.tex.glow = glowTex();
    this.tex.doorway = doorwayTex();
    this.tex.reserved = reservedTex();

    this.buildEnvironment();
    this.buildBoard();
    this.buildPieces();
    this.buildArcs();
    this.buildDoors();
    this.buildSkyline();
    this.buildTower();
    this.buildFinale();
    this.buildAtmosphere();

    if (!opts.mobile) {
      const composer = (this.composer = new EffectComposer(r));
      composer.addPass(new RenderPass(this.scene, this.camera));
      this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.62, 0.85, 0.82);
      composer.addPass(this.bloom);
      composer.addPass(new OutputPass());
    }
    this.resize();
    this.apply(0, 0);
  }

  /* ----------------------------------------------------------- building */
  private keep<T extends { dispose: () => void }>(x: T) { this.disposables.push(x); return x; }

  private buildEnvironment() {
    const env = new THREE.Scene();
    env.background = new THREE.Color(0x010203);
    const panel = (color: number, k: number, w: number, h: number, pos: [number, number, number]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
    };
    panel(0x8fb4e6, 2.6, 14, 6, [0, 12, -6]);
    panel(0x5f7fa8, 1.2, 10, 10, [-14, 4, 4]);
    panel(EMBER, 7, 2.2, 3.2, [9, 2.5, 6]);
    panel(0xdfe9ff, 3.2, 1.2, 9, [12, 6, -9]);
    const pm = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.keep(pm.fromScene(env, 0.03)).texture;
    pm.dispose();

    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(300, 32, 16),
      new THREE.MeshBasicMaterial({ map: (this.tex.sky = skyTex()), side: THREE.BackSide, fog: false, depthWrite: false })
    );
    this.scene.add(sky);

    this.scene.add(new THREE.HemisphereLight(0x2a3b50, 0x05070a, 0.55));
    const moon = new THREE.SpotLight(0xb9d0f2, 520, 60, 0.42, 0.7, 1.6);
    moon.position.set(-9, 15, -11);
    moon.target.position.set(0.5, 0, 0.5);
    moon.castShadow = true;
    moon.shadow.mapSize.set(this.opts.mobile ? 1024 : 2048, this.opts.mobile ? 1024 : 2048);
    moon.shadow.bias = -0.0004;
    moon.shadow.radius = 5;
    this.scene.add(moon, moon.target);
    const fill = new THREE.DirectionalLight(0x6f8fb8, 0.5);
    fill.position.set(8, 6, 10);
    this.scene.add(fill);
  }

  private buildBoard() {
    const traces = (this.tex.traces = traceTex());
    this.boardMat = new THREE.MeshStandardMaterial({
      map: (this.tex.board = boardTex()), roughness: 0.34, metalness: 0.25, envMapIntensity: 0.8,
      emissive: new THREE.Color(EMBER), emissiveMap: traces, emissiveIntensity: 0.2,
    });
    const top = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), this.boardMat);
    top.rotation.x = -Math.PI / 2; top.receiveShadow = true;
    const stone = new THREE.MeshStandardMaterial({ color: 0x0b0e13, roughness: 0.3, metalness: 0.4 });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(8.7, 0.6, 8.7), stone);
    slab.position.y = -0.302; slab.receiveShadow = true; slab.castShadow = true;
    const lip = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.16, 9.2), stone);
    lip.position.y = -0.68;
    // the lake: black, still, catching whatever light there is
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      new THREE.MeshStandardMaterial({ color: 0x04070a, roughness: 0.08, metalness: 0.92, envMapIntensity: 0.9, transparent: true, opacity: 0.86 })
    );
    water.rotation.x = -Math.PI / 2; water.position.y = -0.74;
    this.scene.add(top, slab, lip, water);

    // the square that waits for the reply (e5)
    this.replySquare = new THREE.Mesh(
      new THREE.PlaneGeometry(0.94, 0.94),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(EMBER).multiplyScalar(1.6), transparent: true, opacity: 0, toneMapped: false, depthWrite: false })
    );
    this.replySquare.rotation.x = -Math.PI / 2;
    this.replySquare.position.copy(sq(4, 4)).setY(0.004);
    this.scene.add(this.replySquare);
  }

  private stone(kind: 'dark' | 'bone') {
    return kind === 'dark'
      ? new THREE.MeshPhysicalMaterial({ color: 0x0b0e13, roughness: 0.2, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.5 })
      : new THREE.MeshPhysicalMaterial({ color: 0xa7a299, roughness: 0.34, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.25, envMapIntensity: 0.8 });
  }

  private piece(kind: PieceKind, at: THREE.Vector3, mat: THREE.Material, ry = 0) {
    const m = new THREE.Mesh(pieceGeometry(kind), mat);
    m.position.copy(at); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  private buildPieces() {
    const dark = this.stone('dark'), bone = this.stone('bone');
    for (const [kind, f, r, c, ry] of GAME) this.game.add(this.piece(kind, sq(f, r), c === 'dark' ? dark : bone, ry ?? 0));
    this.scene.add(this.game);

    const k = sq(4, 3);
    this.kingLight = new THREE.PointLight(EMBER, 30, 9, 1.8);
    this.kingLight.position.set(k.x - 0.35, 1.5, k.z - 0.9);
    this.kingGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tex.glow, color: EMBER, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.6, fog: false }));
    this.kingGlow.position.set(k.x, 1.25, k.z - 0.25); this.kingGlow.scale.setScalar(4.2);
    this.scene.add(this.kingLight, this.kingGlow);

    // embers rising round the king
    const n = 90, pos = new Float32Array(n * 3), r = rng(5);
    for (let i = 0; i < n; i++) { pos[i * 3] = k.x + (r() - 0.5) * 1.6; pos[i * 3 + 1] = r() * 3; pos[i * 3 + 2] = k.z + (r() - 0.5) * 1.6; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.embers = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffb27a, size: 0.035, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, map: this.tex.glow }));
    this.scene.add(this.embers);
  }

  /** The search made visible: ember lines arcing from a piece to the squares it is considering. */
  private buildArcs() {
    const mat = () => new THREE.MeshBasicMaterial({ color: new THREE.Color(EMBER).multiplyScalar(1.7), transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
    LINES.forEach(([f1, r1, f2, r2, lift], i) => {
      const a = sq(f1, r1).setY(0.05), b = sq(f2, r2).setY(0.05);
      const mid = a.clone().lerp(b, 0.5).setY(lift);
      const geo = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 48, 0.013, 6, false);
      const mesh = new THREE.Mesh(geo, mat());
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.36, 4, 1, Math.PI / 4), mat());
      ring.rotation.x = -Math.PI / 2; ring.position.copy(b).setY(0.012);
      this.game.add(mesh, ring);
      this.arcs.push({ mesh, ring, total: geo.index ? geo.index.count : 0, phase: i * 0.37 });
    });
  }

  private image(url: string, onLoad?: (t: THREE.Texture) => void) {
    const t = this.loader.load(url, (tx) => { this.dirty = true; onLoad?.(tx); });
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return this.keep(t);
  }

  /** A lit doorway: frame, an open leaf on a hinge, and whatever is behind it. */
  private door(w: number, h: number, tex: THREE.Texture | null, leafOpen: boolean, bright = 1.25) {
    const g = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0c1016, roughness: 0.35, metalness: 0.6 });
    const t = 0.07;
    const bar = (bw: number, bh: number, x: number, y: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.12), frameMat); m.position.set(x, y, 0); m.castShadow = true; g.add(m);
    };
    bar(w + t * 2, t, 0, h + t / 2); bar(t, h, -w / 2 - t / 2, h / 2); bar(t, h, w / 2 + t / 2, h / 2);
    const picture = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: tex ?? this.tex.doorway, color: new THREE.Color(0xffffff).multiplyScalar(bright), toneMapped: false, side: THREE.DoubleSide })
    );
    picture.position.set(0, h / 2, 0);
    g.add(picture);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tex.glow, color: 0xffc9a0, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.2 }));
    halo.position.set(0, h / 2, -0.1); halo.scale.set(w * 3.2, h * 2.2, 1);
    g.add(halo);
    const leaf = new THREE.Group();
    if (leafOpen) {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x2b3038, roughness: 0.62, metalness: 0.2 })
      );
      panel.position.set(w / 2, h / 2, 0); panel.castShadow = true;
      leaf.add(panel);
      leaf.position.set(-w / 2, 0, 0.07);
      g.add(leaf);
    }
    return { g, leaf };
  }

  private buildDoors() {
    const xs = this.opts.mobile ? [-1.5, 0, 1.5] : [-2.5, 0, 2.5];
    const w = this.opts.mobile ? 1.1 : 1.5, h = this.opts.mobile ? 1.65 : 2.25;
    xs.forEach((x, i) => {
      // covers are landscape; the doorway is portrait, so crop to fill it rather than squash
      const tex = this.opts.covers[i] ? this.image(this.opts.covers[i], (t) => {
        const img = t.image as HTMLImageElement;
        if (!img?.width) return;
        const k = (w / h) / (img.width / img.height);
        if (k < 1) { t.repeat.set(k, 1); t.offset.set((1 - k) / 2, 0); } else { t.repeat.set(1, 1 / k); t.offset.set(0, (1 - 1 / k) / 2); }
        t.needsUpdate = true;
      }) : null;
      const { g, leaf } = this.door(w, h, tex, true, 1.75);
      g.position.set(x, 0, 2.6 - Math.abs(x) * 0.12);
      g.rotation.y = -x * 0.09;
      const light = new THREE.PointLight(0xffb27a, 0, 6, 1.7);
      light.position.set(0, h * 0.5, 1.1);
      g.add(light);
      this.scene.add(g);
      this.doors.push({ group: g, leaf, light, anchor: new THREE.Vector3(x, 0, g.position.z) });
    });
  }

  private buildSkyline() {
    const r = rng(41);
    const mats = [1, 2, 3, 4].map((s) => {
      const m = new THREE.MeshBasicMaterial({ map: (this.tex['win' + s] = windowTex(s * 13)), fog: false, transparent: true });
      this.skyMats.push(m); return m;
    });
    const box = new THREE.BoxGeometry(1, 1, 1);
    for (let i = 0; i < 64; i++) {
      const x = -70 + r() * 140;
      const near = Math.abs(x - 6) < 34;
      const h = (near ? 6 + r() * 16 : 2 + r() * 7) * (r() > 0.9 ? 1.5 : 1);
      const w = 2 + r() * 3.5;
      const m = new THREE.Mesh(box, mats[i % 4]);
      m.scale.set(w, h, w); m.position.set(x, h / 2 - 0.7, -78 - r() * 16);
      this.skyline.add(m);
    }
    // the CN Tower, standing on the far rank like one more piece
    const tower = new THREE.Group();
    const dark = new THREE.MeshBasicMaterial({ color: 0x1a2330, fog: false, transparent: true });
    this.skyMats.push(dark);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 1.25, 26, 12), dark); shaft.position.y = 13;
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.2, 1.5, 24), dark); pod.position.y = 26.4;
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.28, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(EMBER).multiplyScalar(1.5), fog: false, transparent: true, toneMapped: false }));
    ring.position.y = 26.5; this.skyMats.push(ring.material as THREE.Material);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.5, 1.6, 20), dark); cap.position.y = 27.9;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.3, 11, 8), dark); mast.position.y = 34;
    const tip = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tex.glow, color: 0xff5a3a, blending: THREE.AdditiveBlending, fog: false, depthWrite: false }));
    tip.position.y = 39.6; tip.scale.setScalar(2.2); this.skyMats.push(tip.material);
    tower.add(shaft, pod, ring, cap, mast, tip);
    tower.position.set(12, -0.7, -80);
    this.skyline.add(tower);
    // horizon glow behind the city
    const haze = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tex.glow, color: 0x35506e, blending: THREE.AdditiveBlending, fog: false, depthWrite: false, opacity: 0.5 }));
    haze.position.set(8, 6, -100); haze.scale.set(190, 46, 1); this.skyMats.push(haze.material);
    this.skyline.add(haze);
    // a pine shoreline off to the west
    const pine = new THREE.MeshBasicMaterial({ color: 0x05080b, fog: false });
    const cone = new THREE.ConeGeometry(1, 1, 7);
    for (let i = 0; i < 46; i++) {
      const m = new THREE.Mesh(cone, pine);
      const h = 3 + r() * 6;
      m.scale.set(1 + r() * 0.9, h, 1 + r() * 0.9); m.position.set(-86 + r() * 44, h / 2 - 0.7, -64 - r() * 10);
      this.skyline.add(m);
    }
    if (this.opts.skyline) {
      const plate = new THREE.Mesh(new THREE.PlaneGeometry(190, 54), new THREE.MeshBasicMaterial({ map: this.image(this.opts.skyline), fog: false, transparent: true }));
      plate.position.set(8, 24, -108); this.skyMats.push(plate.material as THREE.Material); this.skyline.add(plate);
    }
    // mirrored in the lake
    const mirror = this.skyline.clone(); mirror.scale.y = -0.55; mirror.position.y = -1.5;
    this.scene.add(this.skyline, mirror);
  }

  private buildTower() {
    const r = rng(77);
    const imgs = this.opts.tower;
    const N = this.opts.mobile ? 30 : 44;
    for (let i = 0; i < N; i++) {
      const kind = i % 4 === 1 ? 1 : 0; // 1 = open door, otherwise a framed picture
      const w = 0.95 + r() * 0.5, h = kind === 1 ? w * 1.7 : w * (0.74 + r() * 0.3);
      const src = kind !== 1 && imgs.length ? imgs[Math.floor(i * 0.67) % imgs.length] : '';
      const tex = src ? this.image(src, (t) => {
        // hang each picture at its own proportions rather than stretching it to the frame
        const img = t.image as HTMLImageElement;
        if (img?.width) g.scale.y = (img.height / img.width) / (h / w);
      }) : kind === 1 ? null : this.tex.reserved;
      const { g, leaf } = this.door(w, h, tex, kind === 1, kind === 1 ? 1.35 : 0.6);
      const a = i * 2.39996, rad = 1.5 + r() * 1.7;
      const y = 0.5 + i * (this.opts.mobile ? 0.52 : 0.36) + r() * 0.3;
      g.position.set(Math.sin(a) * rad, y, Math.cos(a) * rad);
      g.rotation.set((r() - 0.5) * 0.16, a + (r() - 0.5) * 0.5, (r() - 0.5) * 0.08);
      this.tower.add(g);
      this.towerItems.push({ g, y, leaf: kind === 1 ? leaf : undefined, delay: i / N });
    }
    const core = new THREE.PointLight(0xffb27a, 0, 30, 1.4);
    core.position.set(0, 6, 0); core.name = 'core';
    this.tower.add(core);
    this.tower.visible = false;
    this.scene.add(this.tower);

    const tex = this.image(this.opts.figure, (t) => {
      const img = t.image as HTMLImageElement;
      const hgt = 1.86, wid = hgt * (img.width / img.height);
      this.figure!.geometry.dispose();
      this.figure!.geometry = new THREE.PlaneGeometry(wid, hgt);
      this.figure!.position.y = hgt / 2;
    });
    this.figure = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 1.86),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.08, color: 0x8c96a3, toneMapped: true })
    );
    this.figure.position.set(0.2, 0.93, 3.4);
    this.figure.visible = false;
    this.scene.add(this.figure);
  }

  private buildFinale() {
    const dark = this.stone('dark'), bone = this.stone('bone');
    this.finale.add(
      this.piece('king', sq(4, 0), dark),
      this.piece('pawn', sq(4, 3), dark),
      this.piece('king', sq(4, 7), bone),
    );
    this.replyPawn = this.piece('pawn', sq(4, 6), bone);
    this.finale.add(this.replyPawn);
    this.replyLight = new THREE.PointLight(EMBER, 0, 5, 1.6);
    this.replyLight.position.copy(sq(4, 4)).setY(0.7);
    this.finale.add(this.replyLight);
    this.finale.visible = false;
    this.scene.add(this.finale);
  }

  private buildAtmosphere() {
    const r = rng(9);
    const n = this.opts.mobile ? 12 : 22;
    for (let i = 0; i < n; i++) {
      const mat = new THREE.SpriteMaterial({ map: this.tex.cloud, color: i % 5 === 0 ? 0x6f87a6 : 0x3c4c62, transparent: true, depthWrite: false, opacity: 0.1 });
      const s = new THREE.Sprite(mat);
      const a = r() * Math.PI * 2, rad = 5 + r() * 12;
      const base = new THREE.Vector3(Math.cos(a) * rad, -0.5 + r() * 1.2, Math.sin(a) * rad);
      s.position.copy(base);
      const sc = 7 + r() * 12; s.scale.set(sc, sc * 0.5, 1);
      this.scene.add(s);
      this.mists.push({ s, base, sp: 0.05 + r() * 0.1, op: 0.05 + r() * 0.1 });
    }
  }

  /* ---------------------------------------------------------- per frame */
  setProgress(p: number) { this.target = clamp(p); this.dirty = true; if (this.opts.still) this.p = this.target; }
  setPointer(x: number, y: number) { this.pointer.set(x, y); }

  /** Screen position of a featured door's foot, for the HTML label. */
  project(i: number) {
    const d = this.doors[i];
    if (!d) return null;
    this.v1.copy(d.anchor).project(this.camera);
    return { x: (this.v1.x * 0.5 + 0.5) * this.canvas.clientWidth, y: (-this.v1.y * 0.5 + 0.5) * this.canvas.clientHeight };
  }

  /** Screen position just above a tagged piece, for its stack label. */
  tag(i: number) {
    const t = TAGGED[i];
    if (!t) return null;
    this.v1.copy(sq(t[0], t[1])).setY(t[2] + this.game.position.y).project(this.camera);
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
      this.replyT = 0; this.replyResolve = resolve; this.dirty = true;
      if (!this.running) { this.replyT = 1; this.apply(this.p, 0); this.render(); resolve(); }
    });
  }

  private cameraAt(p: number, t: number) {
    const m = this.opts.mobile;
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
    const a = KEYS[i], b = KEYS[i + 1];
    const k = ss(a.p, b.p, p);
    this.v1.set(a.pos[0], a.pos[1], a.pos[2]).lerp(this.v2.set(b.pos[0], b.pos[1], b.pos[2]), k);
    this.look.set(a.look[0], a.look[1], a.look[2]).lerp(this.v2.set(b.look[0], b.look[1], b.look[2]), k);
    if (m) {
      // portrait: pull the camera back along its own line and recentre the subject
      const far = this.look.z < -20;
      if (!far) { this.look.x *= 0.2; this.v1.sub(this.look).multiplyScalar(1.22).add(this.look); this.v1.y += 0.5; this.look.y -= p > 0.7 && p < 0.93 ? 0.6 : 1.5; }
      else { this.look.x = 12; this.look.y -= 9; }
    }
    const px = this.pointerEased.x, py = this.pointerEased.y;
    this.camera.position.set(this.v1.x + px * 0.38, this.v1.y + py * 0.2 + Math.sin(t * 0.25) * 0.05, this.v1.z);
    this.camera.lookAt(this.look.x - px * 0.25, this.look.y, this.look.z);
  }

  private apply(p: number, t: number) {
    this.cameraAt(p, t);

    // fog: the silence before the tower, and the turn into the last position
    const silence = win(p, 0.655, 0.7, 0.71, 0.76);
    const turn = win(p, 0.905, 0.935, 0.94, 0.965);
    this.fog.density = 0.05 + silence * 0.32 + turn * 0.3 - ss(0.5, 0.6, p) * (1 - ss(0.66, 0.7, p)) * 0.022;

    // the game position holds until the fog takes it
    const gameOn = 1 - ss(0.69, 0.715, p);
    this.game.visible = gameOn > 0.01;
    this.game.position.y = -(1 - gameOn) * 2.4;
    const king = gameOn * (0.75 + Math.sin(t * 1.3) * 0.08);
    this.kingLight.intensity = 34 * king;
    (this.kingGlow.material as THREE.SpriteMaterial).opacity = 0.5 * king;
    (this.embers.material as THREE.PointsMaterial).opacity = 0.9 * gameOn;
    this.embers.visible = gameOn > 0.01;
    const ep = this.embers.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < ep.count; i++) { let y = ep.getY(i) + 0.004 + (i % 7) * 0.0006; if (y > 3) y = 0; ep.setY(i, y); }
    ep.needsUpdate = true;

    // calculation lines: each one draws itself, holds, and lets go; busier while he calculates
    const think = (1 - ss(0.33, 0.38, p)) * (0.55 + ss(0.13, 0.22, p) * 0.45);
    for (const a of this.arcs) {
      const k = (t * 0.16 + a.phase) % 1;
      const draw = ss(0, 0.4, k), fade = 1 - ss(0.78, 1, k);
      a.mesh.geometry.setDrawRange(0, Math.floor((a.total * draw) / 3) * 3);
      (a.mesh.material as THREE.MeshBasicMaterial).opacity = think * fade * 0.9;
      (a.ring.material as THREE.MeshBasicMaterial).opacity = think * fade * ss(0.35, 0.5, k);
    }

    // traces: quiet, then awake while he calculates, then one square
    this.boardMat.emissiveIntensity = 0.5 + win(p, 0.14, 0.22, 0.32, 0.4) * 1.2 + win(p, 0.36, 0.42, 0.52, 0.58) * 0.35 + ss(0.94, 1, p) * 0.1;

    // three doors
    this.doors.forEach((d, i) => {
      const up = win(p, 0.335 + i * 0.012, 0.385 + i * 0.012, 0.535, 0.575);
      d.group.visible = up > 0.005;
      d.group.position.y = -(1 - up) * 3.2;
      d.leaf.rotation.y = -ss(0.37 + i * 0.012, 0.45 + i * 0.012, p) * 1.42;
      d.light.intensity = up * 6;
    });

    // the city
    const city = 0.3 + win(p, 0.5, 0.6, 0.67, 0.71) * 0.7 - ss(0.69, 0.72, p) * 0.3 + ss(0.94, 1, p) * 0.25;
    for (const m of this.skyMats) (m as THREE.MeshBasicMaterial).opacity = clamp(city) * (1 - silence) * (1 - turn);

    // the tower
    const rise = ss(0.7, 0.8, p), gone = ss(0.925, 0.945, p);
    this.tower.visible = rise > 0.001 && gone < 0.999;
    if (this.tower.visible) {
      this.tower.rotation.y = (p - 0.7) * 2.6 + t * 0.012;
      for (const it of this.towerItems) {
        const k = ss(it.delay * 0.55, it.delay * 0.55 + 0.45, rise);
        it.g.position.y = it.y - (1 - k) * (9 + it.y * 0.4) - gone * 30;
        it.g.visible = k > 0.002;
        if (it.leaf) it.leaf.rotation.y = -1.5 * ss(it.delay * 0.6 + 0.2, it.delay * 0.6 + 0.6, ss(0.72, 0.9, p));
      }
      (this.tower.getObjectByName('core') as THREE.PointLight).intensity = rise * (1 - gone) * 60;
    }
    if (this.figure) {
      const f = ss(0.705, 0.735, p) * (1 - ss(0.8, 0.835, p));
      this.figure.visible = f > 0.01;
      (this.figure.material as THREE.MeshBasicMaterial).opacity = f;
      this.figure.rotation.y = Math.atan2(this.camera.position.x - this.figure.position.x, this.camera.position.z - this.figure.position.z);
    }

    // the last position
    const fin = ss(0.938, 0.96, p);
    this.finale.visible = fin > 0.01;
    this.finale.position.y = -(1 - fin) * 1.5;
    const pulse = 0.55 + Math.sin(t * 2.2) * 0.25;
    const played = this.replyT < 0 ? 0 : ss(0, 1, this.replyT);
    (this.replySquare.material as THREE.MeshBasicMaterial).opacity = fin * (pulse * (1 - played) + played * 0.25) * 0.75;
    this.replyLight.intensity = fin * (10 + pulse * 10);
    const from = sq(4, 6), to = sq(4, 4);
    this.replyPawn.position.lerpVectors(from, to, played).setY(Math.sin(played * Math.PI) * 0.35);

    // mist drifts; bloom opens for the tower
    for (const m of this.mists) {
      m.s.position.x = m.base.x + Math.sin(t * m.sp + m.base.z) * 1.6;
      m.s.position.z = m.base.z + Math.cos(t * m.sp * 0.7 + m.base.x) * 1.2;
      (m.s.material as THREE.SpriteMaterial).opacity = m.op * (1 + silence * 2.2 + turn * 2) * (1 - ss(0.74, 0.8, p) * 0.5);
    }
    if (this.bloom) this.bloom.strength = 0.6 + win(p, 0.72, 0.8, 0.9, 0.94) * 0.35;
  }

  private render() {
    if (this.composer) this.composer.render(); else this.renderer.render(this.scene, this.camera);
  }

  private tick = () => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.tick);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    this.p += (this.target - this.p) * (1 - Math.pow(0.0012, dt));
    this.pointerEased.lerp(this.pointer, 1 - Math.pow(0.02, dt));
    if (this.replyT >= 0 && this.replyT < 1) {
      this.replyT = Math.min(1, this.replyT + dt / 0.75);
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
    this.composer?.setSize(w, h);
    this.camera.aspect = w / h;
    const portrait = w / h < 0.8;
    this.camera.fov = portrait ? 60 : w / h < 1.25 ? 48 : 40;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
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
    disposePieces();
    this.composer?.dispose();
    this.renderer.dispose();
  }
}
