/**
 * The author's face, rebuilt from the reference artwork as flat pieces (800 x 800 reference space).
 * One source of truth for the interactive face on the About page, the site logo and the favicon.
 * Mustard shapes have no outline; the brown parts are separate bars, exactly like the reference.
 */
export type Pt = [number, number];
export const C = {
  mustard: '#E8AA20',
  yellow: '#F5C42A',
  coral: '#F05249',
  ochre: '#96601F',
  brown: '#512B19',
  cream: '#F5EED8',
};
export const CX = 390; // vertical axis of the face

const rect = (x1: number, y1: number, x2: number, y2: number): Pt[] => [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];
const mirror = (p: Pt[]): Pt[] => p.map(([x, y]) => [2 * CX - x, y] as Pt).reverse();

export interface Piece { id: string; pts: Pt[]; fill: string }

/** flat polygons, back to front */
export const pieces: Piece[] = [
  // head frame: a bar on top, two diagonal bars, the mustard forehead
  { id: 'bar-top', pts: rect(262, 18, 514, 38), fill: C.brown },
  { id: 'diag-l', pts: [[256, 32], [274, 44], [194, 204], [170, 192]], fill: C.brown },
  { id: 'diag-r', pts: mirror([[256, 32], [274, 44], [194, 204], [170, 192]]), fill: C.brown },
  { id: 'forehead', pts: [[268, 52], [512, 52], [572, 205], [204, 205]], fill: C.mustard },
  // cheeks and temples
  { id: 'cheek-l', pts: [[175, 285], [215, 252], [305, 358], [268, 395]], fill: C.mustard },
  { id: 'cheek-r', pts: mirror([[175, 285], [215, 252], [305, 358], [268, 395]]), fill: C.mustard },
  { id: 'brow-l', pts: [[160, 308], [176, 296], [262, 394], [246, 410]], fill: C.brown },
  { id: 'brow-r', pts: mirror([[160, 308], [176, 296], [262, 394], [246, 410]]), fill: C.brown },
  { id: 'mid-l', pts: [[232, 428], [292, 412], [332, 452], [272, 474]], fill: C.mustard },
  { id: 'mid-r', pts: mirror([[232, 428], [292, 412], [332, 452], [272, 474]]), fill: C.mustard },
  { id: 'side-l', pts: rect(204, 392, 222, 525), fill: C.brown },
  { id: 'side-r', pts: rect(558, 392, 576, 525), fill: C.brown },
  { id: 'jaw-l', pts: [[243, 520], [275, 505], [332, 575], [300, 605]], fill: C.mustard },
  { id: 'jaw-r', pts: mirror([[243, 520], [275, 505], [332, 575], [300, 605]]), fill: C.mustard },
  // small ticks under the nose
  { id: 'tick-l', pts: [[338, 418], [352, 414], [362, 436], [348, 442]], fill: C.brown },
  { id: 'tick-r', pts: mirror([[338, 418], [352, 414], [362, 436], [348, 442]]), fill: C.brown },
  // mouth
  { id: 'lip', pts: rect(370, 442, 408, 466), fill: C.mustard },
  { id: 'bar-mouth', pts: rect(290, 482, 492, 498), fill: C.brown },
  { id: 'bar-mouth2', pts: rect(336, 512, 444, 526), fill: C.brown },
  { id: 'chin', pts: rect(345, 563, 443, 604), fill: C.yellow },
  { id: 'bar-chin', pts: [[312, 618], [492, 618], [492, 638], [312, 638]], fill: C.brown },
];

const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
/** incenter and inradius of a triangle */
function incircle(t: Pt[]): { c: Pt; r: number } {
  const [a, b, c] = t;
  const la = dist(b, c), lb = dist(a, c), lc = dist(a, b), per = la + lb + lc;
  const area = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2;
  return { c: [(la * a[0] + lb * b[0] + lc * c[0]) / per, (la * a[1] + lb * b[1] + lc * c[1]) / per], r: area / (per / 2) };
}
/** the same triangle, pulled inward by d */
function inset(t: Pt[], d: number): Pt[] {
  const { c, r } = incircle(t);
  const k = Math.max(0, 1 - d / r);
  return t.map((p) => [c[0] + (p[0] - c[0]) * k, c[1] + (p[1] - c[1]) * k] as Pt);
}

/** eyes: a large brown triangular frame, a cream inside, and a spiral that the triangle cuts off */
const eyeL: Pt[] = [[192, 220], [364, 220], [298, 354]];
const eyeR = mirror(eyeL);
export const eyes = [eyeL, eyeR].map((outer, i) => {
  const inner = inset(outer, 15);
  const { c } = incircle(outer);
  return { id: i ? 'eye-r' : 'eye-l', outer, inner, sx: Math.round(c[0]), sy: Math.round(c[1]) - 8 };
});

/** nose: brown trapezoid with an ochre inside */
export const nose = {
  outer: [[356, 220], [424, 220], [472, 412], [300, 412]] as Pt[],
  inner: [[374, 246], [406, 246], [446, 394], [332, 394]] as Pt[],
};

export function wavePath(x1: number, x2: number, y: number, amp: number, halves: number): string {
  const step = (x2 - x1) / halves;
  let d = `M${x1} ${y}`;
  for (let i = 0; i < halves; i++) d += ` q${step / 2} ${i % 2 ? amp : -amp} ${step} 0`;
  return d;
}
export const waves = [wavePath(340, 445, 468, 7, 4), wavePath(293, 490, 500, 7, 6), wavePath(350, 440, 534, 6, 3)];

export function spiralPath(cx: number, cy: number, rMax: number, turns: number): string {
  const steps = Math.round(turns * 36);
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, a = t * turns * Math.PI * 2, r = t * rMax;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
  }
  return d;
}

/** concentric arcs at the bottom (circles around a far centre, cut by the frame) */
export const arcs = {
  cx: 403,
  cy: 930,
  rings: [
    { r: 271, w: 22, c: C.brown },
    { r: 241, w: 30, c: C.mustard },
    { r: 241, w: 4, c: C.coral },
    { r: 210, w: 20, c: C.brown },
    { r: 179, w: 30, c: C.mustard },
    { r: 179, w: 4, c: C.coral },
    { r: 149, w: 18, c: C.brown },
    { r: 122, w: 24, c: C.mustard },
  ],
};

export const pts = (p: Pt[]) => p.map((q) => q.join(',')).join(' ');
export const centroid = (p: Pt[]): Pt => [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];

/** A spiral drawn as a ribbon whose width swells and thins along its length (closed polygon, fill it). */
export function spiralRibbon(rMax: number, turns: number, wMin: number, wMax: number): string {
  const steps = Math.round(turns * 48);
  const left: string[] = [], right: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, a = t * turns * Math.PI * 2, r = t * rMax;
    const w = wMin + (wMax - wMin) * (0.5 + 0.5 * Math.sin(a * 1.15 + 0.6)); // swells and thins about every turn
    const c = Math.cos(a), sn = Math.sin(a);
    left.push(`${((r + w / 2) * c).toFixed(1)},${((r + w / 2) * sn).toFixed(1)}`);
    right.push(`${((r - w / 2) * c).toFixed(1)},${((r - w / 2) * sn).toFixed(1)}`);
  }
  return left.concat(right.reverse()).join(' ');
}

/** The same idea for a wavy line. */
export function waveRibbon(x1: number, x2: number, y: number, amp: number, halves: number, wMin: number, wMax: number): string {
  const n = halves * 14, top: string[] = [], bot: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x1 + (x2 - x1) * t;
    const yy = y - Math.sin(t * halves * Math.PI) * amp * 0.9;
    const w = wMin + (wMax - wMin) * (0.5 + 0.5 * Math.sin(t * Math.PI * 2.6 + halves));
    top.push(`${x.toFixed(1)},${(yy - w / 2).toFixed(1)}`);
    bot.push(`${x.toFixed(1)},${(yy + w / 2).toFixed(1)}`);
  }
  return top.concat(bot.reverse()).join(' ');
}
export const waveRibbons = [waveRibbon(340, 445, 468, 7, 4, 2, 5), waveRibbon(293, 490, 500, 7, 6, 2, 5), waveRibbon(350, 440, 534, 6, 3, 2, 4.6)];
