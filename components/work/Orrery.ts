import * as THREE from 'three';
import { asTexture, gradientCanvas, radialCanvas, stoneCanvas } from '../world/textures';

/* ==========================================================================
   The work, as an orrery in the site's own daylight, and matte throughout:
   nothing in it shines or mirrors. One round form, drawn from its centre out:
   a floating disc of black stone as the podium, two low steps under it, and round
   those a ring of black stone inlaid in the floor, with a thread of blue in it.
   Every project is a white ball standing on that ring, its picture on its face.
   Scroll turns the ring; the ball that comes round to the podium leaves the
   ring and settles on it. White, matte black and one blue: the same three as
   every other page.
   Everything is a pure function of one number (which project, as a fraction),
   so nothing can pop: it can only glide.
   ========================================================================== */

export interface OrreryOptions {
  covers: string[];        // one picture per project ('' when it has none)
  mobile: boolean;
}

const AIR = 0xe3f2fb;                               // the page's own ground: the haze in the room is the same pale blue
const BLUE = 0x3f7fe0;                              // the one accent, as on every other page
const TOP = 0.86;                                   // the height of the podium's top: the disc floats, a little way off the ground
const BIG = 2.3;                                    // the size of the ball on the podium
const SMALL = 0.56;                                 // and of one waiting on the ring: small, so the one on the podium is plainly the subject
const FOCUS = new THREE.Vector3(0, TOP + BIG, 0);   // resting on the podium
const ORBIT = 6.6;                                  // the radius of the ring in the floor the waiting balls stand on
const NEAR = 1.0, ARC = 0.4;                        // radians from the back of the ring to the first ball either side, then between neighbours
const ROOF = 8.1;                                   // how high the room is

type Spot = [x: number, z: number, size: number];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => { const k = clamp(t); return k * k * (3 - 2 * k); };
/** As `smooth`, but it starts and stops more gently still: for the travel of a globe. */
const gentle = (t: number) => { const k = clamp(t); return k * k * k * (k * (k * 6 - 15) + 10); };
const DISC = 2.95;                                  // the radius of the black disc that is the podium's top

/**
 * Where a waiting ball stands when it is `d` places from the one on the podium: on the ring, with d = 0 directly
 * behind the podium. The first ball either side stands well round to the side: seen whole past the ball on the
 * podium, and clear of the words that are set either side of it.
 */
function slot(d: number, out: THREE.Vector3) {
  const n = Math.abs(d), a = Math.sign(d) * (n <= 1 ? n * NEAR : NEAR + (n - 1) * ARC);
  return out.set(Math.sin(a) * ORBIT, SMALL, -Math.cos(a) * ORBIT);
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
  private planets: Array<{ mesh: THREE.Mesh; card: THREE.Mesh; focus: number; edge: number }> = [];
  private turn = { value: 0 };                      // how far the scroll has turned the ring, in radians: the scale on the floor turns by it
  private aura!: THREE.Sprite;
  private glowK = { value: 0 };                     // how settled the globe on the podium is: the room's lights rise with it
  private pulse = { value: 1 };                     // 0 to 1 over the landing: the disc's give, and the cloud of light pressed out from under it
  private pulseAt = -10;                            // when the last wave began, and which project it was for
  private pulseFor = -1;
  private disc!: THREE.Mesh;
  private limb!: THREE.Mesh;
  private puffs: Array<{ sp: THREE.Sprite; a: number; reach: number; size: number; late: number }> = [];   // the body of the cloud pressed out when a globe lands
  private keep: Array<{ dispose: () => void }> = [];
  private loader = new THREE.ImageLoader();
  private glow!: THREE.Texture;                     // the soft round glow, shared by every pool of light
  private forms: Array<{ g: THREE.Object3D; shade: THREE.Mesh; wide: Spot; tall: Spot }> = [];
  private time: { value: number } = { value: 0 };     // one clock for whatever breathes: the roof's veins, the light on the ring

  constructor(private canvas: HTMLCanvasElement, private opts: OrreryOptions) {
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false }));
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 1.75));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NeutralToneMapping;
    r.toneMappingExposure = 1.0;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.VSMShadowMap;       // soft, wide shadows: what gives a matte thing its weight
    r.setClearColor(AIR, 1);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
    this.scene.fog = new THREE.FogExp2(AIR, 0.013);
    this.glow = this.own(asTexture(radialCanvas(256, [[0, 'rgba(255,255,255,0.95)'], [0.3, 'rgba(255,255,255,0.55)'], [0.62, 'rgba(255,255,255,0.16)'], [1, 'rgba(255,255,255,0)']])));

    this.buildAir();
    this.buildFloor();
    this.buildPodium();
    this.buildCave();
    this.buildForms();
    this.buildGlobes();

    this.resize();
    this.apply(0);
    try { r.compile(this.scene, this.camera); } catch { /* a warm-up, never a requirement */ }
  }

  private own<T extends { dispose: () => void }>(x: T) { this.keep.push(x); return x; }

  /** Sky, reflections and light: the even daylight of the landing page's studio, with no lamp in sight. */
  private buildAir() {
    const skyTex = this.own(asTexture(gradientCanvas([[0, '#f6fafd'], [0.4, '#ebf5fc'], [0.5, '#e3f2fb'], [0.62, '#dcecf8'], [1, '#d2e4f2']])));
    const sky = new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false }));
    this.scene.add(sky);

    // the light that comes from everywhere: pale sky all round, one broad soft box overhead, a darker floor so undersides keep their shape
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(50, 24, 12), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide })));
    const panel = (color: number, k: number, w: number, h: number, pos: [number, number, number]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
    };
    panel(0xffffff, 1.7, 26, 26, [-6, 16, 6]);
    panel(0x6f7f95, 1, 80, 80, [0, -7, 0]);
    const pm = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.own(pm.fromScene(env, 0.04)).texture;
    this.scene.environmentIntensity = 0.7;
    pm.dispose();

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c6da, 1.0));   // a cooler ground, so the underside of a white ball has a shade to it
    // one soft key from above and a little to the left, so the globe's shadow lies on the podium under it;
    // and a cooler fill from the other side
    const key = new THREE.DirectionalLight(0xffffff, 1.45);
    key.position.set(-4, 14, 5);
    key.target.position.set(0, 1.5, -1);
    key.castShadow = true;
    const kc = key.shadow.camera;
    kc.left = -10; kc.right = 10; kc.top = 10; kc.bottom = -10; kc.near = 2; kc.far = 32;
    key.shadow.mapSize.set(this.opts.mobile ? 1024 : 2048, this.opts.mobile ? 1024 : 2048);
    key.shadow.radius = 7; key.shadow.blurSamples = this.opts.mobile ? 10 : 14; key.shadow.bias = -0.0004;
    this.scene.add(key, key.target);
    const fill = new THREE.DirectionalLight(0xe4edf7, 0.4);
    fill.position.set(9, 6, 8);
    fill.target.position.set(0, 2, -4);
    this.scene.add(fill, fill.target);
  }

  /**
   * The floor: white stone running out to the wall, and drawn on it, round the podium, the track the waiting
   * balls stand on: one fine line of black stone. On it rides one stroke of blue light, as a ring of neon is
   * drawn: a bright head with a tail that thins and fades right round the ring behind it. It travels slowly,
   * and the scroll pushes it on. On a wide window there is one hairline more, further out. Matte: it mirrors nothing.
   */
  private buildFloor() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshStandardMaterial({ color: 0xeef4fa, roughness: 1, metalness: 0, envMapIntensity: 0.3 })
    );
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
    this.scene.add(floor);

    const outer = this.opts.mobile ? 0 : 1;        // on a phone the outer ring would run behind the words
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: this.time, uTurn: this.turn, uGlow: this.glowK, uR: { value: ORBIT }, uOuter: { value: outer },
        uInk: { value: new THREE.Color(0x171b21) }, uBlue: { value: new THREE.Color(BLUE) }, uPale: { value: new THREE.Color(0xa9ccff) },
      },
      vertexShader: /* glsl */ `varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform float uTurn; uniform float uGlow; uniform float uR; uniform float uOuter;
        uniform vec3 uInk; uniform vec3 uBlue; uniform vec3 uPale;
        varying vec2 vP;
        const float TAU = 6.28318530718;
        vec3 pm = vec3(0.0); float al = 0.0;                           // what has been drawn so far, back to front
        void over(vec3 c, float a) { a = clamp(a, 0.0, 1.0); pm = pm * (1.0 - a) + c * a; al = al * (1.0 - a) + a; }
        // 1 inside a ring of half-width w at radius c, with an edge one pixel soft
        float ring(float r, float c, float w, float dr) { return 1.0 - smoothstep(w - dr, w + dr, abs(r - c)); }
        void main() {
          float r = length(vP), a = atan(vP.y, vP.x);
          float dr = fwidth(r) * 0.75;

          // The light on the track is one stroke, as a ring of neon is drawn: a bright head, and behind it a tail
          // that thins and fades right round the ring. It travels slowly, and the scroll pushes it on.
          float t1 = fract((uTime * 0.075 + uTurn - a) / TAU);
          // 1 at the head, falling away behind it; and it comes up over a few degrees in front, so the head is round, not cut
          float w = max(exp(-t1 * 3.0), smoothstep(0.978, 1.0, t1));

          // its light on the white floor: widest and strongest by the head
          over(uBlue, exp(-pow((r - uR) / mix(0.16, 0.46, w), 2.0)) * w * (0.34 + 0.2 * uGlow));
          // the track itself: one fine line of black stone
          over(uInk, ring(r, uR, 0.02, dr) * 0.9);
          // and the stroke of light that rides it
          over(mix(uBlue, uPale, w * w), ring(r, uR, mix(0.006, 0.052, w), dr) * smoothstep(0.03, 0.22, w));

          // one hairline more, further out
          if (uOuter > 0.5) over(uInk, ring(r, uR * 1.62, 0.009, dr) * 0.22);

          if (al < 0.003) discard;
          gl_FragColor = vec4(pm / al, al);
          #include <colorspace_fragment>
        }`,
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    });
    const rings = new THREE.Mesh(new THREE.RingGeometry(5.0, outer ? ORBIT * 1.62 + 0.3 : ORBIT + 0.9, 256, 1), mat);
    rings.rotation.x = -Math.PI / 2; rings.position.y = 0.004; rings.renderOrder = 1;
    this.scene.add(rings);
  }

  /**
   * The podium, as an eclipse: one wide, thin disc of matte black stone, floating. Nothing holds it up and
   * nothing is drawn on it. It has a fine line of light along its lower edge, and a glow underneath it.
   * The glow is an underglow and stays one: it lies on the round step below the disc, strongest in the middle,
   * and it has gone before it reaches that step's edge. None of it falls on the lower step or the floor. It is
   * a little brighter on one side, and that side goes round by one place with each project.
   * When a globe lands on the disc, the disc gives a little under it and comes back, and a soft cloud of the
   * same light is pressed out from under it: it rolls outward, thins, and is gone inside the step's edge.
   */
  private buildPodium() {
    // the disc: wide, thin, pure matte black
    const slate = this.own(asTexture(stoneCanvas('slate', 256, 5), [3, 3]));
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(DISC, DISC, 0.2, 160),
      new THREE.MeshStandardMaterial({ map: slate, color: 0x9a9fa6, roughness: 1, metalness: 0, envMapIntensity: 0.15 })
    );
    disc.position.y = TOP - 0.1; disc.castShadow = true; disc.receiveShadow = true;
    this.disc = disc;

    // The light. What glows here shares one shape: a little brighter on one side than the other, and the
    // bright side goes round with the projects ('side' below).
    const head = /* glsl */ `
      uniform float uTime; uniform float uTurn; uniform float uGlow; uniform float uPulse; uniform vec3 uBlue; uniform vec3 uCore;
      varying vec3 vW;
      float side(vec2 p) { return pow(0.5 + 0.5 * cos(atan(-p.y, p.x) - uTurn * 1.75 - uTime * 0.03 - 0.9), 2.0); }`;
    const vert = /* glsl */ `varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
    const uniforms = () => ({
      uTime: this.time, uTurn: this.turn, uGlow: this.glowK, uPulse: this.pulse,
      uBlue: { value: new THREE.Color(BLUE) }, uCore: { value: new THREE.Color(0xd3e4ff) },
    });
    // the limb: a fine line of light along the disc's lower edge, as the edge of an eclipse is lit
    const limb = new THREE.Mesh(new THREE.CylinderGeometry(DISC + 0.004, DISC + 0.004, 0.034, 192, 1, true), new THREE.ShaderMaterial({
      uniforms: uniforms(), vertexShader: vert,
      fragmentShader: head + /* glsl */ `
        void main() {
          float s = side(vW.xz), surge = pow(1.0 - uPulse, 2.0) * smoothstep(0.0, 0.1, uPulse);
          gl_FragColor = vec4(mix(uBlue * 0.55, uCore, clamp((0.2 + 0.8 * s) * (0.5 + 0.5 * uGlow) + surge * 0.6, 0.0, 1.0)), 1.0);
          #include <colorspace_fragment>
        }`,
    }));
    limb.position.y = TOP - 0.2 - 0.012;
    this.limb = limb;

    // The underglow, on the step below the disc and nowhere else. 't' runs from 0 under the middle of the disc
    // to 1 a little inside the step's edge, and everything is multiplied by a fade that reaches nothing at 1.
    const UNDER = 3.6;                             // where the glow has gone: just inside the step's edge (3.7)
    const under = new THREE.Mesh(new THREE.CircleGeometry(3.7, 160), new THREE.ShaderMaterial({
      uniforms: { ...uniforms(), uEdge: { value: UNDER } }, vertexShader: vert,
      fragmentShader: head + /* glsl */ `
        uniform float uEdge;
        float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
        void main() {
          vec2 p = vW.xz;
          float t = clamp(length(p) / uEdge, 0.0, 1.0);
          float s = side(p), k = 0.4 + 0.6 * uGlow;
          float base = pow(1.0 - t, 1.25) * (0.62 + 0.38 * s) * k;
          // the cloud pressed out when a globe lands: a soft, uneven roll of light that leaves the middle,
          // slows as it goes, and thins away before the edge
          float at = 1.0 - pow(1.0 - uPulse, 2.4);
          float puff = n(p * 1.7 + vec2(0.0, uTime * 0.12)) * 0.6 + n(p * 3.6 - uTime * 0.2) * 0.4;
          float roll = exp(-pow((t - at * 0.86) / (0.2 + 0.1 * at), 2.0)) * (0.55 + 0.75 * puff);
          float cloud = roll * pow(1.0 - uPulse, 1.3) * smoothstep(0.0, 0.08, uPulse) * (1.0 - t * 0.6);
          float a = clamp(base * 0.8 + cloud * 0.75, 0.0, 0.95) * (1.0 - smoothstep(0.8, 1.0, t));
          if (a < 0.004) discard;
          gl_FragColor = vec4(mix(uBlue, uCore, clamp(base * 0.5 + cloud, 0.0, 1.0)), a);
          #include <colorspace_fragment>
        }`,
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    }));
    under.rotation.x = -Math.PI / 2; under.position.y = 0.203; under.renderOrder = 2;

    // The cloud has some body as well as light on the ground: a few soft puffs in the space under the disc,
    // which swell, drift outward and a little upward, and thin to nothing. They stay under the disc.
    for (let i = 0; i < 12; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glow, color: 0xc4d9ff, transparent: true, opacity: 0, depthWrite: false, fog: false }));
      sp.renderOrder = 3; sp.visible = false;
      const a = (i / 12) * Math.PI * 2 + (i % 2) * 0.21;
      this.puffs.push({ sp, a, reach: 1.7 + ((i * 7) % 5) * 0.16, size: 0.75 + ((i * 3) % 4) * 0.11, late: ((i * 5) % 6) * 0.018 });
      this.scene.add(sp);
    }

    // two low steps under it: the first of the rings the floor is drawn in
    const step = (r: number, h: number) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 128), new THREE.MeshStandardMaterial({ color: 0xf3f6fa, roughness: 1, metalness: 0, envMapIntensity: 0.3 }));
      m.position.y = h / 2; m.castShadow = true; m.receiveShadow = true;
      return m;
    };
    this.scene.add(step(4.9, 0.09), step(3.7, 0.2), under, limb, disc);
  }

  /**
   * The room: one curved wall of white stone all the way round, and a plain white ceiling. In the ceiling,
   * directly over the ring in the floor, runs the same ring again as a line of light.
   */
  private buildCave() {
    // The wall takes no light of its own: it is the ceiling's white where it meets the ceiling, and a breath
    // deeper toward the floor. So ceiling, wall and floor are one family of white, with no grey band between them.
    const shade = this.own(asTexture(gradientCanvas([[0, '#f3f7fc'], [0.55, '#eef4fa'], [1, '#e2ebf5']])));
    const room = new THREE.Mesh(
      new THREE.CylinderGeometry(25, 25, ROOF, 160, 1, true),
      new THREE.MeshBasicMaterial({ map: shade, side: THREE.BackSide, toneMapped: false })   // as the ceiling is: its colours are the ones written here
    );
    room.position.set(0, ROOF / 2, 0);              // the podium stands in the middle of the room
    this.scene.add(room);

    // The ceiling is kept out of the haze and fades into the page's own pale blue by itself: white stone,
    // barely clouded, and the ring of light, which breathes and brightens when a globe settles on the podium.
    const roofMat = new THREE.ShaderMaterial({
      uniforms: { uTime: this.time, uTurn: this.turn, uGlow: this.glowK, uAir: { value: new THREE.Color(AIR) }, uR: { value: ORBIT } },
      vertexShader: /* glsl */ `
        varying vec3 vW;
        void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform float uTurn; uniform float uGlow; uniform vec3 uAir; uniform float uR;
        varying vec3 vW;
        float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
        float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * n(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
        void main() {
          vec2 p = vW.xz;
          float dist = distance(cameraPosition, vW);
          // stone: white, with only the slowest clouding
          vec3 c = vec3(0.9, 0.94, 0.98) * (0.975 + fbm(p * 0.12) * 0.04);
          // the ring of light: a fine bright line, and a soft blue either side of it
          float d = abs(length(p) - uR);
          float breathe = 0.82 + 0.18 * sin(uTime * 0.5);
          float k = (0.55 + 0.45 * uGlow) * breathe;
          // the same stroke as on the track below it, directly overhead: a bright head, a tail that thins behind it
          float tr = fract((uTime * 0.075 + uTurn - atan(-p.y, p.x)) / 6.28318530718);
          float w = max(exp(-tr * 3.0), smoothstep(0.978, 1.0, tr));
          c = mix(c, vec3(0.22, 0.47, 0.95), exp(-pow(d / mix(0.4, 0.9, w), 2.0)) * (0.1 + 0.32 * w) * k);
          c = mix(c, vec3(0.86, 0.93, 1.0), exp(-pow(d / mix(0.03, 0.09, w), 2.0)) * (0.3 + 0.7 * w) * k);
          c = mix(c, uAir, smoothstep(22.0, 62.0, dist));
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
      side: THREE.DoubleSide,
    });
    const roof = new THREE.Mesh(new THREE.RingGeometry(0.01, 90, 96, 1), roofMat);
    roof.rotation.x = Math.PI / 2; roof.position.set(0, ROOF, 0);
    this.scene.add(roof);
  }

  /**
   * Three matte forms stand at the back of the room, as sculpture stands in a gallery: a black
   * column between white marble blocks, a white egg, and a black ring. Cut stone, lit by the same daylight
   * as everything else; nothing in them shines.
   */
  private buildForms() {
    // charcoal rather than pure black, so their roundness still shows through the haze
    const black = new THREE.MeshStandardMaterial({ color: 0x22262d, roughness: 1, metalness: 0, envMapIntensity: 0.45 });
    const white = new THREE.MeshStandardMaterial({ color: 0xf3f6fa, roughness: 1, metalness: 0, envMapIntensity: 0.3 });
    const part = (geo: THREE.BufferGeometry, mat: THREE.Material, y: number) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; return m; };

    const column = new THREE.Group();
    column.add(
      part(new THREE.BoxGeometry(2.0, 0.5, 2.0), white, 0.25),
      part(new THREE.CylinderGeometry(0.62, 0.7, 4.5, 56), black, 2.75),
      part(new THREE.CylinderGeometry(0.635, 0.635, 0.05, 56, 1, true), new THREE.MeshBasicMaterial({ color: BLUE }), 4.82),
      part(new THREE.BoxGeometry(2.0, 0.42, 2.0), white, 5.21),
    );
    const egg = new THREE.Group();
    const shell = part(new THREE.SphereGeometry(1, 56, 40), white, 2.3);
    shell.scale.set(1.7, 2.45, 1.7);
    egg.add(shell);
    const ring = new THREE.Group();
    ring.add(part(new THREE.TorusGeometry(1.55, 0.44, 32, 112), black, 1.9));

    // Where each stands depends on the shape of the window (see placeForms): [x, z, size]. They are shown on a
    // tall window, where the words sit at the foot of the scene and the forms stand either side of the globe.
    // Every spot is inside the room's round wall (radius 25), or the wall hides it.
    const items: Array<{ g: THREE.Group; w: number; wide: Spot; tall: Spot }> = [
      { g: column, w: 2.0, wide: [6.3, -22, 0.84], tall: [6.5, -22, 0.72] },
      { g: egg, w: 3.4, wide: [9.7, -21.6, 0.84], tall: [-8.6, -21, 0.72] },
      { g: ring, w: 4.0, wide: [13.0, -20.8, 0.84], tall: [13, -14, 0.7] },
    ];
    for (const it of items) {
      // the shade each throws on the floor under it
      const shade = new THREE.Mesh(new THREE.PlaneGeometry(it.w * 2.2, it.w * 1.3), new THREE.MeshBasicMaterial({ map: this.glow, color: 0x22344c, transparent: true, opacity: 0.3, depthWrite: false }));
      shade.rotation.x = -Math.PI / 2; shade.position.y = 0.05; shade.renderOrder = 4;
      this.forms.push({ g: it.g, shade, wide: it.wide, tall: it.tall });
      this.scene.add(it.g, shade);
    }
    this.placeForms(true);
  }

  /** Stand the three forms for this shape of window, each turned to the viewer. */
  private placeForms(wide: boolean) {
    for (const f of this.forms) {
      const [x, z, s] = wide ? f.wide : f.tall;
      f.g.scale.setScalar(s);
      f.g.position.set(x, 0, z);
      f.g.rotation.y = Math.atan2(-x, 11.4 - z);   // faces where the viewer stands
      f.shade.position.x = x + 0.3 * s; f.shade.position.z = z;
      f.shade.scale.setScalar(s);
      // on a wide window the project's name is set either side of the globe, where they would stand behind it
      f.g.visible = f.shade.visible = !wide;
    }
  }

  /** The project's picture for the face of a globe, cropped to fill 4:3. */
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
      grd.addColorStop(0, '#f1f7fc'); grd.addColorStop(1, '#3f7fe0');
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
    }
    return el;
  }

  /**
   * The face of a ball: its picture, laid on the side toward you, swelling at the centre, curving away and
   * melting into the white of the ball toward its rim (printed on, not seen through); and the ball's own soft
   * shading round and under it.
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
          // shows the middle of it, small; the one over the podium (uOpen) opens
          // until nearly the whole picture shows
          float hw = mix(0.83, 0.72, uOpen);                            // half the picture's width, across the ball
          vec2 uv = vec2(n.x / hw, n.y / (hw * 0.75)) * 0.5 + 0.5;
          // round, not square: the picture fades out in a soft circle so it melts into the ball
          float r = length(n.xy);
          float inside = 1.0 - smoothstep(mix(0.46, 0.66, uOpen), mix(0.79, 0.9, uOpen), r);
          vec3 pic = texture2D(uMap, clamp(uv, 0.0, 1.0)).rgb;
          pic *= 0.84 + 0.16 * n.z;                                    // a touch darker as it curves away
          float pa = inside * smoothstep(mix(0.2, 0.06, uOpen), mix(0.62, 0.36, uOpen), n.z);
          // The ball's own shading, laid over its lit white so it reads as a round, soft, solid thing: a cool
          // shade that gathers toward its edge and underneath. Matte: there is no highlight anywhere on it.
          float rim = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.2);
          float under = smoothstep(0.15, -0.95, n.y);
          float sa = clamp(rim * 0.55 + under * 0.2, 0.0, 0.62);
          vec3 shade = vec3(0.47, 0.57, 0.74);
          float a = pa + sa * (1.0 - pa);
          vec3 c = (pic * pa + shade * sa * (1.0 - pa)) / max(a, 0.0001);
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
    // matte white, like the white pieces on the landing page's board
    const matte = new THREE.MeshStandardMaterial({ color: 0xf4f7fb, roughness: 1, metalness: 0, envMapIntensity: 0.3 });
    const blank = this.own(new THREE.CanvasTexture(this.cardCanvas(null)));
    blank.colorSpace = THREE.SRGBColorSpace;
    this.opts.covers.forEach((url, i) => {
      const mesh = new THREE.Mesh(geo, matte);
      mesh.castShadow = true;
      mesh.userData.index = i;
      // the picture, on the face of the ball toward you
      const cardMat = this.orbMat(blank);
      if (url) this.skin(url, cardMat);
      const card = new THREE.Mesh(geo, cardMat);
      card.renderOrder = 8;
      this.planets.push({ mesh, card, focus: 0, edge: 0 });
      this.scene.add(mesh, card);
    });


    // a breath of blue behind the ball on the podium, so white reads against the white wall
    this.aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glow, color: BLUE, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    this.aura.position.set(FOCUS.x, FOCUS.y - 0.25, FOCUS.z - 1.2);
    this.aura.scale.set(8.2, 8.2, 1);
    this.aura.renderOrder = 2;
    this.scene.add(this.aura);
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

  /**
   * Where a point of the ring in the floor sits on the canvas, in CSS pixels, as last drawn. `phi` is the angle
   * round the ring from its nearest point to you (positive to the right); `k` scales the radius, for a point
   * inside or outside the ring. Words that ride the ring are placed from this.
   */
  orbitOnScreen(phi: number, k = 1) {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    this.probe.set(Math.sin(phi) * ORBIT * k, 0, Math.cos(phi) * ORBIT * k).project(this.camera);
    return { x: (this.probe.x + 1) * 0.5 * w, y: (1 - this.probe.y) * 0.5 * h };
  }

  private apply(t: number) {
    const f = this.f;
    // The landing, as it stood last frame: the disc gives a little under the globe and comes back, once.
    const land = this.pulse.value;
    const give = -0.085 * Math.exp(-land * 5.5) * Math.sin(Math.min(1, land * 3.2) * Math.PI);
    let lead = 0;
    this.planets.forEach((p, i) => {
      const d = i - f;
      // 1 when it is the one over the podium; it stays fully there while f is within 0.1 of it, so it is
      // not already drifting away while you read. Two neighbours always add up to 1, so they pass evenly.
      const k = gentle((0.92 - Math.abs(d)) / 0.84);
      lead = Math.max(lead, k);
      p.focus = k;
      const edge = smooth((3.4 - Math.abs(d)) / 0.9);             // three stand either side; beyond that they dwindle to nothing
      slot(d, this.v);
      // It lifts off the ring first, clear of the podium's edge, comes in over the podium on a long arc a little
      // higher than it needs, and is let down onto it: never a swoop, never a straight line.
      const kx = k, ky = smooth(k * 1.6), arc = Math.sin(Math.PI * k) * 0.75;
      p.mesh.position.set(
        this.v.x + (FOCUS.x - this.v.x) * kx + Math.sign(d) * k * (1 - k) * 2.2,   // they pass with room between them
        (this.v.y + (FOCUS.y - this.v.y) * ky + arc + give * k) * (k > 0 ? 1 : edge),
        this.v.z + (FOCUS.z - this.v.z) * kx
      );
      p.mesh.scale.setScalar((SMALL + (BIG - SMALL) * k) * edge);
      p.mesh.rotation.set(0, -Math.PI / 2, 0);
      p.mesh.visible = edge > 0.01;
      p.edge = edge;
    });

    // what belongs to the globe over the podium comes and goes with it
    (this.aura.material as THREE.SpriteMaterial).opacity = 0.03 + lead * 0.1;
    // The room's lights rise as a globe settles and sink while two are passing: the glow under the podium,
    // the ring in the ceiling and the light on the track all follow this one number.
    const lit = smooth((lead - 0.55) / 0.45);
    this.glowK.value = lit;
    this.turn.value = f * ARC;
    // Each time a different project comes down onto the disc, it lands: the disc gives, and a cloud of the
    // underglow's light is pressed out. The landing runs on the clock, not the scroll, so it plays through at
    // its own pace wherever the scroll stops.
    const settled = Math.round(clamp(f, 0, this.planets.length - 1));
    if (lit > 0.9 && settled !== this.pulseFor) { this.pulseFor = settled; this.pulseAt = t; }
    const pulse = clamp((t - this.pulseAt) / 2.4);
    this.pulse.value = pulse;
    this.disc.position.y = TOP - 0.1 + give;
    this.limb.position.y = TOP - 0.2 - 0.012 + give;
    for (const q of this.puffs) {
      const p = clamp((pulse - q.late) / (1 - q.late));
      const out = 1 - Math.pow(1 - p, 2.6);                 // quick at first, then drifting
      const o = Math.pow(1 - p, 1.6) * smooth(p / 0.07) * 0.34;
      q.sp.visible = o > 0.004;
      if (!q.sp.visible) continue;
      const r = 0.9 + q.reach * out;
      q.sp.position.set(Math.sin(q.a) * r, 0.3 + 0.2 * out, Math.cos(q.a) * r);
      q.sp.scale.setScalar(q.size * (0.7 + 1.1 * out));
      (q.sp.material as THREE.SpriteMaterial).opacity = o;
    }

    this.time.value = t;

    // the camera drifts, answers the pointer, and leans into each change of project and back out of it
    const m = this.opts.mobile;
    const px = this.eased.x, py = this.eased.y;
    const frac = f - Math.floor(f);
    const swing = Math.sin(Math.PI * frac) * (Math.floor(f) % 2 ? 1 : -1);
    const x = Math.sin(t * 0.09) * 0.32 + px * 0.9 + swing * 0.16;
    this.camera.position.set(x, (m ? 5.0 : 3.9) + py * 0.32 + Math.abs(swing) * 0.12, (m ? 22.5 : 17.2) - Math.abs(swing) * 0.3);
    this.camera.lookAt(x * 0.12 - px * 0.2, m ? 3.9 : 3.5, -2.0);
    // each picture lies on its ball's face toward you; the one over the podium opens up until nearly the
    // whole picture shows, so the project can be recognised from it
    for (const p of this.planets) {
      (p.card.material as THREE.ShaderMaterial).uniforms.uOpen.value = smooth((p.focus - 0.3) / 0.7);   // the picture opens late, as the ball is let down
      p.card.position.copy(p.mesh.position);
      p.card.scale.copy(p.mesh.scale).multiplyScalar(1.004);
      p.card.visible = p.mesh.visible;
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
    if (w / h >= 1.25) this.camera.setViewOffset(w, h, 0, h * 0.075, w, h);   // centred, and a little high: the words are set round the globe and along the ring
    else if (w / h < 0.8) this.camera.setViewOffset(w, h, 0, h * 0.17, w, h);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
    this.placeForms(w / h >= 1.25);
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
    this.renderer.dispose();
  }
}
