import * as THREE from 'three';

/* ==========================================================================
   Procedural stone and sky. Everything tiles, nothing is downloaded.
   ========================================================================== */

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function hash(x: number, y: number, s: number) {
  let n = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 1442695041);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/** Value noise on a lattice that wraps every `period` cells, so the result tiles. */
function pnoise(x: number, y: number, period: number, seed: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const x0 = ((xi % period) + period) % period, x1 = (x0 + 1) % period;
  const y0 = ((yi % period) + period) % period, y1 = (y0 + 1) % period;
  const a = hash(x0, y0, seed), b = hash(x1, y0, seed), c = hash(x0, y1, seed), d = hash(x1, y1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(u: number, v: number, freq: number, oct: number, seed: number) {
  let sum = 0, amp = 0.5, norm = 0, f = freq;
  for (let o = 0; o < oct; o++) {
    sum += amp * pnoise(u * f, v * f, f, seed + o * 17);
    norm += amp; amp *= 0.5; f *= 2;
  }
  return sum / norm;
}

function pixels(size: number, h: number, fill: (u: number, v: number, out: [number, number, number]) => void) {
  const el = document.createElement('canvas');
  el.width = size; el.height = h;
  const ctx = el.getContext('2d')!;
  const img = ctx.createImageData(size, h);
  const d = img.data;
  const out: [number, number, number] = [0, 0, 0];
  for (let y = 0; y < h; y++) for (let x = 0; x < size; x++) {
    fill(x / size, y / h, out);
    const i = (y * size + x) * 4;
    d[i] = out[0]; d[i + 1] = out[1]; d[i + 2] = out[2]; d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return el;
}

export type Stone = 'carrara' | 'marquina' | 'limestone' | 'slate' | 'mist';

/** A tileable slab of stone, drawn pixel by pixel. */
export function stoneCanvas(kind: Stone, size = 512, seed = 1) {
  return pixels(size, size, (u, v, o) => {
    const wx = fbm(u, v, 2, 3, seed) - 0.5, wy = fbm(u, v, 2, 3, seed + 31) - 0.5;
    const cloud = fbm(u, v, 2, 4, seed + 91);
    if (kind === 'carrara') {
      const t = fbm(u + wx * 0.6, v + wy * 0.6, 3, 5, seed + 7);
      const t2 = fbm(u + wy * 0.35, v + wx * 0.35, 6, 4, seed + 53);
      const mask = smooth(0.34, 0.62, fbm(u, v, 2, 3, seed + 5));
      const dist = Math.abs(t - 0.5);
      const vein = (1 - smooth(0, 0.013, dist)) * (0.3 + mask * 0.7);
      const halo = (1 - smooth(0, 0.075, dist)) * 0.16 * mask;
      const fine = (1 - smooth(0, 0.007, Math.abs(t2 - 0.5))) * 0.22;
      const k = Math.min(1, vein * 0.5 + halo + fine * 0.5);
      const base = 228 + (cloud - 0.5) * 12;
      o[0] = base * 0.995 * (1 - k) + 122 * k;
      o[1] = base * 0.99 * (1 - k) + 128 * k;
      o[2] = base * 0.975 * (1 - k) + 140 * k;
    } else if (kind === 'marquina') {
      const t = fbm(u + wx * 0.45, v + wy * 0.45, 2, 4, seed + 7);
      const t2 = fbm(u + wy * 0.4, v + wx * 0.4, 5, 4, seed + 53);
      const mask = smooth(0.4, 0.62, fbm(u, v, 2, 3, seed + 5)) * 0.5;
      const vein = (1 - smooth(0, 0.009, Math.abs(t - 0.5))) * mask;
      const fine = (1 - smooth(0, 0.006, Math.abs(t2 - 0.5))) * smooth(0.55, 0.75, cloud) * 0.07;
      const k = Math.min(1, vein * 0.85 + fine);
      const base = 13 + cloud * 9;
      o[0] = base * (1 - k) + 214 * k;
      o[1] = (base + 1) * (1 - k) + 210 * k;
      o[2] = (base + 3) * (1 - k) + 200 * k;
    } else if (kind === 'mist') {
      // the dark square of a pale board: cool grey stone with a lighter vein
      const t = fbm(u + wx * 0.5, v + wy * 0.5, 3, 5, seed + 7);
      const vein = (1 - smooth(0, 0.02, Math.abs(t - 0.5))) * smooth(0.4, 0.65, cloud) * 0.5;
      const base = 168 + (cloud - 0.5) * 16;
      o[0] = base * 0.93 * (1 - vein) + 232 * vein;
      o[1] = base * 0.985 * (1 - vein) + 238 * vein;
      o[2] = base * 1.06 * (1 - vein) + 246 * vein;
    } else if (kind === 'limestone') {
      const grain = hash(Math.floor(u * size), Math.floor(v * size), seed) - 0.5;
      const bed = fbm(u + wx * 0.2, v * 3 + wy * 0.2, 2, 4, seed + 7) - 0.5;
      const base = 172 + (cloud - 0.5) * 22 + bed * 16 + grain * 7;
      o[0] = base * 1.0; o[1] = base * 0.975; o[2] = base * 0.93;
    } else {
      const grain = hash(Math.floor(u * size), Math.floor(v * size), seed) - 0.5;
      const t = fbm(u + wx * 0.5, v + wy * 0.5, 3, 4, seed + 7);
      const vein = (1 - smooth(0, 0.02, Math.abs(t - 0.5))) * 0.12;
      const base = 34 + (cloud - 0.5) * 12 + grain * 4 + vein * 60;
      o[0] = base * 0.93; o[1] = base * 0.97; o[2] = base * 1.06;
    }
  });
}

export function asTexture(el: HTMLCanvasElement, repeat?: [number, number]) {
  const t = new THREE.CanvasTexture(el);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

/** Eight ranks of board: Carrara and Marquina squares with a hairline brass inlay. */
export function boardCanvas(light: HTMLCanvasElement, dark: HTMLCanvasElement, seed = 3, inlay = '#a98a5c', groove = 0.5) {
  const size = 2048, q = size / 8;
  const el = document.createElement('canvas');
  el.width = el.height = size;
  const c = el.getContext('2d')!;
  let s = seed;
  const r = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const src = (x + y) % 2 === 0 ? light : dark;
    const span = src.width - q;
    // every square is its own cut of the slab: a different place, turned and flipped
    c.save();
    c.translate(x * q + q / 2, y * q + q / 2);
    c.rotate(Math.floor(r() * 4) * Math.PI / 2);
    c.scale(r() > 0.5 ? 1 : -1, 1);
    c.drawImage(src, Math.floor(r() * span), Math.floor(r() * span), q, q, -q / 2, -q / 2, q, q);
    c.restore();
  }
  // inlay: a warm metal hairline with a shadow line either side of it
  for (let i = 0; i <= 8; i++) {
    const p = Math.min(size - 1.5, Math.max(1.5, i * q));
    c.fillStyle = `rgba(20,30,45,${groove})`;
    c.fillRect(p - 3.5, 0, 7, size); c.fillRect(0, p - 3.5, size, 7);
  }
  for (let i = 0; i <= 8; i++) {
    const p = Math.min(size - 1.5, Math.max(1.5, i * q));
    c.fillStyle = inlay;
    c.fillRect(p - 1.5, 0, 3, size); c.fillRect(0, p - 1.5, size, 3);
  }
  return el;
}

/** Wall panels: limestone with fine joints. One tile is 2 panels wide, 2 high. */
export function panelCanvas(src: HTMLCanvasElement) {
  const size = src.width;
  const el = document.createElement('canvas');
  el.width = el.height = size;
  const c = el.getContext('2d')!;
  c.drawImage(src, 0, 0);
  const h = size / 2;
  for (const p of [0.5, h + 0.5]) {
    c.fillStyle = 'rgba(20,18,16,0.55)';
    c.fillRect(p - 1, 0, 2, size); c.fillRect(0, p - 1, size, 2);
    c.fillStyle = 'rgba(255,255,255,0.14)';
    c.fillRect(p + 1, 0, 1, size); c.fillRect(0, p + 1, size, 1);
  }
  return el;
}

/**
 * The sky at blue hour, equirectangular. Zenith at the top row, horizon in the
 * middle, a sea of cloud below it. The last warm light sits at `sun` (0..1 round).
 */
export function skyCanvas(sun = 0.56, w = 2048, h = 1024) {
  const mix = (a: number[], b: number[], t: number) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const zen = [7, 12, 28], high = [18, 31, 62], mid = [44, 66, 108], low = [112, 122, 152], hor = [198, 166, 146];
  const warm = [242, 158, 102], seaTop = [108, 110, 134], seaMid = [42, 54, 82], seaLow = [12, 18, 32];
  return pixels(w, h, (u, v, o) => {
    const el = 0.5 - v;                    // +0.5 zenith, 0 horizon, -0.5 nadir
    let du = Math.abs(u - sun); if (du > 0.5) du = 1 - du;
    const glow = Math.exp(-(du * du) / 0.035);
    let c: number[];
    if (el >= 0) {
      const e = el * 2;                    // 0..1
      c = e < 0.06 ? mix(hor, low, e / 0.06) : e < 0.2 ? mix(low, mid, (e - 0.06) / 0.14) : e < 0.5 ? mix(mid, high, (e - 0.2) / 0.3) : mix(high, zen, (e - 0.5) / 0.5);
      c = mix(c, warm, glow * Math.exp(-(e * e) / 0.012) * 0.85);
      // long thin cloud, lit from underneath on the warm side
      const n = fbm(u, v * 9, 4, 5, 11);
      const band = smooth(0.42, 0.6, n) * smooth(0.0, 0.03, e) * (1 - smooth(0.3, 0.62, e));
      const lit = mix([58, 74, 112], [232, 156, 112], glow * (1 - smooth(0, 0.3, e)));
      c = mix(c, lit, band * 0.85);
    } else {
      const e = -el * 2;                   // 0..1 down
      c = e < 0.08 ? mix(hor, seaTop, e / 0.08) : e < 0.4 ? mix(seaTop, seaMid, (e - 0.08) / 0.32) : mix(seaMid, seaLow, (e - 0.4) / 0.6);
      c = mix(c, warm, glow * Math.exp(-(e * e) / 0.01) * 0.6);
      const n = fbm(u, v * 5, 6, 5, 23);
      c = mix(c, [c[0] * 0.72, c[1] * 0.74, c[2] * 0.8], smooth(0.4, 0.7, n) * smooth(0.02, 0.2, e));
    }
    o[0] = c[0]; o[1] = c[1]; o[2] = c[2];
  });
}

/** A pale studio sky: near white at the horizon, a breath of blue overhead, thin high cloud. */
export function paleSkyCanvas(w = 1024, h = 512) {
  const top = [198, 217, 238], hor = [232, 242, 251], low = [214, 228, 242];
  return pixels(w, h, (u, v, o) => {
    const el = 0.5 - v, e = Math.abs(el) * 2;
    const a = el >= 0 ? top : low;
    const t = smooth(0, el >= 0 ? 0.75 : 0.6, e);
    const n = fbm(u, v * 6, 4, 4, 11);
    const c = smooth(0.5, 0.74, n) * (1 - smooth(0.2, 0.7, e)) * 0.55;
    for (let i = 0; i < 3; i++) {
      const base = hor[i] + (a[i] - hor[i]) * t;
      o[i] = base + (252 - base) * c;
    }
  });
}

/** A tileable field of cloud: white, with the density in the alpha channel. */
export function cloudCanvas(size = 512, seed = 41) {
  const el = document.createElement('canvas');
  el.width = el.height = size;
  const ctx = el.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  const d = img.data;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size;
    const w = fbm(u, v, 2, 3, seed + 9) - 0.5;
    const n = fbm(u + w * 0.5, v + w * 0.5, 3, 5, seed);
    const i = (y * size + x) * 4;
    const shade = 236 + smooth(0.3, 0.75, n) * 19;
    d[i] = shade; d[i + 1] = shade; d[i + 2] = shade;
    d[i + 3] = smooth(0.1, 0.36, n) * 255;
  }
  ctx.putImageData(img, 0, 0);
  return el;
}

export function radialCanvas(size: number, stops: Array<[number, string]>) {
  const el = document.createElement('canvas');
  el.width = el.height = size;
  const c = el.getContext('2d')!;
  const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [at, col] of stops) g.addColorStop(at, col);
  c.fillStyle = g; c.fillRect(0, 0, size, size);
  return el;
}

export function gradientCanvas(stops: Array<[number, string]>, size = 256) {
  const el = document.createElement('canvas');
  el.width = 4; el.height = size;
  const c = el.getContext('2d')!;
  const g = c.createLinearGradient(0, 0, 0, size);
  for (const [at, col] of stops) g.addColorStop(at, col);
  c.fillStyle = g; c.fillRect(0, 0, 4, size);
  return el;
}
