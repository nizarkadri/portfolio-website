import * as THREE from 'three';
import { pieceGeometry, type PieceKind } from '../world/pieces';
import { boardTexture, clamp01, FOG, glowTexture, makeRenderer, shadowTexture, smooth, stone, studioEnvironment, THREAD } from '../marble/studio';

/* ==========================================================================
   Experience, as one world: the landing's pale studio, held behind the whole
   page while the camera glides through it with the scroll. It never stops,
   it only goes on to the next place:

     the start      a black marble king on its plinth, in the mist
     the walk       a marble runway; each result of the first role stands up
                    as a column as tall as its figure as the camera passes
     the migration  the servers lift off an on-premise rack one by one and
                    arc up into a cloud
     the pieces     five pieces on plinths: the one chosen lifts and turns;
                    then the page carries them away with their section

   Everything is a function of one number from the scroll (s, 0 to 5, one
   unit per section of the page), so nothing pops: it can only glide.
   ========================================================================== */

export interface WorldSetup { walk: number[][]; servers: number; kinds: PieceKind[] }
export interface Anchor { x: number; y: number; on: number }

type V3 = [number, number, number];
/** A knot of the route: where the camera stands and looks, and how the picture sits in the window. On a wide screen
 *  the words take the left, so the picture moves right by sx (a fraction of the width). On a narrow one the words take
 *  the top: the camera stands back by pull, and the picture moves by nx across and sy down. */
type Key = { s: number; pos: V3; look: V3; sx: number; sy: number; nx: number; pull: number };

const GAP = 4.4, WALK_X = 1.5;
const tall = (v: number) => 0.45 + (v / 100) * 3.4;
const MAIN_R = 0.42;
const PIECE_GAP = 2.05;

/** Where each place stands: the walk is as long as its results, and the others keep their distance from its end. */
function layout(walkCount: number) {
  const last = WALK_X + Math.max(0, walkCount - 1) * GAP;
  const rackX = last + 12;
  const cloud = new THREE.Vector3(rackX + 3.3, 4.8, -1.4);
  return { last, rackX, cloud, piecesX: cloud.x + 15 };
}

/** The camera's route: where it stands and what it looks at, at each knot of s. After the pieces it holds; the page
 *  carries the pieces away with their section (see lift in draw) and the world steps back behind the credentials. */
function route(L: ReturnType<typeof layout>): Key[] {
  const mid = (L.rackX + L.cloud.x) / 2, P = L.piecesX;
  return [
    { s: 0.0, pos: [-13, 3.0, 10.5], look: [-5.5, 2.3, -1], sx: 0.13, sy: -0.12, nx: 0, pull: 1.45 },
    { s: 0.9, pos: [-5.5, 3.4, 11.5], look: [-0.5, 2.5, 0], sx: 0.02, sy: 0.08, nx: 0.2, pull: 1.2 },
    { s: 1.05, pos: [WALK_X + 0.4, 3.6, 11.8], look: [WALK_X + 2.6, 2.5, 0], sx: 0, sy: 0.16, nx: 0.48, pull: 1.15 },
    { s: 1.95, pos: [L.last + 0.4, 3.6, 11.8], look: [L.last + 2.6, 2.5, 0], sx: 0, sy: 0.16, nx: 0.48, pull: 1.15 },
    { s: 2.15, pos: [mid - 1.6, 4.9, 15.2], look: [mid, 2.9, -0.4], sx: 0.17, sy: 0.22, nx: 0, pull: 1.55 },
    { s: 2.9, pos: [mid - 0.8, 5.0, 15.4], look: [mid + 0.2, 2.9, -0.4], sx: 0.17, sy: 0.22, nx: 0, pull: 1.55 },
    { s: 3.1, pos: [P - 1.0, 3.0, 10.8], look: [P, 1.05, -0.3], sx: 0, sy: -0.15, nx: 0, pull: 2.35 },
    { s: 3.42, pos: [P - 0.5, 2.95, 10.6], look: [P, 1.05, -0.3], sx: 0, sy: -0.15, nx: 0, pull: 2.35 },
    { s: 5.0, pos: [P - 0.3, 2.9, 10.5], look: [P, 1.05, -0.3], sx: 0, sy: -0.15, nx: 0, pull: 2.35 },
  ];
}

export class ExperienceWorld {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(36, 1, 0.1, 400);
  private clock = new THREE.Clock();
  private keepers: Array<{ dispose: () => void }> = [];
  private posCurve: THREE.CatmullRomCurve3;
  private lookCurve: THREE.CatmullRomCurve3;
  private keys: Key[];
  private L: ReturnType<typeof layout>;
  private pos = new THREE.Vector3();
  private look = new THREE.Vector3();
  private posTo = new THREE.Vector3();
  private lookTo = new THREE.Vector3();
  private key: THREE.DirectionalLight;
  private fog: THREE.FogExp2;
  private cols: Array<{ meshes: THREE.Mesh[]; caps: THREE.Mesh[]; heights: number[]; x: number; z: number; king?: THREE.Mesh; mark: THREE.Mesh }> = [];
  private blocks: Array<{ m: THREE.Mesh; led: THREE.Mesh; from: THREE.Vector3; to: THREE.Vector3 }> = [];
  private pieces: Array<{ piece: THREE.Mesh; ring: THREE.Mesh; base: THREE.Vector3; lift: number; turn: number; face: number }> = [];
  private cloud = new THREE.Group();
  private shift = new THREE.Vector2();
  private shiftTo = new THREE.Vector2();
  private frame = new THREE.Vector4();
  /** Where on the page the servers leave and how long they take (s units): the phone gives them less room. */
  moveFrom = 2.08;
  moveSpan = 0.74;
  private pointer = new THREE.Vector2();
  private eased = new THREE.Vector2();
  private v = new THREE.Vector3();
  private first = true;
  private running = false;
  private disposed = false;
  private mobile: boolean;
  /** Screen positions of each walk column's label, and of each piece, as last drawn. */
  walkAnchors: Anchor[] = [];
  pieceAnchors: Anchor[] = [];

  constructor(private canvas: HTMLCanvasElement, setup: WorldSetup, mobile: boolean) {
    this.mobile = mobile;
    const L = (this.L = layout(setup.walk.length));
    const r = (this.renderer = makeRenderer(canvas, { mobile, shadows: true }));
    const keep = <T extends { dispose: () => void }>(x: T) => { this.keepers.push(x); return x; };
    this.scene.environment = studioEnvironment(r, keep);
    this.scene.environmentIntensity = 0.85;
    this.fog = new THREE.FogExp2(FOG, 0.024);
    this.scene.fog = this.fog;
    this.scene.add(new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.MeshBasicMaterial({ color: FOG, side: THREE.BackSide, depthWrite: false })));
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xc6d2e0, 1.0));
    // one soft key that travels with the camera, so every place has the same short, gentle shadows
    this.key = new THREE.DirectionalLight(0xffffff, 1.45);
    this.key.castShadow = true;
    const kc = this.key.shadow.camera; kc.left = -14; kc.right = 14; kc.top = 12; kc.bottom = -12; kc.near = 1; kc.far = 60;
    this.key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048); this.key.shadow.bias = -0.0005; this.key.shadow.normalBias = 0.02;
    const fill = new THREE.DirectionalLight(0xe4edf7, 0.4); fill.position.set(-8, 6, 10);
    this.scene.add(this.key, this.key.target, fill);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 300), new THREE.MeshStandardMaterial({ color: 0xe9f1f8, roughness: 0.36, metalness: 0, envMapIntensity: 0.35 }));
    ground.rotation.x = -Math.PI / 2; ground.position.x = 20; ground.receiveShadow = true;
    this.scene.add(ground);

    const bone = stone('bone', keep), dark = stone('dark', keep), plinthStone = stone('bone', keep, 0.41);
    const shade = shadowTexture(keep), glow = glowTexture(keep);
    const shadow = (x: number, z: number, size: number, y = 0.004) => {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: shade, transparent: true, depthWrite: false }));
      s.rotation.x = -Math.PI / 2; s.position.set(x, y, z); this.scene.add(s);
    };
    const piece = (kind: PieceKind, mat: THREE.Material, x: number, z: number, scale: number, y = 0, ry = 0) => {
      const m = new THREE.Mesh(pieceGeometry(kind), mat);
      m.position.set(x, y, z); m.scale.setScalar(scale); m.rotation.y = ry; m.castShadow = true; m.userData.shared = true;
      this.scene.add(m); return m;
    };

    // ---- the start: a king on its plinth, with a pawn and a knight standing off in the mist
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.4, 0.5, 72), plinthStone);
    plinth.position.set(-6, 0.25, -1.2); plinth.castShadow = true; plinth.receiveShadow = true;
    this.scene.add(plinth);
    piece('king', dark, -6, -1.2, 2.5, 0.5);
    piece('pawn', bone, -9.4, 1.2, 1.4);
    piece('knight', dark, -3.0, 2.0, 1.5, 0, -Math.PI / 2.4);
    shadow(-6, -1.2, 4.6); shadow(-9.4, 1.2, 1.6); shadow(-3.0, 2.0, 1.8);

    // ---- the walk: a runway of the landing's board, and a column per figure along it
    const len = Math.max(8, (setup.walk.length - 1) * GAP + 5);
    const tex = boardTexture(keep);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(len / 8, 3 / 8);
    const runway = new THREE.Mesh(new THREE.PlaneGeometry(len, 3), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3, metalness: 0, envMapIntensity: 0.45 }));
    runway.rotation.x = -Math.PI / 2; runway.position.set(WALK_X - 2.5 + len / 2, 0.302, 0); runway.receiveShadow = true;
    const runSlab = new THREE.Mesh(new THREE.BoxGeometry(len + 0.5, 0.3, 3.5), stone('bone', keep, 0.37));
    runSlab.position.set(WALK_X - 2.5 + len / 2, 0.15, 0); runSlab.castShadow = true; runSlab.receiveShadow = true;
    this.scene.add(runSlab, runway);
    const colGeo = new THREE.CylinderGeometry(1, 1.04, 1, 56, 1); colGeo.translate(0, 0.5, 0);
    const capGeo = new THREE.TorusGeometry(1, 0.06, 8, 64); capGeo.rotateX(Math.PI / 2);
    const capMat = new THREE.MeshBasicMaterial({ color: THREAD });
    setup.walk.forEach((figs, i) => {
      const x = WALK_X + i * GAP, z = i % 2 ? -0.3 : 0.3;
      const meshes: THREE.Mesh[] = [], caps: THREE.Mesh[] = [], heights: number[] = [];
      let king: THREE.Mesh | undefined;
      if (figs.length) {
        // the second figure stands just behind and to the left, so the words on the right stay clear of both
        figs.slice(0, 2).forEach((v, j) => {
          const rad = j === 0 ? MAIN_R : 0.24;
          const m = new THREE.Mesh(colGeo, bone);
          m.position.set(x + (j === 0 ? 0 : -0.7), 0.3, z + (j === 0 ? 0 : -0.4));
          m.scale.set(rad, 0.001, rad); m.castShadow = true; m.receiveShadow = true;
          const cap = new THREE.Mesh(capGeo, capMat); cap.scale.setScalar(rad); cap.position.copy(m.position); cap.visible = false;
          meshes.push(m); caps.push(cap); heights.push(tall(v));
          this.scene.add(m, cap);
        });
      } else {
        king = piece('king', dark, x, z, 0.001, 0.3);
      }
      const mark = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: glow, color: THREAD, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
      mark.rotation.x = -Math.PI / 2; mark.position.set(x, 0.31, z); mark.renderOrder = 2;
      this.scene.add(mark);
      this.cols.push({ meshes, caps, heights, x, z, king, mark });
    });
    this.walkAnchors = this.cols.map(() => ({ x: 0, y: 0, on: 0 }));

    // ---- the migration: a rack of servers on the ground, a marble cloud above, and the move between them
    const rack = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.4, 1.8), plinthStone);
    rack.position.set(L.rackX, 0.2, 0); rack.castShadow = true; rack.receiveShadow = true;
    this.scene.add(rack); shadow(L.rackX, 0, 5.4);
    // the cloud: a deck held up on a bank of soft marble puffs, all of it breathing a little
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.35, 0.22, 72), plinthStone);
    deck.castShadow = true; deck.receiveShadow = true;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(2.43, 0.025, 8, 128), new THREE.MeshBasicMaterial({ color: THREAD }));
    rim.rotation.x = Math.PI / 2; rim.position.y = 0.11;
    this.cloud.add(deck, rim);
    const puff = new THREE.SphereGeometry(1, 40, 24);
    const cloudStone = stone('bone', keep, 0.23);
    ([[0, -0.62, 0, 1.45], [1.55, -0.6, 0.35, 1.05], [-1.6, -0.58, 0.25, 1.1], [0.8, -0.78, 1.15, 0.92], [-0.85, -0.74, 1.1, 0.88],
      [2.5, -0.62, -0.3, 0.72], [-2.55, -0.6, -0.2, 0.76], [0.1, -0.7, -1.15, 1.0], [1.7, -0.75, -0.9, 0.7], [-1.6, -0.72, -0.95, 0.74]] as const)
      .forEach(([x, y, z, r]) => {
        const p = new THREE.Mesh(puff, cloudStone);
        p.position.set(x, y, z); p.scale.set(r, r * 0.52, r); p.castShadow = true; p.receiveShadow = true;
        this.cloud.add(p);
      });
    this.cloud.position.copy(L.cloud);
    this.scene.add(this.cloud);
    const n = Math.max(1, Math.min(30, setup.servers));
    const blockGeo = new THREE.BoxGeometry(0.74, 0.32, 0.86);
    const ledGeo = new THREE.SphereGeometry(0.035, 10, 8);
    const ledMat = new THREE.MeshBasicMaterial({ color: THREAD });
    const perRow = 4;
    for (let j = 0; j < n; j++) {
      const c = j % perRow, row = Math.floor(j / perRow);
      const from = new THREE.Vector3(L.rackX + (c - (perRow - 1) / 2) * 0.84, 0.4 + 0.17 + row * 0.38, 0);
      // in the cloud they stand as a new rack: five across, two deep, in layers
      const pc = j % 5, pr = Math.floor(j / 5) % 2, layer = Math.floor(j / 10);
      const to = new THREE.Vector3(L.cloud.x + (pc - 2) * 0.82, L.cloud.y + 0.11 + 0.165 + layer * 0.34, L.cloud.z + (pr - 0.5) * 0.92);
      const m = new THREE.Mesh(blockGeo, dark);
      m.castShadow = true; m.receiveShadow = true;
      const led = new THREE.Mesh(ledGeo, ledMat);
      this.scene.add(m, led);
      this.blocks.push({ m, led, from, to });
    }

    // ---- the pieces: five plinths in a shallow arc
    const pGeo = new THREE.CylinderGeometry(0.52, 0.54, 0.34, 72); pGeo.translate(0, 0.17, 0);
    const ringGeo = new THREE.TorusGeometry(0.49, 0.012, 8, 96); ringGeo.rotateX(Math.PI / 2);
    setup.kinds.forEach((kind, i) => {
      const d = i - (setup.kinds.length - 1) / 2;
      const base = new THREE.Vector3(L.piecesX + d * PIECE_GAP, 0, -Math.abs(d) * 0.3);
      const p = new THREE.Mesh(pGeo, plinthStone); p.position.copy(base); p.castShadow = true; p.receiveShadow = true;
      const face = kind === 'knight' ? Math.PI / 2.2 : 0;
      const pc = piece(kind, dark, base.x, base.z, 1, 0.34, face);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: THREAD, transparent: true, opacity: 0.2 }));
      ring.position.copy(base).setY(0.344);
      this.scene.add(p, ring);
      shadow(base.x, base.z, 1.6);
      this.pieces.push({ piece: pc, ring, base, lift: 0, turn: 0, face });
    });
    this.pieceAnchors = this.pieces.map(() => ({ x: 0, y: 0, on: 0 }));

    this.keys = route(L);
    this.posCurve = new THREE.CatmullRomCurve3(this.keys.map((k) => new THREE.Vector3(...k.pos)), false, 'centripetal');
    this.lookCurve = new THREE.CatmullRomCurve3(this.keys.map((k) => new THREE.Vector3(...k.look)), false, 'centripetal');
    this.resize();
    try { r.compile(this.scene, this.camera); } catch { /* a warm-up, never a requirement */ }
  }

  setPointer(x: number, y: number) { this.pointer.set(x, y); }

  /** s along the curves' own parameter: each knot of KEYS evenly spaced, linear between them. */
  private along(s: number) {
    const K = this.keys, k = K.length - 1;
    if (s <= K[0].s) return 0;
    for (let i = 0; i < k; i++) {
      const a = K[i], b = K[i + 1];
      if (s <= b.s) return (i + (s - a.s) / (b.s - a.s)) / k;
    }
    return 1;
  }

  /** How the picture sits at u (sx, sy, nx, pull), eased between knots. */
  private frameAt(u: number, out: THREE.Vector4) {
    const K = this.keys, f = u * (K.length - 1), i = Math.min(K.length - 2, Math.floor(f)), e = smooth(f - i);
    const a = K[i], b = K[i + 1];
    return out.set(a.sx + (b.sx - a.sx) * e, a.sy + (b.sy - a.sy) * e, a.nx + (b.nx - a.nx) * e, a.pull + (b.pull - a.pull) * e);
  }

  /** s: where the page is (0 to 5); chosen and hover: the piece chosen and the one under the pointer (-1 for none). */
  draw(s: number, chosen: number, hover: number, lift = 0) {
    if (!this.running || this.disposed) return;
    const dt = Math.min(this.clock.getDelta(), 0.05), t = this.clock.elapsedTime;
    this.eased.lerp(this.pointer, 1 - Math.pow(0.03, dt));
    const settle = 1 - Math.pow(0.002, dt);

    // the camera: the route, sampled at s, with a little give, and a breath of the pointer
    const u = this.along(s);
    this.posCurve.getPoint(u, this.posTo);
    this.lookCurve.getPoint(u, this.lookTo);
    // the picture sits beside the words: to the right on a wide screen; on a narrow one further back, and lower
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    const narrow = this.mobile || this.camera.aspect < 1;
    const fr = this.frameAt(u, this.frame);
    if (narrow) { this.posTo.sub(this.lookTo).multiplyScalar(fr.w).add(this.lookTo); this.shiftTo.set(fr.z, fr.y); }
    else this.shiftTo.set(fr.x, 0);
    this.posTo.x += this.eased.x * 0.6 + Math.sin(t * 0.1) * 0.15;
    this.posTo.y += this.eased.y * 0.3;
    if (this.first) { this.pos.copy(this.posTo); this.look.copy(this.lookTo); this.shift.copy(this.shiftTo); this.first = false; }
    const follow = 1 - Math.pow(0.0006, dt);              // close to the scroll, with the edges taken off
    this.pos.lerp(this.posTo, follow);
    this.look.lerp(this.lookTo, follow);
    this.shift.lerp(this.shiftTo, follow);
    // lift: pixels the page has carried the current place up by; taken exactly, never eased, so it moves with the page
    this.camera.setViewOffset(w, h, -this.shift.x * w, -this.shift.y * h + lift, w, h);
    this.camera.position.copy(this.pos);
    this.camera.lookAt(this.look);
    this.key.position.copy(this.look).add(this.v.set(6, 14, 8));
    this.key.target.position.copy(this.look);
    // the mist closes as the camera rises over everything at the end
    this.fog.density = 0.024 + smooth((s - 4.0) / 0.5) * 0.02;

    // the walk: each column stands up as it comes in from the right of the window, and stays
    this.camera.updateMatrixWorld();
    this.cols.forEach((c, i) => {
      const u = this.v.set(c.x, 0.3, c.z).project(this.camera).x;
      const k = smooth((1.1 - u) / 0.75);
      c.meshes.forEach((m, j) => {
        const hh = c.heights[j] * smooth((k - j * 0.15) / 0.85);
        m.scale.y = Math.max(0.001, hh);
        c.caps[j].position.y = 0.3 + hh; c.caps[j].visible = hh > 0.05;
      });
      if (c.king) { const kk = smooth(k); c.king.scale.setScalar(0.001 + 1.25 * kk); c.king.rotation.y = (1 - kk) * 1.4; }
      (c.mark.material as THREE.MeshBasicMaterial).opacity = 0.35 * k;
      // the words hang just off the column's right shoulder; on a narrow screen, over its top
      const top = 0.3 + (c.heights.length ? (narrow ? Math.max(...c.heights) : c.heights[0]) : 2.6) * k;
      this.v.set(narrow ? c.x : c.x + MAIN_R + 0.12, top + 0.1, c.z).project(this.camera);
      const a = this.walkAnchors[i];
      a.x = (this.v.x + 1) * 0.5 * w; a.y = (1 - this.v.y) * 0.5 * h;
      const onScreen = this.v.z < 1 && a.x > -w * 0.3 && a.x < w * 1.05;
      const edge = narrow ? smooth((Math.min(a.x, w - a.x) - 0.12 * w) / (0.18 * w)) : 1;
      a.on = onScreen ? smooth((k - 0.45) / 0.4) * edge : 0;
    });

    // the migration: each server lifts off the rack in turn and arcs up into the cloud
    const m = clamp01((s - this.moveFrom) / this.moveSpan);
    const nb = this.blocks.length;
    const breath = Math.sin(t * 0.45) * 0.06;
    this.cloud.position.y = this.L.cloud.y + breath;
    this.cloud.rotation.y = Math.sin(t * 0.21) * 0.03;
    this.blocks.forEach((b, j) => {
      const k = smooth((m - (j / nb) * 0.68) / 0.32);
      const mid = this.v.copy(b.from).lerp(b.to, 0.5); mid.y += 2.0; mid.z += 1.0;
      const a = (1 - k), bb = k;
      b.m.position.set(
        a * a * b.from.x + 2 * a * bb * mid.x + bb * bb * b.to.x,
        a * a * b.from.y + 2 * a * bb * mid.y + bb * bb * b.to.y + bb * breath,
        a * a * b.from.z + 2 * a * bb * mid.z + bb * bb * b.to.z
      );
      b.m.rotation.set(Math.sin(Math.PI * k) * 0.35, Math.sin(Math.PI * k) * 0.8, 0);
      b.led.position.copy(b.m.position).add(this.v.set(0.26, 0.05, 0.44));
      b.led.visible = k < 0.02 || k > 0.98 ? true : Math.sin(t * 9 + j) > 0;
    });

    // the pieces: the chosen one lifts and turns slowly; the one under the pointer lifts a little
    this.pieces.forEach((p, i) => {
      const target = i === chosen ? 0.42 : i === hover ? 0.14 : 0;
      p.lift += (target - p.lift) * settle;
      p.piece.position.y = 0.34 + p.lift;
      p.piece.scale.setScalar(i === chosen ? 1.12 : 1);
      if (i === chosen) p.turn += dt * 0.55; else p.turn += (Math.round(p.turn / (Math.PI * 2)) * Math.PI * 2 - p.turn) * settle * 0.6;
      p.piece.rotation.y = p.face + p.turn;
      const rm = p.ring.material as THREE.MeshBasicMaterial;
      rm.opacity += ((i === chosen ? 0.95 : i === hover ? 0.5 : 0.2) - rm.opacity) * settle;
      this.v.copy(p.base).project(this.camera);
      const a = this.pieceAnchors[i];
      a.x = (this.v.x + 1) * 0.5 * w; a.y = (1 - this.v.y) * 0.5 * h; a.on = this.v.z < 1 ? 1 : 0;
    });

    this.renderer.render(this.scene, this.camera);
  }

  start() { if (this.running || this.disposed) return; this.running = true; this.clock.start(); }
  stop() { this.running = false; this.clock.stop(); }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth, h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w / h < 0.8 ? 46 : w / h < 1.25 ? 40 : 36;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.scene.traverse((o) => {
      const mm = o as THREE.Mesh;
      if (!mm.userData.shared) (mm.geometry as THREE.BufferGeometry | undefined)?.dispose();
      const mat = mm.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose?.();
    });
    this.keepers.forEach((d) => d.dispose());
    this.renderer.dispose();
  }
}
