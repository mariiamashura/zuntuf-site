/**
 * Entrance timeline. All values in seconds. Edit here; they become CSS variables (--m-<group>-<key>)
 * and drive the JS timers. Slow, smooth version (author's request); `total` is the point where the intro ends by itself.
 */
/** Global speed knob: 1 = base timings below, 1.3 = 30% slower everywhere (CSS and JS follow). */
export const PACE = 1;

const base = {
  ripple: { at: 0, count: 4, gap: 0.35, dur: 3.0 },
  web: { at: 0.35, dur: 1.5, stagger: 0.05 }, // a thin geometric web is drawn from the edges of the site inward
  pull: { at: 1.7, dur: 1.5 }, // the web is drawn tight toward the star and fades away
  hub: { at: 1.5, dur: 0.9, stagger: 0.12 }, // the star starts inside: rings of the hub are drawn first
  grow: { at: 2.1, dur: 1.0, stagger: 0.08 }, // rays grow outward from the hub
  flood: { at: 2.8, dur: 1.3 }, // cream paper spreads from the centre
  fill: { at: 3.1, dur: 0.7, stagger: 0.05 }, // colour fills the shapes
  spin: { at: 4.3, dur: 3.0 }, // the wheel floats and spins around one axis: fast first, then slowing to a stop
  nav: { at: 4.6, dur: 1.5, stagger: 0.16 }, // upper menu "butterflies"
  foot: { at: 5.2, dur: 1.4, stagger: 0.12 }, // footer tiles fall into place
  live: 7.3, // wheel and menu become interactive (after the spin lands)
  total: 7.7, // intro class removed (final state is the plain page)
} as const;

function scaled<T extends Record<string, any>>(o: T): T {
  const out: any = {};
  for (const [k, v] of Object.entries(o)) {
    if (typeof v === 'number') out[k] = +(v * PACE).toFixed(3);
    else { out[k] = {}; for (const [kk, n] of Object.entries(v)) out[k][kk] = kk === 'count' ? n : +((n as number) * PACE).toFixed(3); }
  }
  return out;
}
export const motion = scaled(base);

/** CSS custom properties for :root, e.g. --m-draw-at: 0.45s */
export function motionCss(): string {
  const out: string[] = [];
  for (const [group, v] of Object.entries(motion)) {
    if (typeof v === 'number') out.push(`--m-${group}:${v}s`);
    else for (const [k, n] of Object.entries(v)) out.push(`--m-${group}-${k}:${k === 'count' ? n : n + 's'}`);
  }
  return `:root{${out.join(';')}}`;
}
