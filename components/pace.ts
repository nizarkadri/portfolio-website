/**
 * The pacing every scrubbed sequence on the site shares (the Work room, the Experience stage):
 * near each item the scroll only creeps, so there is time to read it, and the change from one
 * item to the next happens in the middle of its step. Every bit of scroll still moves it.
 */
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ease = (v: number) => { const k = clamp01(v); return k * k * (3 - 2 * k); };

export const HOLD = 0.2;   // at each end of a step, the share of it where the item is all but still
export const CREEP = 0.14; // how much it still moves while held, so the scroll never feels stuck

/** Scroll progress (0 to 1) to a place among n items: 2.5 is half way between the third and the fourth. */
export function paced(p: number, n: number) {
  if (n < 2) return 0;
  const x = clamp01(p) * (n - 1);
  const i = Math.min(n - 2, Math.floor(x));
  const t = x - i;
  return i + (1 - CREEP) * ease((t - HOLD) / (1 - 2 * HOLD)) + CREEP * t;
}

/**
 * How far in a piece of words is, 0 to 1, at distance d from its item. `s` (0 to 1) is its place in
 * the order: the first piece arrives first and also leaves first, whichever way the scroll is going.
 * Every piece is fully in while |d| is within FULL.
 */
export const GONE = 0.42, FADE = 0.18, FULL = 0.12;
const SPREAD = GONE - FADE - FULL;
export function rise(d: number, s: number) {
  const order = d < 0 ? s : 1 - s;
  return ease((GONE - Math.abs(d) - order * SPREAD) / FADE);
}
