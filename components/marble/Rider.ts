import * as THREE from 'three';
import { pieceGeometry, type PieceKind } from '../world/pieces';
import { makeRenderer, shadowTexture, stone, studioEnvironment } from './studio';

/**
 * One marble piece, the landing's stone, on a clear canvas: lit like the landing's studio, standing in a soft
 * pool of shade. The page turns it, leans it and lifts it; it never animates on its own.
 */
export class Rider {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);
  private pivot = new THREE.Group();
  private mesh: THREE.Mesh;
  private keepers: Array<{ dispose: () => void }> = [];
  private height: number;
  private face: number;

  constructor(private canvas: HTMLCanvasElement, kind: PieceKind, tone: 'bone' | 'dark') {
    const r = (this.renderer = makeRenderer(canvas, { alpha: true }));
    const keep = <T extends { dispose: () => void }>(x: T) => { this.keepers.push(x); return x; };
    this.scene.environment = studioEnvironment(r, keep);
    this.scene.environmentIntensity = 0.9;
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xc6d2e0, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 1.35);
    key.position.set(3, 6, 4);
    this.scene.add(key);

    this.mesh = new THREE.Mesh(pieceGeometry(kind), stone(tone, keep));   // the geometry is cached and shared: not disposed here
    this.face = kind === 'knight' ? Math.PI / 2 : 0;                      // the knight shows its profile
    this.height = new THREE.Box3().setFromObject(this.mesh).max.y;
    const blob = new THREE.Mesh(keep(new THREE.PlaneGeometry(1.3, 1.3)), keep(new THREE.MeshBasicMaterial({ map: shadowTexture(keep, 0.45), transparent: true, depthWrite: false })));
    blob.rotation.x = -Math.PI / 2; blob.position.y = 0.001;
    this.pivot.add(this.mesh);
    this.scene.add(this.pivot, blob);
    this.resize();
  }

  /** Show a different piece in the same place and light. */
  setKind(kind: PieceKind) {
    this.mesh.geometry = pieceGeometry(kind);
    this.face = kind === 'knight' ? Math.PI / 2 : 0;
    this.mesh.rotation.y = this.face;
    this.height = new THREE.Box3().setFromObject(this.mesh).max.y;
    this.resize();
  }

  resize() {
    const w = this.canvas.clientWidth || 70, h = this.canvas.clientHeight || 100;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // framed so the whole piece fits with a little air, seen from slightly above
    const fitH = (this.height * 1.32) / 2 / Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const fitW = fitH / Math.min(1, this.camera.aspect * 1.6);
    const fit = Math.max(fitH, fitW);
    this.camera.position.set(0, this.height * 0.78, fit);
    this.camera.lookAt(0, this.height * 0.48, 0);
    this.camera.updateProjectionMatrix();
  }

  /** Turned by `turn` radians, leaning by `lean` (into the direction of travel), lifted by `lift` (0 to 1). */
  draw(turn: number, lean = 0, lift = 0) {
    this.mesh.rotation.y = turn + this.face;
    this.pivot.rotation.x = lean;
    this.pivot.position.y = lift * this.height * 0.14;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.keepers.forEach((d) => d.dispose());
    this.renderer.dispose();
  }
}
