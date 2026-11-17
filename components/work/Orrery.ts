import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { MIRROR } from '../world/mirror';
import { asTexture, gradientCanvas, radialCanvas, stoneCanvas } from '../world/textures';

/* ==========================================================================
   The work, as a small world: a black lake in a white cave, light falling through an
   opening in the roof, a round podium of stone on a block of lit crystal, and
   every project a matte globe on a ring that curves round behind it. The
   project you are on leaves the ring and hangs just over the podium in the
   crystal's light; its stack is written round the crystal itself.
   Everything is a pure function of one number (which project, as a fraction),
   so nothing can pop: it can only glide.
   ========================================================================== */

export interface OrreryOptions {
  covers: string[];        // one picture per project ('' when it has none)
  stacks: string[][];      // what each project runs on
  mobile: boolean;
  font?: string;           // the mono face, for the words on the crystal
}

const AIR = 0x1f2a31;                               // a dark cool haze: the light comes from the objects in it
const TEAL = 0x12c9cf;                              // the one accent: where light comes from
const ARC = 0.33;                                   // radians between globes on the ring
const RING_R = 5.5;
const RING_Y = 2.3;
const FOCUS = new THREE.Vector3(0, 3.55, 0);        // just over the podium
const BIG = 2.0;
const ROW_Y = 6.3, ROW_Z = -11, ROW_GAP = 3.6;      // the waiting globes hang in one straight row, high at the back
const OPEN = new THREE.Vector3(-3.6, 8.1, -12.5);   // the opening in the roof of the cave
const OPEN_R = 3.6;

type Spot = [x: number, z: number, size: number];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => { const k = clamp(t); return k * k * (3 - 2 * k); };
const rnd = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

/** Where a waiting globe hangs when it is `d` places from the one over the podium: one straight row, high at the back. */
function slot(d: number, out: THREE.Vector3) {
  return out.set(d * ROW_GAP, ROW_Y, ROW_Z);
}
void ARC; void RING_R; void RING_Y;

export class Orrery {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private running = false;
  private disposed = false;
  private f = 0;
  private target = 0;
  private pointer = new THREE.Vector2();
  private eased = new THREE.Vector2();
  private ray = new THREE.Raycaster();
  private v = new THREE.Vector3();
  private planets: Array<{ mesh: THREE.Mesh; card: THREE.Mesh; smoke: THREE.Mesh; halo: THREE.Sprite; small: number; lean: number; focus: number }> = [];
  private ring = new THREE.Group();
  private aura!: THREE.Sprite;
  private pool!: THREE.Mesh;
  private lift!: THREE.PointLight;
  private shafts: Array<{ mesh: THREE.Mesh; phase: number; base: number }> = [];
  private mirror: Reflector | null = null;
  private keep: Array<{ dispose: () => void }> = [];
  private loader = new THREE.ImageLoader();
  private glow!: THREE.Texture;                     // the soft round glow, shared by every pool of light
  private band!: THREE.Mesh;
  private bandCanvas = document.createElement('canvas');
  private bandTex!: THREE.CanvasTexture;
  private bandFor = -1;
  private water!: THREE.ShaderMaterial;
  private stream!: THREE.ShaderMaterial;
  private podium: THREE.Mesh | null = null;
  private floes: Array<{ pts: THREE.Vector2[]; dist: number[]; len: number; at: number; lat: number; speed: number; w: number; size: number; spin: number }> = [];
  private floeMesh: THREE.InstancedMesh | null = null;
  private smokeTime = { value: 0 };
  private relics: Array<{ g: THREE.Object3D; pool: THREE.Mesh; h: number; y: number; ry: number; ph: number; wide: Spot; tall: Spot }> = [];
  private roofGlow: THREE.Vector3[] = [];
  private relicTime: { value: number } = { value: 0 };
  private mist: Array<{ s: THREE.Sprite; z: number; y: number; w: number; rate: number; off: number; peak: number }> = [];

  constructor(private canvas: HTMLCanvasElement, private opts: OrreryOptions) {
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false, stencil: true }));
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 1.75));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NeutralToneMapping;
    r.toneMappingExposure = 1.0;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.setClearColor(AIR, 1);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
    this.scene.fog = new THREE.FogExp2(AIR, 0.018);
    this.glow = this.own(asTexture(radialCanvas(256, [[0, 'rgba(255,255,255,0.95)'], [0.3, 'rgba(255,255,255,0.55)'], [0.62, 'rgba(255,255,255,0.16)'], [1, 'rgba(255,255,255,0)']])));

    this.buildAir();
    this.buildLake();
    this.buildStreams();
    this.buildPodium();
    this.buildCave();
    this.buildRelics();
    this.buildGlobes();
    // no ray from the roof: the only light is what glows

    this.resize();
    this.apply(0);
    try { r.compile(this.scene, this.camera); } catch { /* a warm-up, never a requirement */ }
  }

  private own<T extends { dispose: () => void }>(x: T) { this.keep.push(x); return x; }

  /** White with cracks the blue of the lake: a few long ones running mostly downward, each with short branches. */
  private crackCanvas(seed: number, ground = '#ffffff', line = '#3aaed2') {
    const W = 1024, H = 512;
    const el = document.createElement('canvas');
    el.width = W; el.height = H;
    const g = el.getContext('2d')!;
    g.fillStyle = ground; g.fillRect(0, 0, W, H);
    g.strokeStyle = line; g.lineCap = 'round'; g.lineJoin = 'round';
    let k = 0;
    const r = () => rnd(seed * 131 + k++, 71);
    const run = (x: number, y: number, ang: number, len: number, width: number, depth: number) => {
      const steps = Math.ceil(len / 12);
      for (let i = 0; i < steps; i++) {
        ang += (r() - 0.5) * 0.8;
        const nx = x + Math.cos(ang) * 12, ny = y + Math.sin(ang) * 12;
        g.lineWidth = Math.max(0.6, width * (1 - (i / steps) * 0.85));
        g.beginPath(); g.moveTo(x, y); g.lineTo(nx, ny); g.stroke();
        x = nx; y = ny;
        if (depth < 2 && r() < 0.09) run(x, y, ang + (r() < 0.5 ? 1 : -1) * (0.5 + r() * 0.7), len * 0.4, width * 0.6, depth + 1);
      }
    };
    for (let c = 0; c < 4; c++) run(r() * W, r() * H * 0.4, Math.PI / 2 + (r() - 0.5) * 0.9, 160 + r() * 200, 1.6 + r() * 1.6, 0);
    return el;
  }

  /** One wisp of mist: many faint round puffs, wider than tall, soft at every edge. */
  private wispCanvas() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    const g = c.getContext('2d')!;
    for (let i = 0; i < 26; i++) {
      const x = 40 + rnd(i, 61) * 176, y = 50 + rnd(i, 62) * 28, r = 16 + rnd(i, 63) * 26;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, 'rgba(255,255,255,0.34)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    return c;
  }

  /** Sky, reflections and light. Form comes from the light: one key, one blue light from behind. */
  private buildAir() {
    const skyTex = this.own(asTexture(gradientCanvas([[0, '#2a3740'], [0.4, '#243039'], [0.5, '#1f2a31'], [0.62, '#1b252b'], [1, '#141c21']])));
    const sky = new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false }));
    this.scene.add(sky);

    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(50, 24, 12), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide })));
    const lamp = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xeaf5ff).multiplyScalar(1.6), side: THREE.DoubleSide }));
    lamp.position.set(-6, 14, 4); lamp.lookAt(0, 0, 0); env.add(lamp);
    const pm = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.own(pm.fromScene(env, 0.04)).texture;
    this.scene.environmentIntensity = 0.3;
    pm.dispose();

    // low ambient, so every round thing has a lit side and a side in shade
    this.scene.add(new THREE.HemisphereLight(0x8fbfc6, 0x1c262c, 0.38));
    const key = new THREE.DirectionalLight(0xffffff, 0);
    key.position.set(-6, 13, 7);
    key.target.position.set(0, 1.5, -1);
    key.castShadow = false;                        // no lamp overhead, so nothing casts its shadow
    const kc = key.shadow.camera;
    kc.left = -9; kc.right = 9; kc.top = 9; kc.bottom = -9; kc.near = 2; kc.far = 34;
    key.shadow.mapSize.set(this.opts.mobile ? 1024 : 2048, this.opts.mobile ? 1024 : 2048);
    key.shadow.bias = -0.0006; key.shadow.normalBias = 0.03;
    this.scene.add(key, key.target);
    // the daylight from the opening, behind and above: a pale edge on whatever faces away from you
    const rim = new THREE.DirectionalLight(0xe6fbfb, 0);
    rim.position.copy(OPEN);
    rim.target.position.set(0, 2, 0);
    this.scene.add(rim, rim.target);
  }

  /** A white shore in front, and behind the podium a light-blue lake whose water slowly runs past. */
  private buildLake() {
    const shore = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshStandardMaterial({
        color: 0x8d9aa2, roughness: 1, metalness: 0, envMapIntensity: 0.2,
        // the cracks mark the stencil first; the ice is left out wherever they did
        stencilWrite: true, stencilRef: 1, stencilFunc: THREE.NotEqualStencilFunc,
        stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp,
      })
    );
    shore.rotation.x = -Math.PI / 2; shore.receiveShadow = true;
    this.scene.add(shore);

    // the water's near edge curves round just behind the podium
    const R = 30, cz = -(R + 2.5);
    this.water = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
        uTime: { value: 0 },
        uLight: { value: new THREE.Color(0x1f6f7e) },
        uDeep: { value: new THREE.Color(0x0a2c36) },
        uFoam: { value: new THREE.Color(0xffffff) },
      }]),
      vertexShader: /* glsl */ `
        varying vec3 vW;
        #include <fog_pars_vertex>
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vW = w.xyz;
          vec4 mvPosition = viewMatrix * w;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform vec3 uLight; uniform vec3 uDeep; uniform vec3 uFoam;
        varying vec3 vW;
        #include <fog_pars_fragment>
        float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n(vec2 p) {
          vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        void main() {
          vec2 p = vW.xz;
          // the water runs out of the back toward you; long shapes, stretched along the flow
          vec2 q = p * vec2(0.85, 0.28) + vec2(0.0, -uTime * 0.16);
          float a = n(q) * 0.62 + n(q * 2.3 + vec2(uTime * 0.025, -uTime * 0.1)) * 0.38;
          // soft pale lines where the flow folds over: drawn, never sparkling
          float line = smoothstep(0.44, 0.5, a) * (1.0 - smoothstep(0.5, 0.58, a));
          float deep = smoothstep(3.0, 34.0, -p.y);
          vec3 c = mix(uLight, uDeep, deep * 0.55);
          c = mix(c, uFoam, line * 0.08 * (1.0 - deep * 0.6));
          c *= 0.94 + a * 0.12;
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,
      fog: true,
    });
    const lake = new THREE.Mesh(new THREE.CircleGeometry(R, 128), this.water);
    lake.rotation.x = -Math.PI / 2; lake.position.set(0, 0.012, cz);
    this.scene.add(lake);

    const mirror = new Reflector(new THREE.CircleGeometry(R, 128), { textureWidth: 512, textureHeight: 512, clipBias: 0.003, shader: MIRROR, multisample: 0 });
    mirror.rotation.x = -Math.PI / 2; mirror.position.set(0, 0.018, cz);
    const mat = mirror.material as THREE.ShaderMaterial;
    mat.transparent = true; mat.depthWrite = false; mat.uniforms.uStrength.value = 0.42;    // dark water carries the glow of what stands over it
    mirror.renderOrder = 1;
    this.mirror = mirror;
    this.scene.add(mirror);

    // the waterline: a thin lighter edge where the lake meets the shore
    const edge = new THREE.Mesh(
      new THREE.RingGeometry(R - 0.12, R + 0.08, 160),
      new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.7, depthWrite: false })
    );
    edge.rotation.x = -Math.PI / 2; edge.position.set(0, 0.022, cz); edge.renderOrder = 2;
    this.scene.add(edge);

    // low mist over the water: a few soft wisps that drift with the flow, thicken, and thin away again
    const wisp = this.own(asTexture(this.wispCanvas()));
    for (let i = 0; i < 14; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: wisp, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
      s.renderOrder = 6;
      this.mist.push({ s, z: -3.2 - rnd(i, 51) * 8, y: 0.25 + rnd(i, 52) * 0.6, w: 6 + rnd(i, 53) * 6, rate: 0.012 + rnd(i, 54) * 0.01, off: rnd(i, 55), peak: 0 });   // no white mist
      this.scene.add(s);
    }

    // the crystal under the podium lights the shore round it
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), new THREE.MeshBasicMaterial({ map: this.glow, color: TEAL, transparent: true, depthWrite: false, opacity: 0.1 }));
    halo.rotation.x = -Math.PI / 2; halo.position.y = 0.03; halo.renderOrder = 3;
    this.scene.add(halo);
  }

  /**
   * The shore is a sheet of white ice, and the lake runs out under it through open leads: two round
   * either side of the podium that meet in front of it and carry on toward you, thinner cracks
   * branching off. Each lead is a real gap: walls of ice going down, deep teal water at the bottom
   * with stones showing through it, and small floes drifting along.
   */
  private buildStreams() {
    const DEPTH = 0.36;
    this.stream = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
        uTime: { value: 0 },
        uDeep: { value: new THREE.Color(0x13707f) },
        uMid: { value: new THREE.Color(0x3aa6b8) },
        uPale: { value: new THREE.Color(0x9fd6e0) },
      }]),
      vertexShader: /* glsl */ `
        varying vec2 vUv; varying vec3 vW;
        #include <fog_pars_vertex>
        void main() {
          vUv = uv;
          vec4 w = modelMatrix * vec4(position, 1.0);
          vW = w.xyz;
          vec4 mvPosition = viewMatrix * w;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform vec3 uDeep; uniform vec3 uMid; uniform vec3 uPale;
        varying vec2 vUv; varying vec3 vW;
        #include <fog_pars_fragment>
        vec2 h2(vec2 p) { return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
        float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n(vec2 p) {
          vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        // stones on the bed: rounded, of many sizes, some missing; returns how far inside the nearest one we are
        float stones(vec2 p) {
          vec2 i = floor(p), f = fract(p); float best = -1.0;
          for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
            vec2 g = vec2(float(x), float(y)), o = h2(i + g);
            float r = 0.12 + 0.3 * h(i + g + 7.0);
            if (h(i + g + 13.0) < 0.35) continue;
            vec2 q = (g + o - f) * vec2(1.0, 1.3);
            best = max(best, 1.0 - length(q) / r);
          }
          return best;
        }
        void main() {
          float across = abs(vUv.x - 0.5) * 2.0;
          // deep in the middle of the lead, shallow and paler against the ice
          vec3 c = mix(uDeep, uMid, smoothstep(0.15, 0.95, across));
          // pale stones lying on the bottom, seen through the water
          float st = stones(vW.xz * 5.5 + n(vW.xz * 3.0) * 0.6);
          c = mix(c, uPale, smoothstep(0.0, 0.45, st) * (0.28 + across * 0.3) * (0.7 + n(vW.xz * 9.0) * 0.6));
          // the surface moves: slow pale streaks sliding along the lead toward you
          float s = n(vec2(vUv.x * 4.0, vUv.y * 2.2 - uTime * 0.55)) * 0.6 + n(vec2(vUv.x * 9.0, vUv.y * 4.4 - uTime * 0.9)) * 0.4;
          c = mix(c, uPale, smoothstep(0.62, 0.9, s) * 0.35);
          // a light under the water along the middle of the lead, pulsing slowly as it runs toward you
          float glowLine = (1.0 - smoothstep(0.0, 0.85, across)) * (0.7 + 0.3 * sin(vUv.y * 0.9 - uTime * 0.7));
          c += vec3(0.08, 0.62, 0.66) * glowLine * 0.12;
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,
      fog: true, side: THREE.DoubleSide,
    });
    // where the cracks open, the ice is not drawn
    const mask = new THREE.MeshBasicMaterial({
      colorWrite: false, depthWrite: false, side: THREE.DoubleSide,
      stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp,
    });
    // the walls of the lead: white at the top, bluer as they go down into the water
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.6, metalness: 0, envMapIntensity: 0.3, side: THREE.DoubleSide });

    let k = 0;
    const lead = (ctrl: Array<[number, number]>, w0: number, w1: number, floes: number) => {
      // short straight runs that wander, as ice breaks
      const pts: THREE.Vector2[] = [];
      for (let i = 0; i < ctrl.length - 1; i++) {
        const [ax, az] = ctrl[i], [bx, bz] = ctrl[i + 1];
        const dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz), nx = -dz / len, nz = dx / len;
        const steps = Math.max(2, Math.round(len / 0.38));
        for (let j = 0; j < steps; j++) {
          const t = j / steps, off = j === 0 ? 0 : (rnd(k++, 91) - 0.5) * 0.3;
          pts.push(new THREE.Vector2(ax + dx * t + nx * off, az + dz * t + nz * off));
        }
      }
      pts.push(new THREE.Vector2(...ctrl[ctrl.length - 1]));
      const L: THREE.Vector2[] = [], R: THREE.Vector2[] = [], dist: number[] = [];
      let along = 0;
      pts.forEach((p, i) => {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        const tx = b.x - a.x, tz = b.y - a.y, tl = Math.hypot(tx, tz) || 1;
        const u = i / (pts.length - 1);
        const taper = Math.min(1, u * 6);                          // opens out of the lake, not with a square end
        const w = (w0 + (w1 - w0) * u) * taper * 0.5;
        const wl = w * (0.8 + rnd(k++, 92) * 0.4), wr = w * (0.8 + rnd(k++, 93) * 0.4);
        if (i > 0) along += p.distanceTo(pts[i - 1]);
        dist.push(along);
        L.push(new THREE.Vector2(p.x - (tz / tl) * wl, p.y + (tx / tl) * wl));
        R.push(new THREE.Vector2(p.x + (tz / tl) * wr, p.y - (tx / tl) * wr));
      });
      // a flat strip between the two edges, at height y
      const strip = (y: number, mat: THREE.Material, order: number) => {
        const pos: number[] = [], uv: number[] = [], idx: number[] = [];
        L.forEach((l, i) => {
          pos.push(l.x, y, l.y, R[i].x, y, R[i].y);
          uv.push(0, dist[i], 1, dist[i]);
          if (i > 0) { const q = i * 2; idx.push(q - 2, q - 1, q, q - 1, q + 1, q); }
        });
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        geo.setIndex(idx);
        const m = new THREE.Mesh(geo, mat);
        m.renderOrder = order;
        this.scene.add(m);
      };
      strip(0.002, mask, -10);
      strip(-DEPTH + 0.04, this.stream, 0);
      // the two walls: from the ice surface down to the water
      for (const edge of [L, R]) {
        const pos: number[] = [], col: number[] = [], idx: number[] = [];
        edge.forEach((e, i) => {
          pos.push(e.x, 0, e.y, e.x, -DEPTH, e.y);
          col.push(1, 1, 1, 0.5, 0.78, 0.84);
          if (i > 0) { const q = i * 2; idx.push(q - 2, q - 1, q, q - 1, q + 1, q); }
        });
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        geo.setIndex(idx);
        geo.computeVertexNormals();
        this.scene.add(new THREE.Mesh(geo, wallMat));
      }
      // floes: small pieces of ice drifting along the middle of the lead
      for (let f = 0; f < floes; f++) this.floes.push({ pts, dist, len: along, at: rnd(k++, 94), lat: (rnd(k++, 95) - 0.5) * 0.5, speed: 0.05 + rnd(k++, 96) * 0.05, w: w0, size: 0.05 + rnd(k++, 97) * 0.09, spin: rnd(k++, 98) * 6.28 });
    };
    // the two main leads, out of the lake and round the podium, meeting in front of it
    lead([[-5.4, -3.6], [-4.7, -0.9], [-4.0, 1.6], [-2.7, 3.5], [-1.1, 4.7], [0.1, 6.2]], 0.95, 0.7, 9);
    lead([[5.8, -3.7], [4.9, -0.8], [4.2, 1.8], [2.8, 3.7], [1.2, 4.8], [0.1, 6.2]], 0.95, 0.7, 9);
    // from there on toward you
    lead([[0.1, 6.0], [-0.5, 8.0], [0.3, 9.6], [-0.4, 11.5]], 0.8, 0.45, 7);

    const floeGeo = new THREE.DodecahedronGeometry(1, 0);
    this.floeMesh = new THREE.InstancedMesh(floeGeo, new THREE.MeshStandardMaterial({ color: 0xf4f8fa, roughness: 0.55, metalness: 0, envMapIntensity: 0.3 }), this.floes.length);
    this.floeMesh.position.y = -DEPTH + 0.06;
    this.scene.add(this.floeMesh);
    this.placeFloes(0);
  }

  /** Each floe drifts along its lead toward you and, at the end, comes round again from the lake. */
  private placeFloes(t: number) {
    if (!this.floeMesh) return;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    this.floes.forEach((f, i) => {
      const d = (((f.at + t * f.speed / f.len) % 1) + 1) % 1 * f.len;
      let j = 1;
      while (j < f.dist.length - 1 && f.dist[j] < d) j++;
      const a = f.pts[j - 1], b = f.pts[j], u = (d - f.dist[j - 1]) / Math.max(1e-4, f.dist[j] - f.dist[j - 1]);
      const tx = b.x - a.x, tz = b.y - a.y, tl = Math.hypot(tx, tz) || 1;
      const off = f.lat * f.w * 0.5;
      v.set(a.x + tx * u - (tz / tl) * off, 0, a.y + tz * u + (tx / tl) * off);
      e.set(0, f.spin + t * 0.05, 0); q.setFromEuler(e);
      sc.set(f.size * 1.4, f.size * 0.35, f.size);
      m.compose(v, q, sc);
      this.floeMesh!.setMatrixAt(i, m);
    });
    this.floeMesh.instanceMatrix.needsUpdate = true;
  }

  /** The podium: a slab of black stone on a block of teal crystal, with the project's stack written round the crystal. */
  private buildPodium() {
    const crack = this.own(asTexture(stoneCanvas('carrara', 512, 17), [4, 1]));
    // cut, not turned: the crystal has flat faces that catch the light differently
    const geo = new THREE.CylinderGeometry(2.36, 2.54, 0.86, 26, 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < pos.count; k++) {
      const x = pos.getX(k), y = pos.getY(k), z = pos.getZ(k);
      if (Math.hypot(x, z) < 0.01) continue;
      const a = Math.round(Math.atan2(z, x) * 40), h = Math.round(y * 10);
      const j = 1 + (rnd(a * 13 + h * 7, 9) - 0.5) * 0.085;
      pos.setX(k, x * j); pos.setZ(k, z * j);
    }
    geo.computeVertexNormals();
    const crystal = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      map: crack, color: 0x1b3c43, emissive: TEAL, emissiveMap: crack, emissiveIntensity: 0.16,
      roughness: 0.3, metalness: 0, flatShading: true, envMapIntensity: 0.9, transparent: true, opacity: 0.5,
    }));
    crystal.position.y = 0.43; crystal.renderOrder = 4;
    const core = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.62, 0.7, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x9ff7f7).multiplyScalar(2.4) }));   // brighter than white: it is the light
    core.position.y = 0.43;
    const heart = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glow, color: new THREE.Color(0x8ff4f4).multiplyScalar(1.6), transparent: true, opacity: 0.9, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }));
    heart.position.set(0, 0.42, 1.85); heart.scale.set(3.9, 0.8, 1); heart.renderOrder = 5;   // drawn after the shell, so it shines through it
    const lamp = new THREE.PointLight(TEAL, 2.5, 7, 1.8);
    lamp.position.set(0, 0.5, 0);

    const slateTex = this.own(asTexture(stoneCanvas('slate', 256, 5), [2, 2]));
    const slab = new THREE.Mesh(
      new THREE.CylinderGeometry(2.68, 2.68, 0.26, 72),
      new THREE.MeshStandardMaterial({ map: slateTex, color: 0x3a4046, roughness: 0.95, metalness: 0, envMapIntensity: 0.2 })
    );
    slab.position.y = 0.99; slab.castShadow = true; slab.receiveShadow = true;

    // the light that rises off the podium under the globe
    this.pool = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), new THREE.MeshBasicMaterial({ map: this.glow, color: TEAL, transparent: true, depthWrite: false, opacity: 0.85, blending: THREE.AdditiveBlending }));
    this.pool.rotation.x = -Math.PI / 2; this.pool.position.y = 1.125; this.pool.renderOrder = 5;
    this.lift = new THREE.PointLight(TEAL, 4, 6, 1.6);
    this.lift.position.set(0, 1.35, 0);

    // the stack, written round the front of the crystal
    this.bandCanvas.width = 4096; this.bandCanvas.height = 118;
    this.bandTex = this.own(new THREE.CanvasTexture(this.bandCanvas));
    this.bandTex.colorSpace = THREE.SRGBColorSpace; this.bandTex.anisotropy = 16;
    // a flat ring on the ice. u runs round it so the words read left to right from the front (u = 0.5 faces
    // the camera); v runs across it with the tops of the letters toward the podium, away from you
    // the stack circles the base of the globe: a band of words that turns slowly round it. Only its outer face
    // is drawn, so the half behind the glass never shows through backwards
    this.band = new THREE.Mesh(
      new THREE.CylinderGeometry(2.9, 2.9, 0.42, 192, 1, true),
      new THREE.MeshBasicMaterial({ map: this.bandTex, transparent: true, depthWrite: false, opacity: 0, fog: false, side: THREE.FrontSide })
    );
    this.band.rotation.x = 0.12;                   // tipped a little toward you, so it reads as an orbit
    this.band.renderOrder = 10;                    // in front of the glass

    // The podium itself is the owner's asset: a dark stone slab on a ring of lit ice. It is round, so a
    // picture of it turned always to the camera reads as solid from wherever the camera drifts. It is
    // sized to the old slab (2.68 across the radius), its top set at the old top (1.12), and its foot
    // sunk a little into the ice so the ground hides the cut edge.
    const P_W = 5.36, P_H = P_W * 946 / 2242;      // the cut-out's own proportions
    const TOP_ROW = 0.215;                         // centre of its top face, measured from the top of the picture
    const podMat = this.relicMat(false);
    podMat.uniforms.uDim.value = 1.0;
    podMat.uniforms.uTopRow.value = 1 - 0.6;       // above the ice ring (rows 0 to 0.6 from the top) is stone
    podMat.uniforms.uTopDim.value = 0.62;
    podMat.uniforms.uRecolor.value = 1;
    podMat.uniforms.uFoot.value = 0.05;
    // drawn over the ice in front of it (the picture's foot is lower than the ground at its centre, as the near
    // side of a round thing is). The depth test stays on with an always-pass rule, because with the test off
    // nothing is written: then the lake's edge and whatever passes behind would draw over it.
    podMat.depthTest = true; podMat.depthFunc = THREE.AlwaysDepth; podMat.depthWrite = true;
    const pod = new THREE.Mesh(new THREE.PlaneGeometry(P_W, P_H), podMat);
    pod.position.set(0, 1.12 - (0.5 - TOP_ROW) * P_H, 0);
    pod.renderOrder = 1; pod.visible = false;
    new THREE.TextureLoader().load('/images/world/relics/podium-cut.webp', (t) => {
      if (this.disposed) return;
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      podMat.uniforms.uMap.value = t; pod.visible = true; this.own(t);
    });
    this.podium = pod;
    // where it meets the ice: a soft shadow, then its own light spilling out over the ground
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 4.2), new THREE.MeshBasicMaterial({ map: this.glow, color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false }));
    contact.rotation.x = -Math.PI / 2; contact.position.set(0, 0.02, 0.3); contact.renderOrder = 0;
    const spill = new THREE.Mesh(new THREE.PlaneGeometry(10, 6.5), new THREE.MeshBasicMaterial({ map: this.glow, color: 0x39c8ff, transparent: true, opacity: 0.14, depthWrite: false, blending: THREE.AdditiveBlending }));
    spill.rotation.x = -Math.PI / 2; spill.position.set(0, 0.03, 0.8); spill.renderOrder = 0;
    void core; void crystal; void slab;            // the old procedural podium stays defined but is no longer shown
    this.scene.add(contact, spill, pod, lamp, this.pool, this.lift, this.band);
  }

  /** Write one project's stack on the band. Sized to fit, however many there are. */
  private writeBand(i: number) {
    this.bandFor = i;
    const c = this.bandCanvas.getContext('2d')!;
    const W = this.bandCanvas.width, H = this.bandCanvas.height;
    c.clearRect(0, 0, W, H);
    const words = (this.opts.stacks[i] || []).slice(0, 4).map((t) => t.toUpperCase());
    if (!words.length) { this.bandTex.needsUpdate = true; return; }
    const family = `${this.opts.font ? this.opts.font + ', ' : ''}ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    // the words go round and round: repeated until the band is full, sized so whole repeats fit
    const unit = words.join('   ·   ') + '   ·   ';
    let size = 64;
    c.font = `600 ${size}px ${family}`;
    const uw = c.measureText(unit).width;
    const reps = 3;                                          // a third of the way round each: the front shows one whole set
    size = Math.min(66, Math.floor(size * (W / (uw * reps)) * 0.94));
    c.font = `600 ${size}px ${family}`;
    c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillStyle = '#e8fbfc';                                 // pale ink, lit by the podium's blue
    const step = W / reps;
    for (let r = 0; r < reps; r++) c.fillText(unit, r * step + (step - c.measureText(unit).width) / 2, H / 2 + 2);
    this.bandTex.needsUpdate = true;
  }

  /** Stone shaped by slow noise: boulders, the walls of the cave, what hangs from its roof. */
  private stoneShape(seed: number, rough: number) {
    const geo = new THREE.SphereGeometry(1, 64, 44);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let k = 0; k < pos.count; k++) {
      v.fromBufferAttribute(pos, k);
      const n = Math.sin(v.x * 2.1 + seed) * Math.cos(v.y * 2.7 + seed * 1.7) * Math.sin(v.z * 1.9 - seed) * 0.3
        + Math.sin(v.x * 4.7 + v.y * 3.9 + seed * 3) * Math.cos(v.z * 4.1 - seed * 2) * 0.12
        + Math.sin(v.x * 9.3 - v.z * 8.1 + seed * 5) * Math.cos(v.y * 10.2 + seed) * 0.045;
      v.multiplyScalar(1 + n * rough);
      pos.setXYZ(k, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }

  /** The cave, in layers: stone close to you, boulders at the water, walls and roof behind. Depth is the point. */
  private buildCave() {
    // white stone split by cracks the blue of the lake, so the forms read against the white air
    const cracks = this.own(asTexture(this.crackCanvas(3), [2, 1]));
    const fine = this.own(asTexture(this.crackCanvas(5), [5, 2.5]));    // the big walls: the same cracks, finer
    const rock = new THREE.MeshStandardMaterial({ map: cracks, color: 0xdde3e8, roughness: 1, metalness: 0, envMapIntensity: 0.2 });
    // a few low stones on the shore at either side; the water behind the podium is left open
    const boulders: Array<[number, number, number, number]> = [];
    boulders.forEach(([x, y, z, s], i) => {
      const m = new THREE.Mesh(this.stoneShape(i * 2.3 + 1, 1), rock);
      m.position.set(x, y, z);
      m.scale.set(s * (1 + rnd(i) * 0.5), s * (0.5 + rnd(i, 2) * 0.3), s * (0.9 + rnd(i, 3) * 0.4));
      m.rotation.y = rnd(i, 4) * 6.28;
      m.castShadow = true; m.receiveShadow = true;
      this.scene.add(m);
    });

    const wall = new THREE.MeshStandardMaterial({ map: fine, color: 0xcfd6dc, roughness: 1, metalness: 0, envMapIntensity: 0.15 });
    // the right wall; the left is the geode's, the back is open where the pillar stands
    // a closed room: the white side wall is gone; one curved wall of dark stone runs all round, floor to ceiling
    const walls: Array<[number, number, number, number, number, number]> = [];
    const darkVeins = this.own(asTexture(this.crackCanvas(9, '#1a2025', '#15848b'), [10, 1]));
    const room = new THREE.Mesh(
      new THREE.CylinderGeometry(25, 25, OPEN.y, 160, 1, true),
      new THREE.MeshStandardMaterial({ map: darkVeins, color: 0xffffff, roughness: 1, metalness: 0, envMapIntensity: 0.1, side: THREE.BackSide })
    );
    room.position.set(0, OPEN.y / 2, 0);            // the podium stands in the middle of the room
    this.scene.add(room);
    walls.forEach(([x, y, z, sx, sy, sz], i) => {
      const m = new THREE.Mesh(this.stoneShape(47 + i * 7, 0.85), wall);   // the same stone as before
      m.position.set(x, y, z); m.scale.set(sx, sy, sz);
      this.scene.add(m);
    });



    // the roof and the opening the light comes through
    // the haze would lighten it to grey at this distance, so the ceiling is kept out of it: it stays matte black
    // dark stone, fine teal veins that breathe, a scatter of crystal points that twinkle, and on it the
    // soft pools of colour thrown up by whatever glows below (the podium and the three objects)
    this.roofGlow = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(6.5, 0, -22), new THREE.Vector3(-9, 0, -21), new THREE.Vector3(13, 0, -14)];
    const roofMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: this.relicTime,
        uPos: { value: this.roofGlow },
        uCol: { value: [new THREE.Color(TEAL), new THREE.Color(0x4ab3ff), new THREE.Color(0x3fd2d6), new THREE.Color(0x4a8dff)] },
        uRad: { value: [7.5, 8.0, 9.0, 6.0] },
      },
      vertexShader: /* glsl */ `
        varying vec3 vW;
        void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform vec3 uPos[4]; uniform vec3 uCol[4]; uniform float uRad[4];
        varying vec3 vW;
        float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
        float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * n(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
        void main() {
          vec2 p = vW.xz;
          // stone: near black, with slow variation and a fine grain
          float stone = fbm(p * 0.18);
          // (all of this is linear light: small numbers stay dark on screen)
          float far = 1.0 - smoothstep(16.0, 40.0, distance(cameraPosition, vW));   // fine detail fades with distance
          vec3 c = vec3(0.007, 0.009, 0.011) * (0.7 + stone * 0.8) + (n(p * 6.0) - 0.5) * 0.002 * far;
          // veins: thin ridges of a warped noise, lit faintly teal, breathing slowly
          vec2 q = p * 0.11 + vec2(fbm(p * 0.07), fbm(p * 0.07 + 3.3)) * 1.6;
          float r = 1.0 - abs(fbm(q) * 2.0 - 1.0);
          float vein = pow(r, 26.0) * far;
          float breathe = 0.65 + 0.35 * sin(uTime * 0.35 + fbm(p * 0.05) * 6.28);
          c += vec3(0.01, 0.32, 0.36) * vein * 0.35 * breathe;
          // crystal points: a few, each twinkling on its own slow beat
          vec2 g = p * 1.6; vec2 id = floor(g); vec2 f = fract(g) - 0.5;
          float k = h(id);
          float tw = 0.5 + 0.5 * sin(uTime * (0.4 + k * 1.2) + k * 40.0);
          c += vec3(0.5, 0.85, 0.9) * step(0.975, k) * smoothstep(0.08, 0.0, length(f)) * tw * 0.5 * far;
          // the light of what glows below, thrown up onto the stone
          for (int i = 0; i < 4; i++) {
            float d = length(p - uPos[i].xz) / uRad[i];
            c += uCol[i] * exp(-d * d * 2.6) * 0.035 * (0.6 + 0.4 * stone);
          }
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
      side: THREE.DoubleSide,
    });
    const roof = new THREE.Mesh(new THREE.RingGeometry(0.01, 90, 96, 1), roofMat);   // closed: no daylight comes in
    roof.rotation.x = Math.PI / 2; roof.position.copy(OPEN);
    const day = new THREE.Mesh(new THREE.CircleGeometry(OPEN_R * 1.45, 64), new THREE.MeshBasicMaterial({ map: this.glow, color: 0x2a343c, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide }));
    day.rotation.x = Math.PI / 2; day.position.set(OPEN.x, OPEN.y + 0.05, OPEN.z); day.visible = false;
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glow, color: 0xffffff, transparent: true, opacity: 0.28, depthWrite: false, fog: false }));
    halo.position.set(OPEN.x, OPEN.y - 0.3, OPEN.z); halo.scale.set(OPEN_R * 5.2, OPEN_R * 1.9, 1); halo.renderOrder = 7; halo.visible = false;
    this.scene.add(roof, day, halo);
  }

  /**
   * Three objects stand in the water where the walls were: a column of blue crystal, a black geode
   * open on a teal night, and a ring of blue agate. They are the owner's own references, remade as
   * clean cut-outs, each a short looping film whose green is keyed out here. They stand at three
   * depths, each in a glow cut to its own shape, with a pool of its light on the water below.
   */
  private relicMat(key: boolean) {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uMap: { value: null }, uKey: { value: key ? 1 : 0 }, uDim: { value: 1.0 }, uLit: { value: 0 }, uDecode: { value: key ? 1 : 0 }, uTopDim: { value: 1 }, uTopRow: { value: 0 }, uFoot: { value: 0 }, uRecolor: { value: 0 } }]),
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        #include <fog_pars_vertex>
        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap; uniform float uKey; uniform float uDim; uniform float uLit; uniform float uDecode; uniform float uTopDim; uniform float uTopRow; uniform float uFoot; uniform float uRecolor;
        varying vec2 vUv;
        #include <fog_pars_fragment>
        void main() {
          vec4 t = texture2D(uMap, vUv);
          float a = t.a;
          if (uKey > 0.5) {
            // the film has a flat green ground: whatever is greener than it is anything else goes
            float spill = t.g - max(t.r, t.b);
            a = 1.0 - smoothstep(0.08, 0.32, spill);
            t.g = min(t.g, max(t.r, t.b) + 0.04);
          }
          if (a < 0.01) discard;
          // film frames arrive as raw sRGB: decode them here, once, so dark stone stays dark
          if (uDecode > 0.5) t.rgb = pow(t.rgb, vec3(2.2));
          // the scene's key light comes from the upper left: lit there, falling away to the right and to the water
          float shade = mix(1.0, (0.78 + 0.22 * (1.0 - smoothstep(0.15, 1.0, vUv.x))) * (0.82 + 0.18 * smoothstep(0.0, 0.35, vUv.y)), uLit);
          // the upper part (a stone top under no overhead light) darker; the foot feathered into the ground
          float top = mix(1.0, uTopDim, smoothstep(uTopRow - 0.04, uTopRow + 0.04, vUv.y));
          if (uRecolor > 0.5) {
            // the podium in the room's own colours: a matte black stone top, and ice that glows teal from within
            float l = dot(t.rgb, vec3(0.2126, 0.7152, 0.0722));
            vec3 stone = mix(vec3(0.004, 0.005, 0.006), vec3(0.03, 0.034, 0.038), smoothstep(0.02, 0.6, l));
            vec3 ice = mix(vec3(0.0, 0.035, 0.045), vec3(0.16, 0.95, 0.92), smoothstep(0.05, 0.85, l));
            t.rgb = mix(ice, stone, smoothstep(uTopRow - 0.03, uTopRow + 0.03, vUv.y));
            top = 1.0;
          }
          a *= uFoot > 0.0 ? smoothstep(0.0, uFoot, vUv.y) : 1.0;
          gl_FragColor = vec4(t.rgb * uDim * shade * top, a);
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,
      transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide,
    });
  }

  private buildRelics() {
    // the pillar where the falls were, right of the globe; the geode, large, where the left wall stood,
    // rising out of the lake at the edge of the frame; the ring at the right edge by the wall
    // Where each stands depends on the shape of the window (see placeRelics): [x, z, size]. On a wide
    // window the words sit on the left and a line runs from them to the globe, so all three stand to
    // the right, below the row of waiting globes, and the space between words and globe is left empty.
    // On a tall window there are no words beside the globe, so they stand either side. Every spot is
    // inside the room's round wall (radius 25), or the wall hides it.
    const items: Array<{ src: string; video?: string; wide: Spot; tall: Spot; h: number; aspect: number; glow: number; ph: number; lit?: number }> = [
      { src: '/images/world/relics/crystal-column', video: '/images/world/relics/crystal-column.mp4', wide: [6.1, -22, 0.8], tall: [6.5, -22, 0.66], h: 6.2, aspect: 576 / 1064, glow: 0x4ab3ff, ph: 0 },
      { src: '/images/world/relics/geode-monolith', video: '/images/world/relics/geode-monolith.mp4', wide: [10.0, -21, 0.7], tall: [-8.6, -21, 0.64], h: 7.0, aspect: 640 / 1014, glow: 0x3fd2d6, ph: 2.1, lit: 1 },
      { src: '/images/world/relics/agate-ring', video: '/images/world/relics/agate-ring.mp4', wide: [13.9, -17.5, 0.68], tall: [13, -14, 0.66], h: 6.6, aspect: 700 / 1012, glow: 0x4a8dff, ph: 4.3 },
    ];
    const loader = new THREE.TextureLoader();
    for (const it of items) {
      const g = new THREE.Group();
      const w = it.h * it.aspect;
      const mat = this.relicMat(!!it.video);
      mat.uniforms.uLit.value = it.lit ?? 0;
      const card = new THREE.Mesh(new THREE.PlaneGeometry(w, it.h), mat);
      card.renderOrder = 3; card.visible = false;
      if (it.video) {
        const v = document.createElement('video');
        v.src = it.video; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.crossOrigin = 'anonymous';
        v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
        const tex = new THREE.VideoTexture(v);
        tex.colorSpace = THREE.NoColorSpace;          // decoded in the shader instead (uDecode)
        mat.uniforms.uMap.value = tex;
        v.addEventListener('loadeddata', () => { card.visible = true; }, { once: true });
        v.play().catch(() => { /* if the browser will not play it, the still stands in */ loader.load(it.src + '.webp', (t) => { t.colorSpace = THREE.SRGBColorSpace; mat.uniforms.uMap.value = t; mat.uniforms.uKey.value = 0; mat.uniforms.uDecode.value = 0; card.visible = true; }); });
        this.keep.push({ dispose: () => { v.pause(); v.removeAttribute('src'); v.load(); tex.dispose(); } });
      } else {
        loader.load(it.src + '.webp', (t) => {
          if (this.disposed) return;
          t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
          mat.uniforms.uMap.value = t; card.visible = true;
          this.own(t);
        });
      }
      // a still glows in its own outline (the glow image is the object at 400px tall with 80px all round);
      // the turning film, whose outline changes, glows in a soft round light instead
      const glowMat = new THREE.MeshBasicMaterial({ color: it.glow, transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending });
      const sw = Math.round(400 * it.aspect);
      const glow = it.video
        ? new THREE.Mesh(new THREE.PlaneGeometry(w * 2.2, it.h * 1.3), glowMat)
        : new THREE.Mesh(new THREE.PlaneGeometry(w * (sw + 160) / sw, it.h * 1.4), glowMat);
      glow.position.z = -0.08; glow.renderOrder = 2;
      if (it.video) { glowMat.map = this.glow; glowMat.opacity = 0.16; }
      else loader.load(it.src + '-glow.webp', (t) => { if (this.disposed) return; t.colorSpace = THREE.SRGBColorSpace; glowMat.map = t; glowMat.opacity = 0.35; glowMat.needsUpdate = true; this.own(t); });
      // each object lights what is round it: the walls, the ice, the water
      const lamp = new THREE.PointLight(it.glow, 8, 16, 1.6); lamp.position.set(0, 0, 1.6);
      g.add(glow, card, lamp);
      // a pool of its light on the water under it
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w * 2.4, 12), Math.min(w * 1.6, 8)), new THREE.MeshBasicMaterial({ map: this.glow, color: it.glow, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending }));
      pool.rotation.x = -Math.PI / 2; pool.position.y = 0.05; pool.renderOrder = 4;
      this.scene.add(pool);
      this.relics.push({ g, pool, h: it.h, y: 0, ry: 0, ph: it.ph, wide: it.wide, tall: it.tall });
      this.scene.add(g);
    }
    this.placeRelics(true);
  }

  /** Stand the three objects for this shape of window, each just clear of the water and turned to the viewer. */
  private placeRelics(wide: boolean) {
    this.relics.forEach((r, i) => {
      const [x, z, s] = wide ? r.wide : r.tall;
      r.g.scale.setScalar(s);
      r.y = (r.h / 2) * s + 0.5;
      r.ry = Math.atan2(-x, 11.4 - z);            // faces where the viewer stands, so it never shows an edge
      r.g.position.set(x, r.y, z);
      r.g.rotation.y = r.ry;
      r.pool.position.x = x; r.pool.position.z = z;
      r.pool.scale.setScalar(s);
      this.roofGlow[i + 1]?.set(x, 0, z);          // the roof catches its light where it now stands
    });
  }

  /** The project's picture for the inside of a globe, cropped to fill 4:3. */
  private cardCanvas(img: HTMLImageElement | null) {
    const W = 512, H = 380;
    const el = document.createElement('canvas');
    el.width = W; el.height = H;
    const g = el.getContext('2d')!;
    if (img) {
      const k = Math.max(W / img.width, H / img.height), w = img.width * k, h = img.height * k;
      g.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    } else {
      const grd = g.createLinearGradient(0, 0, W, H);
      grd.addColorStop(0, '#d9f7f6'); grd.addColorStop(1, '#12c9cf');
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
    }
    return el;
  }

  /** Shiny glass with a little white in it: milky low down, a bright rim, a crisp window of sky high on one side and a small second catch-light. */
  private glassMat() {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTint: { value: new THREE.Color(TEAL) }, uFade: { value: 1 }, uClear: { value: 0 } }]),
      vertexShader: /* glsl */ `
        varying vec3 vN; varying vec3 vV; varying vec3 vWN;
        #include <fog_pars_vertex>
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mvPosition.xyz);
          vWN = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uTint; uniform float uFade; uniform float uClear;
        varying vec3 vN; varying vec3 vV; varying vec3 vWN;
        #include <fog_pars_fragment>
        void main() {
          vec3 N = normalize(vWN);
          float f = pow(1.0 - clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 2.2);
          float d = dot(N, normalize(vec3(-0.45, 0.75, 0.5)));
          // the globe over the podium clears (uClear): its face goes glassy so the picture inside reads,
          // while the rim, the high catch-light and the edge keep it a glass ball
          float sheen = smoothstep(0.55, 0.95, d) * 0.16 * (1.0 - 0.6 * uClear);
          float spec = smoothstep(0.952, 0.982, d) * 0.9;
          float spec2 = smoothstep(0.972, 0.99, dot(N, normalize(vec3(0.65, -0.15, 0.75)))) * 0.55 * (1.0 - 0.8 * uClear);
          float milk = smoothstep(-0.1, -0.95, N.y) * 0.14 * (1.0 - 0.75 * uClear);
          float low = smoothstep(0.4, 0.95, -N.y) * f;
          vec3 c = mix(vec3(1.0), vec3(0.84, 0.89, 0.92), milk * 3.0);
          c = mix(c, uTint, low * 0.5);
          gl_FragColor = vec4(c, clamp(0.1 * (1.0 - 0.7 * uClear) + f * 0.62 + sheen + spec + spec2 + milk, 0.0, 1.0) * uFade);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,
      transparent: true, depthWrite: false, fog: true,
    });
  }

  /**
   * Smoke inside a globe: the ray from your eye is marched through the ball and gathers soft white
   * smoke that turns slowly round the upright and drifts up. Each globe has its own.
   */
  private smokeMat(seed: number) {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uSeed: { value: seed }, uFade: { value: 1 } }]),
      vertexShader: /* glsl */ `
        varying vec3 vObj; varying vec3 vCam;
        #include <fog_pars_vertex>
        void main() {
          vObj = position;
          vCam = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform float uSeed; uniform float uFade;
        varying vec3 vObj; varying vec3 vCam;
        #include <fog_pars_fragment>
        float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        float noise(vec3 x) {
          vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
                     mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
        }
        float fbm(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; } return s; }
        void main() {
          vec3 rd = normalize(vObj - vCam);
          float b = dot(vObj, rd), c = dot(vObj, vObj) - 1.0;
          float far = -b + sqrt(max(b * b - c, 0.0));
          float stp = far / 10.0, dens = 0.0;
          vec3 p = vObj, col = vec3(0.0);
          for (int i = 0; i < 10; i++) {
            p += rd * stp;
            vec3 q = p * 2.1;
            float a = uTime * 0.22 + q.y * 0.9 + uSeed;
            q.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * q.xz;
            float d = fbm(q + vec3(uSeed, -uTime * 0.12, uSeed * 0.7));
            float g = smoothstep(0.34, 0.62, d) * (1.0 - smoothstep(0.62, 0.98, length(p))) * stp;
            // shaded like real smoke: cool grey-blue in its body, white where it catches the light above
            col += g * mix(vec3(0.1, 0.16, 0.21), vec3(0.96, 0.98, 1.0), smoothstep(-0.9, 0.9, p.y) * 0.5 + smoothstep(0.5, 0.9, d) * 0.4);
            dens += g;
          }
          float al = 1.0 - exp(-dens * 5.5);
          gl_FragColor = vec4(col / max(dens, 1e-4), al * 0.92 * uFade);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,
      transparent: true, depthWrite: false, fog: true,
    });
  }

  /**
   * The picture seen inside a ball within the glass: laid on the ball's face toward you as a crystal
   * ball shows it, swelling at the centre, curving away and melting into the smoke at the rim.
   */
  private orbMat(map: THREE.Texture) {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uMap: { value: map }, uFade: { value: 1 }, uOpen: { value: 0 } }]),
      vertexShader: /* glsl */ `
        varying vec3 vNv;
        #include <fog_pars_vertex>
        void main() {
          vNv = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap; uniform float uFade; uniform float uOpen;
        varying vec3 vNv;
        #include <fog_pars_fragment>
        void main() {
          vec3 n = normalize(vNv);
          // the face of the ball toward you carries the picture (4:3), bulging like a lens. A waiting globe
          // shows the middle of it in a small window; the one over the podium (uOpen) opens the window
          // until nearly the whole picture shows
          float hw = mix(0.83, 0.74, uOpen);                            // half the picture's width, across the ball
          vec2 uv = vec2(n.x / hw, n.y / (hw * 0.75)) * 0.5 + 0.5;
          // round, not square: the picture fades out in a soft circle so it melts into the smoke
          float r = length(n.xy);
          float inside = 1.0 - smoothstep(mix(0.46, 0.7, uOpen), mix(0.79, 0.95, uOpen), r);
          vec3 c = texture2D(uMap, clamp(uv, 0.0, 1.0)).rgb;
          c *= 0.82 + 0.18 * n.z;                                      // a touch darker as it curves away
          float a = inside * smoothstep(mix(0.2, 0.06, uOpen), mix(0.62, 0.36, uOpen), n.z);
          gl_FragColor = vec4(c, a * uFade);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,
      transparent: true, depthWrite: false, fog: true,
    });
  }

  /** The project's picture, in full colour, once it has loaded. */
  private skin(url: string, mat: THREE.ShaderMaterial) {
    this.loader.load(url, (img) => {
      if (this.disposed) return;
      const t = this.own(new THREE.CanvasTexture(this.cardCanvas(img)));
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      mat.uniforms.uMap.value = t;
      try { this.renderer.initTexture(t); } catch { /* uploaded on first use instead */ }
    });
  }

  private buildGlobes() {
    const geo = new THREE.SphereGeometry(1, 64, 40);
    const plate = new THREE.SphereGeometry(0.8, 48, 32);
    const glass = this.glassMat();
    const blank = this.own(new THREE.CanvasTexture(this.cardCanvas(null)));
    blank.colorSpace = THREE.SRGBColorSpace;
    this.opts.covers.forEach((url, i) => {
      // the picture on a ball inside, its face toward you; the smoke round it, the glass round that
      const cardMat = this.orbMat(blank);
      if (url) this.skin(url, cardMat);
      const card = new THREE.Mesh(plate, cardMat);
      card.renderOrder = 8.5;                       // the picture sits in front of the smoke, the smoke round it
      const sm = this.smokeMat(i * 1.37);
      sm.uniforms.uTime = this.smokeTime;          // one clock for every globe's smoke
      const smoke = new THREE.Mesh(geo, sm);
      smoke.renderOrder = 8;
      const mesh = new THREE.Mesh(geo, glass.clone());
      mesh.renderOrder = 9;
      mesh.userData.index = i;
      // a soft light round each globe, cool white with a breath of teal
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glow, color: 0x7fe6ea, transparent: true, opacity: 0.05, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
      halo.renderOrder = 7;
      this.planets.push({ mesh, card, smoke, halo, small: 0.62 + rnd(i, 5) * 0.12, lean: (rnd(i, 6) - 0.5) * 0.5, focus: 0 });
      this.scene.add(halo, card, smoke, mesh);
    });

    // the ring the globes ride on: it runs away behind the podium and comes forward at both sides
    const pts: THREE.Vector3[] = [];
    for (let k = -64; k <= 64; k++) pts.push(slot((k / 64) * 5.9, new THREE.Vector3()));
    const orbit = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 220, 0.012, 6, false),
      new THREE.MeshBasicMaterial({ color: 0x0b0f15, transparent: true, opacity: 0.35 })
    );
    void orbit;                                    // the orbit line is gone: the globes hang in a straight row

    // the rings of the one in front of you
    const ringMat = () => new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    for (const [a, b] of [[1.5, 1.52], [1.66, 1.675], [1.84, 1.9], [2.02, 2.035]] as Array<[number, number]>) {
      this.ring.add(new THREE.Mesh(new THREE.RingGeometry(a, b, 160), ringMat()));
    }
    this.ring.rotation.set(-1.32, 0.22, 0);
    this.ring.position.copy(FOCUS);
    this.ring.visible = false;                     // no rings round the globe: they read as a galaxy

    // the light the globe hangs in
    this.aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glow, color: TEAL, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    this.aura.position.set(FOCUS.x, FOCUS.y - 0.25, FOCUS.z - 1.2);
    this.aura.scale.set(8.2, 8.2, 1);
    this.aura.renderOrder = 2;
    this.scene.add(this.aura);
  }

  /** Rays from the opening: a fan of soft cones, each landing in a pool of light. They breathe; they do not swing. */
  private buildRays() {
    // where each ray lands [x, z], how wide it is at the top and the foot, and how strong
    const rays: Array<[number, number, number, number, number]> = [
      [0, -0.2, 0.6, 3.0, 0.82],           // one ray only: the one that finds the podium
    ];
    const up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(), foot = new THREE.Vector3();
    rays.forEach(([x, z, top, bottom, op], i) => {
      foot.set(x, 0, z);
      dir.copy(OPEN).sub(foot);
      const len = dir.length();
      const mat = new THREE.ShaderMaterial({
        uniforms: { uOpacity: { value: op }, uTime: { value: 0 }, uSeed: { value: i * 3.1 } },
        vertexShader: /* glsl */ `
          varying vec3 vN; varying vec3 vV; varying vec2 vUv;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            vUv = uv;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform float uOpacity; uniform float uTime; uniform float uSeed;
          varying vec3 vN; varying vec3 vV; varying vec2 vUv;
          void main() {
            // brightest through the middle of the cone, nothing at its silhouette: no hard edge anywhere
            float body = pow(abs(dot(normalize(vN), normalize(vV))), 2.2);
            // strongest at the opening, thinning toward the water, gone before it touches
            float fall = smoothstep(0.0, 0.22, vUv.y) * (0.3 + 0.7 * vUv.y * vUv.y);
            // dust in the beam: slow streaks that drift round it
            float streak = 0.74 + 0.26 * sin(vUv.x * 46.0 + uSeed + uTime * 0.22) * sin(vUv.x * 17.0 - uTime * 0.13 + uSeed);
            gl_FragColor = vec4(vec3(0.97, 0.99, 1.0), body * fall * streak * uOpacity);
          }`,
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
      });
      const m = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, len, 56, 1, true), mat);
      m.position.copy(foot).addScaledVector(dir, 0.5);
      m.quaternion.setFromUnitVectors(up, dir.normalize());
      m.renderOrder = 6;
      this.shafts.push({ mesh: m, phase: i * 1.7, base: op });
      this.scene.add(m);
      if (i === 0) return;
      const pool = new THREE.Mesh(
        new THREE.PlaneGeometry(bottom * 3.4, bottom * 3.4),
        new THREE.MeshBasicMaterial({ map: this.glow, color: 0xffffff, transparent: true, depthWrite: false, opacity: op * 0.22 })
      );
      pool.rotation.x = -Math.PI / 2; pool.position.set(x, 0.04, z); pool.renderOrder = 5;
      this.scene.add(pool);
    });
  }

  /* ---------------------------------------------------------- per frame */
  /** Which project, as a fraction: 2.5 is half way between the third and the fourth. */
  /** What the scene is showing right now. */
  get shown() { return this.f; }
  setPointer(x: number, y: number) { this.pointer.set(x, y); }

  /** The project whose globe is under this point of the window, if any. */
  pickAt(clientX: number, clientY: number) {
    const r = this.canvas.getBoundingClientRect();
    this.ray.setFromCamera(new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), this.camera);
    const hit = this.ray.intersectObjects(this.planets.filter((p) => p.mesh.visible).map((p) => p.mesh), false)[0];
    return hit ? (hit.object.userData.index as number) : null;
  }

  /**
   * Where the globe over the podium sits on the canvas, in CSS pixels, as last drawn:
   * its centre, its top edge and its radius. The words are hung from this point.
   */
  focusOnScreen() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    const px = (v: THREE.Vector3) => { v.project(this.camera); return { x: (v.x + 1) * 0.5 * w, y: (1 - v.y) * 0.5 * h }; };
    const c = px(this.probe.copy(FOCUS));
    const top = px(this.probe.set(FOCUS.x, FOCUS.y + BIG, FOCUS.z));
    this.side.setFromMatrixColumn(this.camera.matrixWorld, 0).multiplyScalar(BIG);
    const edge = px(this.probe.copy(FOCUS).add(this.side));
    return { x: c.x, y: c.y, top: top.y, r: Math.hypot(edge.x - c.x, edge.y - c.y) };
  }
  private probe = new THREE.Vector3();
  private side = new THREE.Vector3();

  private apply(t: number) {
    const f = this.f;
    let lead = 0;
    this.planets.forEach((p, i) => {
      const d = i - f;
      // 1 when it is the one over the podium; it stays fully there while f is within 0.1 of it, so it is
      // not already drifting away while you read. Two neighbours always add up to 1, so they pass evenly.
      const k = smooth((0.9 - Math.abs(d)) / 0.8);
      lead = Math.max(lead, k);
      p.focus = k;
      const edge = smooth((3.7 - Math.abs(d)) / 0.9);             // the row fades out at either end
      slot(d, this.v);
      const bob = Math.sin(t * 0.5 + i * 1.3) * 0.05;
      // it comes forward over the podium first, then settles down onto it: a gentle lowering, never a swoop
      const kx = k, ky = smooth(k);                 // the two pass side by side, one lowering as the other lifts
      p.mesh.position.set(
        this.v.x + (FOCUS.x - this.v.x) * kx + Math.sign(d) * k * (1 - k) * 2.2,   // they pass with room between them
        this.v.y + (FOCUS.y - this.v.y) * ky + bob * (1 - k) + Math.sin(t * 0.42) * 0.06 * k,
        this.v.z + (FOCUS.z - this.v.z) * kx
      );
      p.mesh.scale.setScalar((p.small + (BIG - p.small) * k) * edge);
      p.mesh.rotation.set(0, -Math.PI / 2, 0);
      p.mesh.visible = edge > 0.01;
    });

    // what belongs to the globe over the podium comes and goes with it
    this.ring.rotation.z = Math.sin(t * 0.12) * 0.05;
    this.ring.position.y = FOCUS.y + Math.sin(t * 0.42) * 0.06;
    this.band.position.set(FOCUS.x, FOCUS.y - 1.81 + Math.sin(t * 0.42) * 0.06, FOCUS.z);
    this.band.rotation.y = t * 0.12;
    this.ring.scale.setScalar(0.86 + lead * 0.14);
    this.ring.children.forEach((c, i) => { ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = lead * (i === 2 ? 0.55 : 0.85); });
    const breath = 0.9 + Math.sin(t * 0.6) * 0.1;
    (this.aura.material as THREE.SpriteMaterial).opacity = (0.04 + lead * 0.12) * breath;
    (this.pool.material as THREE.MeshBasicMaterial).opacity = (0.06 + lead * 0.12) * breath;
    this.lift.intensity = (1.5 + lead * 3) * breath;
    const here = Math.round(clamp(f, 0, this.planets.length - 1));
    // the band is hidden whenever it shows another project's stack, so it can be rewritten at once
    if (here !== this.bandFor) this.writeBand(here);
    (this.band.material as THREE.MeshBasicMaterial).opacity = this.bandFor === here ? smooth((lead - 0.5) / 0.45) : 0;

    this.water.uniforms.uTime.value = t;
    this.stream.uniforms.uTime.value = t;
    this.placeFloes(t);
    this.smokeTime.value = t;
    this.relicTime.value = t;
    // the three objects hang just over the water and breathe, slowly; they never spin
    for (const r of this.relics) {
      r.g.position.y = r.y + Math.sin(t * 0.35 + r.ph) * 0.09;
      r.g.rotation.y = r.ry + Math.sin(t * 0.12 + r.ph) * 0.02;
    }
    for (const m of this.mist) {
      // each wisp crosses from left to right, fading in at the start and out at the end of its run
      const ph = (t * m.rate + m.off) % 1;
      m.s.position.set(-15 + ph * 30, m.y + ph * 0.35, m.z);
      m.s.scale.set(m.w * (0.8 + ph * 0.4), m.w * 0.32, 1);
      (m.s.material as THREE.SpriteMaterial).opacity = Math.sin(Math.PI * ph) ** 2 * m.peak;
    }

    for (const s of this.shafts) {
      const u = (s.mesh.material as THREE.ShaderMaterial).uniforms;
      u.uOpacity.value = s.base * 0.45 * (0.85 + Math.sin(t * 0.3 + s.phase) * 0.15);
      u.uTime.value = t;
    }

    // the camera drifts, answers the pointer, and leans into each change of project and back out of it
    const m = this.opts.mobile;
    const px = this.eased.x, py = this.eased.y;
    const frac = f - Math.floor(f);
    const swing = Math.sin(Math.PI * frac) * (Math.floor(f) % 2 ? 1 : -1);
    const x = Math.sin(t * 0.09) * 0.32 + px * 0.9 + swing * 0.25;
    this.camera.position.set(x, (m ? 5.0 : 3.9) + py * 0.32 + Math.abs(swing) * 0.12, (m ? 22.5 : 17.2) - Math.abs(swing) * 0.3);
    this.camera.lookAt(x * 0.12 - px * 0.2, m ? 3.9 : 3.5, -2.0);
    // the podium, round, always turned to you
    if (this.podium) this.podium.quaternion.copy(this.camera.quaternion);
    // each picture faces you from inside its glass; the one over the podium opens up, with less smoke
    // round it and clearer glass in front, so the project can be recognised from its picture
    for (const p of this.planets) {
      const k = p.focus;
      (p.card.material as THREE.ShaderMaterial).uniforms.uOpen.value = k;
      (p.smoke.material as THREE.ShaderMaterial).uniforms.uFade.value = 1 - 0.55 * k;
      (p.mesh.material as THREE.ShaderMaterial).uniforms.uClear.value = k;
      p.card.position.copy(p.mesh.position);
      p.card.scale.copy(p.mesh.scale).multiplyScalar(1 + 0.12 * k);
      p.card.visible = p.mesh.visible;
      p.smoke.position.copy(p.mesh.position);
      p.smoke.scale.copy(p.mesh.scale);
      p.smoke.visible = p.mesh.visible;
      p.halo.position.copy(p.mesh.position);
      p.halo.scale.setScalar(p.mesh.scale.x * 2.3);
      p.halo.visible = false;                      // no white light round the globes
    }
  }

  /**
   * One frame, asked for by the page. The scene has no loop and no smoothing of
   * its own: it shows exactly the place it is given, in the same frame as the
   * words beside it, so the two cannot drift apart however slow the machine is.
   */
  draw(f: number) {
    if (!this.running || this.disposed) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.f = this.target = f;
    this.eased.lerp(this.pointer, 1 - Math.pow(0.03, dt));
    this.apply(this.clock.elapsedTime);
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    if (this.running || this.disposed) return;
    this.running = true; this.clock.start();
  }
  stop() { this.running = false; this.clock.stop(); }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth, h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w / h < 0.8 ? 50 : w / h < 1.25 ? 46 : 42;
    // on a tall screen the words sit at the foot and the scene steps up for them
    if (w / h >= 1.25) this.camera.setViewOffset(w, h, -w * 0.14, 0, w, h);   // the words sit on the left, the room beside them
    else if (w / h < 0.8) this.camera.setViewOffset(w, h, 0, h * 0.17, w, h);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
    this.placeRelics(w / h >= 1.25);
    if (this.mirror) {
      const k = this.renderer.getPixelRatio() * (this.opts.mobile ? 0.4 : 0.5);
      const mw = Math.max(64, Math.round(w * k)), mh = Math.max(64, Math.round(h * k));
      this.mirror.getRenderTarget().setSize(mw, mh);
      ((this.mirror.material as THREE.ShaderMaterial).uniforms.uTexel.value as THREE.Vector2).set(1 / mw, 1 / mh);
    }
    this.apply(this.clock.elapsedTime); this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose?.();
    });
    this.keep.forEach((d) => d.dispose());
    this.mirror?.dispose();
    this.renderer.dispose();
  }
}
