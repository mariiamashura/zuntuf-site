/**
 * Star-wheel geometry generator.
 * Hand-authored ray templates are converted to SVG polygons. Real items (tools, projects)
 * take template slots in priority order; remaining slots stay decorative. Nothing here is
 * rendered from guesses: with zero items the wheel is purely a graphic.
 *
 * Coordinates: viewBox 0..1000, centre (500,500). Angle 0 = up, clockwise (degrees).
 * Local ray space: u = distance along the ray from the centre, v = lateral offset.
 */

export type Fill = 'mustard' | 'coral' | 'ochre' | 'cream' | 'brown';
export type RayType = 'spike' | 'wedge' | 'bar' | 'arrow';

export interface RayTemplate {
  a: number; // axis angle
  r1: number; // outer radius (tip)
  type: RayType;
  w0: number; // half-width at the inner end
  w1?: number; // half-width at the outer end (wedge) / arrow head half-width
  head?: number; // arrow head length
  skew?: number; // lateral shift of the outer end: breaks perfect symmetry
  fill: Fill;
}

export const CENTER = 500;
export const R_START = 144; // rays start just outside the hub, leaving a cream gap

/** 10 rays. Irregular spacing, lengths and widths on purpose (hand-composed feel). */
export const TEMPLATES: RayTemplate[] = [
  { a: -5.1, r1: 442, type: 'spike', w0: 23.9, skew: 4, fill: 'mustard' },
  { a: 33.4, r1: 305, type: 'wedge', w0: 20.9, w1: 69.8, skew: -6, fill: 'coral' },
  { a: 69.4, r1: 392, type: 'bar', w0: 8.1, fill: 'brown' },
  { a: 97.7, r1: 345, type: 'wedge', w0: 38.5, w1: 96.9, skew: 8, fill: 'ochre' },
  { a: 141.8, r1: 432, type: 'arrow', w0: 14.9, w1: 44.4, head: 100, fill: 'mustard' },
  { a: 174, r1: 258, type: 'bar', w0: 36, fill: 'cream' },
  { a: 216, r1: 452, type: 'spike', w0: 34.2, skew: -12, fill: 'coral' },
  { a: 251.6, r1: 398, type: 'wedge', w0: 23.1, w1: 59.3, skew: 4, fill: 'mustard' },
  { a: 290.9, r1: 300, type: 'bar', w0: 29.2, fill: 'ochre' },
  { a: 320.3, r1: 362, type: 'arrow', w0: 22.9, w1: 59.1, head: 90, fill: 'cream' },
];

/** Which slots real items take first (wide, good click targets first; thin planks last). */
export const ITEM_PRIORITY = [3, 7, 1, 4, 6, 8, 0, 9, 5, 2];
export const MAX_ITEMS = TEMPLATES.length;

export interface WheelItem {
  id: string;
  href: string;
  label: string;
  description?: string;
  accent?: Fill;
}

export interface Ray {
  index: number;
  points: string;
  fill: Fill;
  angle: number;
  /** unit vector of the ray axis (for outward hover movement later) */
  dir: [number, number];
  tip: [number, number];
  /** polygon of the variable-width ink outline (drawn under the fill shape) */
  outline: string;
  item?: WheelItem;
}

const rad = (d: number) => (d * Math.PI) / 180;
const fmt = (n: number) => Math.round(n * 10) / 10;

function localPoints(t: RayTemplate): [number, number][] {
  const w1 = t.w1 ?? t.w0;
  const sk = t.skew ?? 0;
  switch (t.type) {
    case 'spike':
      return [[R_START, -t.w0], [t.r1, sk], [R_START, t.w0]];
    case 'bar':
    case 'wedge':
      return [[R_START, -t.w0], [t.r1, -w1 + sk], [t.r1, w1 + sk], [R_START, t.w0]];
    case 'arrow': {
      const rh = t.r1 - (t.head ?? 80);
      return [[R_START, -t.w0], [rh, -t.w0], [rh, -w1], [t.r1, sk], [rh, w1], [rh, t.w0], [R_START, t.w0]];
    }
  }
}

/** deterministic pseudo-random in 0..1 */
const rnd = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7 + 17.3) * 43758.5453;
  return x - Math.floor(x);
};

export const INK_MIN = 1.5; // thinnest part of an outline
export const INK_MAX = 8.6; // thickest part

/**
 * Variable-width outline: every vertex gets its own thickness, so each edge thickens or thins
 * along its length like a pressed brush. The result is an outer polygon, miter-joined, that is drawn
 * under the unstroked fill shape; only the band between the two stays visible.
 */
export function inkOutline(pts: [number, number][], seed: number, min = INK_MIN, max = INK_MAX): string {
  const n = pts.length;
  let area = 0;
  for (let i = 0; i < n; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % n]; area += x1 * y2 - x2 * y1; }
  const sgn = area >= 0 ? 1 : -1;
  const unit = (dx: number, dy: number): [number, number] => { const l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const p = pts[(i - 1 + n) % n], v = pts[i], q = pts[(i + 1) % n];
    const e1 = unit(v[0] - p[0], v[1] - p[1]);
    const e2 = unit(q[0] - v[0], q[1] - v[1]);
    const n1: [number, number] = [sgn * e1[1], -sgn * e1[0]];
    const n2: [number, number] = [sgn * e2[1], -sgn * e2[0]];
    const m = unit(n1[0] + n2[0], n1[1] + n2[1]);
    const cos = Math.max(0.38, m[0] * n1[0] + m[1] * n1[1]);
    // alternate heavy / light vertices with some jitter, so neighbouring edges visibly taper
    const heavy = (i + seed) % 2 === 0;
    const span = max - min;
    const t = heavy ? max - rnd(seed, i) * span * 0.37 : min + rnd(seed, i + 9) * span * 0.34;
    const d = t * Math.min(1 / cos, 2.4);
    out.push(`${fmt(v[0] + m[0] * d)},${fmt(v[1] + m[1] * d)}`);
  }
  return out.join(' ');
}

/** Hub discs, outermost first. Each brown disc sits slightly off-centre under its fill, so the ring thickens on one side. */
export function hubDiscs(cx = CENTER, cy = CENTER, ink = 6.2, off = 3.4) {
  return HUB_RINGS.map((h, i) => {
    const phi = ((i * 71 + 25) * Math.PI) / 180;
    return { r: h.r, fill: h.fill, inkR: h.r + ink, ox: cx + Math.cos(phi) * off, oy: cy + Math.sin(phi) * off, cx, cy };
  });
}

export function buildRays(items: WheelItem[]): Ray[] {
  const slotItem = new Map<number, WheelItem>();
  items.slice(0, MAX_ITEMS).forEach((it, i) => slotItem.set(ITEM_PRIORITY[i], it));

  return TEMPLATES.map((t, index) => {
    const th = rad(t.a);
    const d: [number, number] = [Math.sin(th), -Math.cos(th)];
    const p: [number, number] = [Math.cos(th), Math.sin(th)];
    const toXY = ([u, v]: [number, number]): [number, number] => [CENTER + u * d[0] + v * p[0], CENTER + u * d[1] + v * p[1]];
    const pts = localPoints(t).map(toXY);
    const item = slotItem.get(index);
    return {
      index,
      points: pts.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' '),
      fill: item?.accent ?? t.fill,
      angle: t.a,
      dir: d,
      tip: toXY([t.r1, t.skew ?? 0]),
      outline: inkOutline(pts, index),
      item,
    };
  });
}

/** Hub: concentric rings from the outside in. */
export const HUB_RINGS: { r: number; fill: Fill }[] = [
  { r: 120, fill: 'cream' },
  { r: 98, fill: 'mustard' },
  { r: 72, fill: 'cream' },
  { r: 48, fill: 'coral' },
  { r: 24, fill: 'cream' },
];
