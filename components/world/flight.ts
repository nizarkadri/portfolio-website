/** The flight plan. One fixed stage, seven legs, one pace.
 *
 *  Leg n flies from scene n-1 to scene n, so a scene sits on the boundary
 *  between two legs. `w` is scroll room in viewport-heights and is held
 *  proportional to clip length, so the world never surges or drags.
 *  The last leg is a slow drift over the final position: it gives the close
 *  somewhere to land. */
export interface Leg {
  id: string;
  w: number;
  label: string;
}

export const LEGS: Leg[] = [
  { id: 'leg1', w: 1.3, label: 'Opening' },
  { id: 'leg2', w: 1.3, label: 'Calculation' },
  { id: 'leg3', w: 1.3, label: 'The work' },
  { id: 'leg4', w: 1.3, label: 'Experience' },
  { id: 'leg5', w: 2.6, label: 'The tower' },
  { id: 'leg6', w: 1.3, label: 'Your move' },
  { id: 'leg7', w: 1.3, label: 'Your move' },
];

export const TOTAL = LEGS.reduce((n, l) => n + l.w, 0);

/** Where each leg starts, in viewport-heights from the top of the track. */
export const STARTS = LEGS.reduce<number[]>((acc, l, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + LEGS[i - 1].w);
  return acc;
}, []);

/** Scene n rests where leg n ends (scene 0 is the first frame). */
export const sceneAt = (n: number) => (n === 0 ? 0 : STARTS[n - 1] + LEGS[n - 1].w);

export type Tone = 'day' | 'night';

/** A beat of copy: when it is on screen (in viewport-heights along the track),
 *  which scene it belongs to, and whether it is read on marble or on night. */
export interface Beat {
  key: 'open' | 'calc' | 'work' | 'city' | 'tower' | 'close';
  san: string;
  fn: string;
  label: string;
  scene: number;
  from: number;
  to: number;
  tone: Tone;
}

const around = (scene: number, before: number, after: number) => ({ from: sceneAt(scene) - before, to: sceneAt(scene) + after });

export const BEATS: Beat[] = [
  { key: 'open', san: 'e4', fn: 'open()', label: 'Opening', scene: 0, from: 0, to: 0.62 * LEGS[0].w, tone: 'day' },
  { key: 'calc', san: 'Nf3', fn: 'calculate()', label: 'Calculation', scene: 1, ...around(1, 0.5, 0.2), tone: 'day' },
  { key: 'work', san: 'Bc4', fn: 'ship(3)', label: 'The work', scene: 2, ...around(2, 0.4, 0.34), tone: 'night' },
  { key: 'city', san: 'O-O', fn: 'deploy("toronto")', label: 'Experience', scene: 3, ...around(3, 0.5, 0.3), tone: 'night' },
  // The tower is the peak: it holds for the whole climb.
  { key: 'tower', san: 'd4', fn: 'prove()', label: 'The tower', scene: 4, from: sceneAt(4) + 0.12, to: sceneAt(5) - 0.1, tone: 'night' },
  { key: 'close', san: 'Re1', fn: 'await yourMove()', label: 'Your move', scene: 6, from: sceneAt(6) - 0.55, to: TOTAL + 1, tone: 'night' },
];

/** Without motion the posters are the film, and leg n+1 shows scene n. Each
 *  beat moves to the middle of the leg that holds its picture. */
export const STILL_BEATS: Beat[] = BEATS.map((b) => {
  const leg = Math.min(b.scene, LEGS.length - 1);
  const c0 = STARTS[leg], w = LEGS[leg].w;
  if (b.key === 'open') return b;
  if (b.key === 'close') return { ...b, from: c0 + 0.1, to: TOTAL + 1 };
  return { ...b, from: c0 + 0.16 * w, to: c0 + 0.9 * w };
});

/** The engine's copy window, as fractions of the whole track. */
export const windowOf = (b: Beat) => {
  if (b.key === 'open') return 'hero';
  const f = (v: number) => Math.min(1, Math.max(0, v / TOTAL)).toFixed(4);
  return b.key === 'close' ? `${f(b.from)} 1 0.45 0` : `${f(b.from)} ${f(b.to)} 0.22 0.22`;
};

/** Opacity of a beat at track position t, mirroring the engine's plateau. */
export const beatOpacity = (b: Beat, t: number) => {
  if (b.key === 'open') return 1 - smooth((t - b.to * 0.35) / (b.to * 0.65));
  if (t <= b.from || t >= b.to) return b.key === 'close' && t >= b.to ? 1 : 0;
  const win = b.to - b.from;
  if (b.key === 'close') return smooth((t - b.from) / (Math.min(win, TOTAL - b.from) * 0.45));
  const up = smooth((t - b.from) / (win * 0.22));
  const down = smooth((b.to - t) / (win * 0.22));
  return Math.min(up, down);
};

export function smooth(x: number) {
  const v = Math.min(1, Math.max(0, x));
  return v * v * (3 - 2 * v);
}
