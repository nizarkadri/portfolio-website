import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { MIRROR } from '../world/mirror';
import { asTexture, gradientCanvas, radialCanvas, stoneCanvas } from '../world/textures';

/* ==========================================================================
   The work, as a small world: a blue lake in a cave, light falling through an
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

const AIR = 0x6f90b6;                               // blue mist: neither dark nor bright
const ARC = 0.33;                                   // radians between globes on the ring
const RING_R = 5.5;
const RING_Y = 2.3;
const FOCUS = new THREE.Vector3(0, 3.12, 0);        // just over the podium
const BIG = 1.6;
const OPEN = new THREE.Vector3(-3.6, 8.1, -12.5);   // the opening in the roof of the cave
const OPEN_R = 3.6;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => { const k = clamp(t); return k * k * (3 - 2 * k); };
const rnd = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

/** Where a globe sits on the ring when it is `d` places from the one in front of you. */
function slot(d: number, out: THREE.Vector3) {
  const a = d * ARC;
  return out.set(Math.sin(a) * RING_R, RING_Y + Math.cos(a) * 0.35, -Math.cos(a) * RING_R * 0.86 - 0.5);
}

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
  private planets: Array<{ mesh: THREE.Mesh; small: number; lean: number }> = [];
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

  constructor(private canvas: HTMLCanvasElement, private opts: OrreryOptions) {
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false }));
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 1.75));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NeutralToneMapping;
    r.toneMappingExposure = 1.0;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.setClearColor(AIR, 1);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
    this.scene.fog = new THREE.FogExp2(AIR, 0.031);
    this.glow = this.own(asTexture(radialCanvas(256, [[0, 'rgba(255,255,255,0.95)'], [0.3, 'rgba(255,255,255,0.55)'], [0.62, 'rgba(255,255,255,0.16)'], [1, 'rgba(255,255,255,0)']])));

    this.buildAir();
    this.buildLake();
    this.buildPodium();
    this.buildCave();
    this.buildGlobes();
    this.buildRays();

    this.resize();
    this.apply(0);
    try { r.compile(this.scene, this.camera); } catch { /* a warm-up, never a requirement */ }
  }

  private own<T extends { dispose: () => void }>(x: T) { this.keep.push(x); return x; }

  /** Sky, reflections and light. Form comes from the light: one key, one blue light from behind. */
  private buildAir() {
    const skyTex = this.own(asTexture(gradientCanvas([[0, '#9dbbdb'], [0.4, '#7fa0c6'], [0.5, '#6f90b6'], [0.62, '#587aa4'], [1, '#3f5f8c']])));
    const sky = new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false }));
    this.scene.add(sky);

    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(50, 24, 12), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide })));
    const lamp = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xeaf5ff).multiplyScalar(1.6), side: THREE.DoubleSide }));
    lamp.position.set(-6, 14, 4); lamp.lookAt(0, 0, 0); env.add(lamp);
    const pm = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.own(pm.fromScene(env, 0.04)).texture;
    this.scene.environmentIntensity = 0.55;
    pm.dispose();

    // low ambient, so every round thing has a lit side and a side in shade
    this.scene.add(new THREE.HemisphereLight(0xcfe3f8, 0x263d5f, 0.5));
    const key = new THREE.DirectionalLight(0xf4f9ff, 2.1);
    key.position.set(-6, 13, 7);
    key.target.position.set(0, 1.5, -1);
    key.castShadow = true;
    const kc = key.shadow.camera;
    kc.left = -9; kc.right = 9; kc.top = 9; kc.bottom = -9; kc.near = 2; kc.far = 34;
    key.shadow.mapSize.set(this.opts.mobile ? 1024 : 2048, this.opts.mobile ? 1024 : 2048);
    key.shadow.bias = -0.0006; key.shadow.normalBias = 0.03;
    this.scene.add(key, key.target);
    // the daylight from the opening, behind and above: a blue edge on whatever faces away from you
    const rim = new THREE.DirectionalLight(0x7cc6ff, 1.5);
    rim.position.copy(OPEN);
    rim.target.position.set(0, 2, 0);
    this.scene.add(rim, rim.target);
  }

  /** A dark shore in front, and behind the podium a lake that holds its own blue light. */
  private buildLake() {
    const shore = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshStandardMaterial({ color: 0x33486a, roughness: 1, metalness: 0, envMapIntensity: 0.2 })
    );
    shore.rotation.x = -Math.PI / 2; shore.receiveShadow = true;
    this.scene.add(shore);

    // the water's near edge curves round just behind the podium
    const R = 30, cz = -(R + 2.5);
    const lake = new THREE.Mesh(
      new THREE.CircleGeometry(R, 128),
      new THREE.MeshStandardMaterial({ color: 0x0f8fdc, emissive: 0x0a9df2, emissiveIntensity: 0.55, roughness: 0.5, metalness: 0, envMapIntensity: 0.45 })
    );
    lake.rotation.x = -Math.PI / 2; lake.position.set(0, 0.012, cz); lake.receiveShadow = true;
    this.scene.add(lake);

    const mirror = new Reflector(new THREE.CircleGeometry(R, 128), { textureWidth: 512, textureHeight: 512, clipBias: 0.003, shader: MIRROR, multisample: 0 });
    mirror.rotation.x = -Math.PI / 2; mirror.position.set(0, 0.018, cz);
    const mat = mirror.material as THREE.ShaderMaterial;
    mat.transparent = true; mat.depthWrite = false; mat.uniforms.uStrength.value = 0.5;
    mirror.renderOrder = 1;
    this.mirror = mirror;
    this.scene.add(mirror);

    // the waterline: a thin lighter edge where the lake meets the shore
    const edge = new THREE.Mesh(
      new THREE.RingGeometry(R - 0.5, R + 0.16, 160),
      new THREE.MeshBasicMaterial({ color: 0x7fdcff, transparent: true, opacity: 0.5, depthWrite: false })
    );
    edge.rotation.x = -Math.PI / 2; edge.position.set(0, 0.022, cz); edge.renderOrder = 2;
    this.scene.add(edge);

    // the crystal under the podium lights the shore round it
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), new THREE.MeshBasicMaterial({ map: this.glow, color: 0x2aa9ff, transparent: true, depthWrite: false, opacity: 0.72 }));
    halo.rotation.x = -Math.PI / 2; halo.position.y = 0.03; halo.renderOrder = 3;
    this.scene.add(halo);
  }

  /** The podium: a slab of dark stone on a block of blue crystal, with the project's stack written round the crystal. */
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
      map: crack, color: 0x9ad8ff, emissive: 0x1c9dff, emissiveMap: crack, emissiveIntensity: 1.2,
      roughness: 0.3, metalness: 0, flatShading: true, envMapIntensity: 0.9, transparent: true, opacity: 0.9,
    }));
    crystal.position.y = 0.43; crystal.renderOrder = 4;
    const core = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.9, 0.76, 40), new THREE.MeshBasicMaterial({ color: 0xc6ebff }));
    core.position.y = 0.43;
    const lamp = new THREE.PointLight(0x2fb0ff, 9, 8.5, 1.8);
    lamp.position.set(0, 0.5, 0);

    const slateTex = this.own(asTexture(stoneCanvas('slate', 256, 5), [2, 2]));
    const slab = new THREE.Mesh(
      new THREE.CylinderGeometry(2.68, 2.68, 0.26, 72),
      new THREE.MeshStandardMaterial({ map: slateTex, color: 0xc9d6e6, roughness: 0.95, metalness: 0, envMapIntensity: 0.3 })
    );
    slab.position.y = 0.99; slab.castShadow = true; slab.receiveShadow = true;

    // the light that rises off the podium under the globe
    this.pool = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 5.6), new THREE.MeshBasicMaterial({ map: this.glow, color: 0x36b2ff, transparent: true, depthWrite: false, opacity: 0.85 }));
    this.pool.rotation.x = -Math.PI / 2; this.pool.position.y = 1.125; this.pool.renderOrder = 5;
    this.lift = new THREE.PointLight(0x39b4ff, 12, 7.5, 1.6);
    this.lift.position.set(0, 1.35, 0);

    // the stack, written round the front of the crystal
    this.bandCanvas.width = 2048; this.bandCanvas.height = 96;
    this.bandTex = this.own(new THREE.CanvasTexture(this.bandCanvas));
    this.bandTex.colorSpace = THREE.SRGBColorSpace; this.bandTex.anisotropy = 16;
    this.band = new THREE.Mesh(
      new THREE.CylinderGeometry(2.74, 2.8, 0.4, 96, 1, true, -Math.PI * 0.5, Math.PI),
      new THREE.MeshBasicMaterial({ map: this.bandTex, transparent: true, depthWrite: false, opacity: 0, fog: false })
    );
    this.band.position.y = 0.42; this.band.renderOrder = 9;

    this.scene.add(core, crystal, lamp, slab, this.pool, this.lift, this.band);
  }

  /** Write one project's stack on the band. Sized to fit, however many there are. */
  private writeBand(i: number) {
    this.bandFor = i;
    const c = this.bandCanvas.getContext('2d')!;
    const W = this.bandCanvas.width, H = this.bandCanvas.height;
    c.clearRect(0, 0, W, H);
    const words = (this.opts.stacks[i] || []).slice(0, 5).map((t) => t.toUpperCase());
    if (!words.length) { this.bandTex.needsUpdate = true; return; }
    const family = `${this.opts.font ? this.opts.font + ', ' : ''}ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    const text = words.join('     ·     ');
    let size = 44;
    c.font = `600 ${size}px ${family}`;
    const max = W * 0.7, w = c.measureText(text).width;       // kept to the front of the curve, where it can be read
    if (w > max) { size = Math.max(22, Math.floor(size * (max / w))); c.font = `600 ${size}px ${family}`; }
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#041c33';
    c.fillText(text, W / 2, H / 2 + 2);
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
    const rock = new THREE.MeshStandardMaterial({ color: 0x4a6388, roughness: 1, metalness: 0, envMapIntensity: 0.2 });
    const boulders: Array<[number, number, number, number]> = [
      [-9.2, 0.3, -3.6, 2.5], [-6.3, 0.0, -8.0, 1.6], [-12.2, 0.1, 0.6, 1.9],
      [9.0, 0.4, -4.8, 2.9], [6.6, -0.1, -9.4, 1.7], [11.6, 0.0, 0.0, 1.6],
      [-2.8, -0.1, -15, 2.2], [4.2, 0.0, -17, 2.7], [-14, 0.2, -14, 3.2], [15, 0.2, -16, 3.4],
    ];
    boulders.forEach(([x, y, z, s], i) => {
      const m = new THREE.Mesh(this.stoneShape(i * 2.3 + 1, 1), rock);
      m.position.set(x, y, z);
      m.scale.set(s * (1 + rnd(i) * 0.5), s * (0.5 + rnd(i, 2) * 0.3), s * (0.9 + rnd(i, 3) * 0.4));
      m.rotation.y = rnd(i, 4) * 6.28;
      m.castShadow = true; m.receiveShadow = true;
      this.scene.add(m);
    });

    const wall = new THREE.MeshStandardMaterial({ color: 0x334a70, roughness: 1, metalness: 0, envMapIntensity: 0.15 });
    const walls: Array<[number, number, number, number, number, number]> = [
      [-27, 9, -9, 19, 24, 22], [28, 10, -11, 20, 26, 24], [0, 13, -54, 46, 30, 22], [-18, 8, -32, 14, 18, 12], [20, 9, -36, 15, 20, 12],
    ];
    walls.forEach(([x, y, z, sx, sy, sz], i) => {
      const m = new THREE.Mesh(this.stoneShape(40 + i * 7, 0.85), wall);
      m.position.set(x, y, z); m.scale.set(sx, sy, sz);
      this.scene.add(m);
    });

    // stone close to you, dark and out of the light: the nearest layer
    const near = new THREE.MeshStandardMaterial({ color: 0x1f3152, roughness: 1, metalness: 0, envMapIntensity: 0.1 });
    for (const [x, y, z, sx, sy, sz, seed] of [[-10.5, -0.9, 6.4, 4.2, 2.3, 3.0, 71], [9.6, -1.1, 7.2, 3.8, 2.0, 2.8, 77], [13.5, 6.6, 4.5, 3.4, 2.6, 3.2, 83]] as number[][]) {
      const m = new THREE.Mesh(this.stoneShape(seed, 1), near);
      m.position.set(x, y, z); m.scale.set(sx, sy, sz);
      this.scene.add(m);
    }

    // loose stones on the shore round the podium
    const dark = new THREE.MeshStandardMaterial({ color: 0x24375a, roughness: 1, metalness: 0, envMapIntensity: 0.2 });
    const pebble = this.stoneShape(91, 0.9);
    for (let i = 0; i < 26; i++) {
      const a = rnd(i, 21) * Math.PI * 2, d = 3.4 + rnd(i, 22) * 5.8;
      const z = Math.sin(a) * d * 0.62 + 1.2;
      if (z < -1.6) continue;                       // not in the water
      const m = new THREE.Mesh(pebble, dark);
      const sc = 0.1 + rnd(i, 23) * 0.32;
      m.position.set(Math.cos(a) * d, sc * 0.2, z);
      m.scale.set(sc * (1 + rnd(i, 24) * 0.6), sc * 0.55, sc * (1 + rnd(i, 25) * 0.5));
      m.rotation.y = rnd(i, 26) * 6.28;
      m.castShadow = true; m.receiveShadow = true;
      this.scene.add(m);
    }

    // the roof, the opening the light comes through, and what hangs from it
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x2c4166, roughness: 1, metalness: 0, envMapIntensity: 0.1, side: THREE.DoubleSide });
    const roof = new THREE.Mesh(new THREE.RingGeometry(OPEN_R, 90, 96, 1), roofMat);
    roof.rotation.x = Math.PI / 2; roof.position.copy(OPEN);
    const day = new THREE.Mesh(new THREE.CircleGeometry(OPEN_R * 1.45, 64), new THREE.MeshBasicMaterial({ map: this.glow, color: 0xeaf7ff, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide }));
    day.rotation.x = Math.PI / 2; day.position.set(OPEN.x, OPEN.y + 0.05, OPEN.z);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glow, color: 0xcfeaff, transparent: true, opacity: 0.6, depthWrite: false, fog: false }));
    halo.position.set(OPEN.x, OPEN.y - 0.3, OPEN.z); halo.scale.set(OPEN_R * 5.2, OPEN_R * 1.9, 1); halo.renderOrder = 7;
    this.scene.add(roof, day, halo);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.4;
      const m = new THREE.Mesh(this.stoneShape(60 + i * 3, 1), wall);
      const rr = OPEN_R + 1.1 + rnd(i, 31) * 0.9;
      m.position.set(OPEN.x + Math.cos(a) * rr, OPEN.y + 0.55, OPEN.z + Math.sin(a) * rr);
      m.scale.set(1.7 + rnd(i, 32) * 1.2, 0.5 + rnd(i, 33) * 0.3, 1.7 + rnd(i, 34) * 1.2);
      this.scene.add(m);
    }
    const spike = new THREE.ConeGeometry(1, 1, 18);
    for (let i = 0; i < 22; i++) {
      const x = (rnd(i, 41) - 0.5) * 34, z = -6 - rnd(i, 42) * 24;
      if (Math.hypot(x - OPEN.x, z - OPEN.z) < OPEN_R + 0.8) continue;
      const h = 0.6 + rnd(i, 43) * 1.7;
      const m = new THREE.Mesh(spike, wall);
      m.scale.set(0.16 + rnd(i, 44) * 0.3, h, 0.16 + rnd(i, 45) * 0.3);
      m.rotation.x = Math.PI;                       // point down
      m.position.set(x, OPEN.y - h / 2 + 0.05, z);
      this.scene.add(m);
    }
  }

  /** A picture wrapped once round the front of a sphere and mirrored behind, so it has no seam. */
  private skin(url: string, mat: THREE.MeshStandardMaterial) {
    this.loader.load(url, (img) => {
      if (this.disposed) return;
      const k = Math.min(1, 640 / Math.max(img.width, img.height));
      const el = document.createElement('canvas');
      el.width = Math.max(4, Math.round(img.width * k)); el.height = Math.max(4, Math.round(img.height * k));
      el.getContext('2d')!.drawImage(img, 0, 0, el.width, el.height);
      const t = this.own(new THREE.CanvasTexture(el));
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      t.wrapS = THREE.MirroredRepeatWrapping; t.repeat.set(2, 1); t.offset.set(0.5, 0);
      mat.map = t; mat.color.set(0xffffff); mat.needsUpdate = true;
      try { this.renderer.initTexture(t); } catch { /* uploaded on first use instead */ }
    });
  }

  private buildGlobes() {
    const geo = new THREE.SphereGeometry(1, 64, 40);
    const tints = [0x3f5f8a, 0x6f8fb6, 0x2f4a74, 0x8aa6c8, 0x4f6f9a, 0x38567f];
    this.opts.covers.forEach((url, i) => {
      const mat = new THREE.MeshStandardMaterial({ color: tints[i % tints.length], roughness: 0.92, metalness: 0, envMapIntensity: 0.4 });
      if (url) this.skin(url, mat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.userData.index = i;
      this.planets.push({ mesh, small: 0.36 + rnd(i, 5) * 0.2, lean: (rnd(i, 6) - 0.5) * 0.5 });
      this.scene.add(mesh);
    });

    // the ring the globes ride on: it runs away behind the podium and comes forward at both sides
    const pts: THREE.Vector3[] = [];
    for (let k = -64; k <= 64; k++) pts.push(slot((k / 64) * 5.9, new THREE.Vector3()));
    const orbit = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 220, 0.012, 6, false),
      new THREE.MeshBasicMaterial({ color: 0xdff1ff, transparent: true, opacity: 0.6 })
    );
    this.scene.add(orbit);

    // the rings of the one in front of you
    const ringMat = () => new THREE.MeshBasicMaterial({ color: 0xe6f4ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    for (const [a, b] of [[1.5, 1.52], [1.66, 1.675], [1.84, 1.9], [2.02, 2.035]] as Array<[number, number]>) {
      this.ring.add(new THREE.Mesh(new THREE.RingGeometry(a, b, 160), ringMat()));
    }
    this.ring.rotation.set(-1.32, 0.22, 0);
    this.ring.position.copy(FOCUS);
    this.scene.add(this.ring);

    // the blue air the globe hangs in
    this.aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glow, color: 0x2ea6ff, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    this.aura.position.set(FOCUS.x, FOCUS.y - 0.25, FOCUS.z - 1.2);
    this.aura.scale.set(8.2, 8.2, 1);
    this.aura.renderOrder = 2;
    this.scene.add(this.aura);
  }

  /** Rays from the opening: a fan of soft cones, each landing in a pool of light. They breathe; they do not swing. */
  private buildRays() {
    // where each ray lands [x, z], how wide it is at the top and the foot, and how strong
    const rays: Array<[number, number, number, number, number]> = [
      [0, -0.2, 0.6, 3.0, 0.82],           // the one that finds the podium
      [-3.8, -6.0, 0.32, 1.7, 0.62], [3.4, -7.0, 0.36, 1.9, 0.64], [-7.4, -11.0, 0.3, 1.9, 0.52],
      [7.0, -12.5, 0.34, 2.1, 0.52], [0.9, -15.0, 0.5, 2.6, 0.52], [-1.9, -9.5, 0.26, 1.4, 0.56], [4.9, -3.4, 0.28, 1.5, 0.44],
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
            gl_FragColor = vec4(vec3(0.8, 0.92, 1.0), body * fall * streak * uOpacity);
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
        new THREE.MeshBasicMaterial({ map: this.glow, color: 0xbfe8ff, transparent: true, depthWrite: false, opacity: op * 0.55 })
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

  private apply(t: number) {
    const f = this.f;
    let lead = 0;
    this.planets.forEach((p, i) => {
      const d = i - f;
      const k = smooth(1 - Math.abs(d) * 1.35);                   // 1 when it is the one in front of you
      lead = Math.max(lead, k);
      const edge = smooth((5.9 - Math.abs(d)) / 1.2);             // the ring lets go of it at either end
      slot(d, this.v);
      const bob = Math.sin(t * 0.5 + i * 1.3) * 0.045;
      p.mesh.position.set(
        // the one leaving and the one arriving pass each other with room to spare
        this.v.x + (FOCUS.x - this.v.x) * k + Math.sign(d) * k * (1 - k) * 1.5,
        this.v.y + (FOCUS.y - this.v.y) * k + bob * (1 - k) + Math.sin(t * 0.42) * 0.06 * k,
        this.v.z + (FOCUS.z - this.v.z) * k
      );
      p.mesh.scale.setScalar((p.small + (BIG - p.small) * k) * edge);
      // the picture faces you, and the globe only sways: it never turns its back
      p.mesh.rotation.set(p.lean * 0.3, -Math.PI / 2 + Math.sin(t * 0.16 + i) * 0.2 + Math.sin(d * ARC) * 0.5 * (1 - k), p.lean * 0.4);
      p.mesh.visible = edge > 0.01;
    });

    // what belongs to the globe over the podium comes and goes with it
    this.ring.rotation.z = Math.sin(t * 0.12) * 0.05;
    this.ring.position.y = FOCUS.y + Math.sin(t * 0.42) * 0.06;
    this.ring.scale.setScalar(0.86 + lead * 0.14);
    this.ring.children.forEach((c, i) => { ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = lead * (i === 2 ? 0.55 : 0.85); });
    const breath = 0.9 + Math.sin(t * 0.6) * 0.1;
    (this.aura.material as THREE.SpriteMaterial).opacity = (0.16 + lead * 0.4) * breath;
    (this.pool.material as THREE.MeshBasicMaterial).opacity = (0.4 + lead * 0.5) * breath;
    this.lift.intensity = (5 + lead * 9) * breath;
    const here = Math.round(clamp(f, 0, this.planets.length - 1));
    if (here !== this.bandFor && lead < 0.45) this.writeBand(here);
    if (this.bandFor < 0) this.writeBand(here);
    (this.band.material as THREE.MeshBasicMaterial).opacity = this.bandFor === here ? smooth((lead - 0.5) / 0.45) : 0;

    for (const s of this.shafts) {
      const u = (s.mesh.material as THREE.ShaderMaterial).uniforms;
      u.uOpacity.value = s.base * (0.8 + Math.sin(t * 0.3 + s.phase) * 0.2);
      u.uTime.value = t;
    }

    // the camera drifts, answers the pointer, and leans into each change of project and back out of it
    const m = this.opts.mobile;
    const px = this.eased.x, py = this.eased.y;
    const frac = f - Math.floor(f);
    const swing = Math.sin(Math.PI * frac) * (Math.floor(f) % 2 ? 1 : -1);
    const x = Math.sin(t * 0.09) * 0.32 + px * 0.9 + swing * 0.5;
    this.camera.position.set(x, (m ? 4.4 : 3.0) + py * 0.32 + Math.abs(swing) * 0.16, (m ? 17.5 : 11.4) - Math.abs(swing) * 0.4);
    this.camera.lookAt(x * 0.12 - px * 0.2, m ? 3.1 : 2.45, -1.2);
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
    // the words sit on the left of a wide screen and at the foot of a tall one: the scene steps aside for them
    if (w / h >= 1.25) this.camera.setViewOffset(w, h, -w * 0.16, 0, w, h);
    else if (w / h < 0.8) this.camera.setViewOffset(w, h, 0, h * 0.17, w, h);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
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
