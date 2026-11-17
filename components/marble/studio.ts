import * as THREE from 'three';
import { asTexture, boardCanvas, paleSkyCanvas, radialCanvas, stoneCanvas } from '../world/textures';

/* ==========================================================================
   The landing page's studio, as parts: the same pale air, the same soft white
   reflections, the same Carrara and Marquina stone. Every 3D thing on the
   About, Experience and Blog pages is made from these, so it all reads as one
   world with the landing page.
   ========================================================================== */

export const THREAD = 0x4f8fff;   // the landing's one blue
export const FOG = 0xe3f0fa;      // the mist, the page's own ground
export const INK = 0x0b0f15;

export type Keep = <T extends { dispose: () => void }>(x: T) => T;

export function makeRenderer(canvas: HTMLCanvasElement, opts: { alpha?: boolean; mobile?: boolean; shadows?: boolean } = {}) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: !!opts.alpha, powerPreference: opts.alpha ? 'low-power' : 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : opts.alpha ? 2 : 1.75));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1;
  if (opts.alpha) r.setClearColor(0x000000, 0); else r.setClearColor(FOG, 1);
  if (opts.shadows) { r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; }
  return r;
}

/** Soft white studio reflections: pale sky all round, one broad soft box overhead, a darker floor. */
export function studioEnvironment(r: THREE.WebGLRenderer, keep: Keep) {
  const sky = keep(asTexture(paleSkyCanvas(512, 256)));
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.SphereGeometry(50, 24, 12), new THREE.MeshBasicMaterial({ map: sky, side: THREE.BackSide })));
  const panel = (color: number, k: number, w: number, h: number, pos: [number, number, number]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
  };
  panel(0xffffff, 1.7, 26, 26, [4, 16, 6]);
  panel(0xdde8f3, 1, 40, 14, [-18, 4, 0]);
  panel(0x6f7f95, 1, 80, 80, [0, -7, 0]);
  const pm = new THREE.PMREMGenerator(r);
  const tex = keep(pm.fromScene(env, 0.03)).texture;
  pm.dispose();
  env.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose(); (m.material as THREE.Material | undefined)?.dispose(); });
  return tex;
}

/** Polished marble, as the landing's pieces are: bone Carrara or black Marquina. */
export function stone(kind: 'bone' | 'dark', keep: Keep, shift = 0) {
  const map = keep(asTexture(stoneCanvas(kind === 'dark' ? 'marquina' : 'carrara', 512, kind === 'dark' ? 9 : 3), [1, 1.4]));
  map.offset.set(shift, shift * 0.61);
  return keep(kind === 'dark'
    ? new THREE.MeshPhysicalMaterial({ map, roughness: 0.24, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.16, envMapIntensity: 0.85 })
    : new THREE.MeshPhysicalMaterial({ map, roughness: 0.34, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.22, envMapIntensity: 0.85 }));
}

/** The landing's board: Carrara and mist-grey squares, each its own cut of the slab. */
export function boardTexture(keep: Keep) {
  return keep(asTexture(boardCanvas(stoneCanvas('carrara', 512, 3), stoneCanvas('mist', 512, 21), 3, '#e6ecf3', 0.16)));
}

/** A soft pool of shade, so a thing on the floor stands rather than floats. */
export function shadowTexture(keep: Keep, alpha = 0.55) {
  return keep(asTexture(radialCanvas(128, [[0, `rgba(38,58,88,${alpha})`], [0.45, `rgba(38,58,88,${alpha * 0.4})`], [1, 'rgba(38,58,88,0)']])));
}

export function glowTexture(keep: Keep) {
  return keep(asTexture(radialCanvas(128, [[0, 'rgba(255,255,255,0.9)'], [0.3, 'rgba(255,255,255,0.32)'], [0.65, 'rgba(255,255,255,0.07)'], [1, 'rgba(255,255,255,0)']])));
}

export function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export const smooth = (t: number) => { const k = Math.min(1, Math.max(0, t)); return k * k * (3 - 2 * k); };
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
