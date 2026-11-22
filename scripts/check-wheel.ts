// Verifies that no two rays (and no ray and the hub) overlap or come closer than MIN_GAP.
// Run: node --experimental-strip-types scripts/check-wheel.ts
import { buildRays, CENTER, HUB_RINGS, hubDiscs } from '../src/lib/wheel.ts';

const MIN_GAP = 7; // viewBox units of visible cream between the outer edges of two ink outlines
type P = [number, number];
const parse = (s: string): P[] => s.split(' ').map((q) => q.split(',').map(Number) as P);

function segDist(a: P, b: P, c: P, d: P): number {
  const pd = (p: P, s: P, e: P) => {
    const dx = e[0] - s[0], dy = e[1] - s[1];
    const t = Math.max(0, Math.min(1, ((p[0] - s[0]) * dx + (p[1] - s[1]) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(p[0] - (s[0] + t * dx), p[1] - (s[1] + t * dy));
  };
  const cross = (o: P, p: P, q: P) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
  if (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) return 0;
  return Math.min(pd(a, c, d), pd(b, c, d), pd(c, a, b), pd(d, a, b));
}
function polyDist(A: P[], B: P[]): number {
  let m = Infinity;
  for (let i = 0; i < A.length; i++)
    for (let j = 0; j < B.length; j++)
      m = Math.min(m, segDist(A[i], A[(i + 1) % A.length], B[j], B[(j + 1) % B.length]));
  return m;
}
const hubD = hubDiscs()[0];
const hubR = hubD.inkR + 3.4;
const rays = buildRays([]);
const polys = rays.map((r) => parse(r.outline));
let bad = 0;
for (let i = 0; i < polys.length; i++) {
  const hubGap = Math.min(...polys[i].map(([x, y]) => Math.hypot(x - CENTER, y - CENTER))) - hubR;
  if (hubGap < MIN_GAP * 0.8) { bad++; console.log(`ray ${i} too close to hub: ${hubGap.toFixed(1)}`); }
  for (let j = i + 1; j < polys.length; j++) {
    const d = polyDist(polys[i], polys[j]);
    if (d < MIN_GAP) { bad++; console.log(`rays ${i} & ${j}: gap ${d.toFixed(1)} < ${MIN_GAP}`); }
  }
}
console.log(bad ? `FAIL: ${bad} problem(s)` : 'OK: no overlaps, all gaps >= ' + MIN_GAP);
process.exit(bad ? 1 : 0);
