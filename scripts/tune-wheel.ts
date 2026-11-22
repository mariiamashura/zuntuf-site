// One-off helper: nudges ray angles/widths until all ink outlines keep the required gap. Prints new TEMPLATES values.
import { TEMPLATES, buildRays, CENTER, hubDiscs } from '../src/lib/wheel.ts';
type P = [number, number];
const parse = (s: string): P[] => s.split(' ').map((q) => q.split(',').map(Number) as P);
function sd(a: P, b: P, c: P, d: P) {
  const pd = (p: P, s: P, e: P) => { const dx = e[0]-s[0], dy = e[1]-s[1]; const t = Math.max(0, Math.min(1, ((p[0]-s[0])*dx+(p[1]-s[1])*dy)/(dx*dx+dy*dy||1))); return Math.hypot(p[0]-s[0]-t*dx, p[1]-s[1]-t*dy); };
  const cr = (o: P, p: P, q: P) => (p[0]-o[0])*(q[1]-o[1])-(p[1]-o[1])*(q[0]-o[0]);
  if (cr(a,b,c)*cr(a,b,d) < 0 && cr(c,d,a)*cr(c,d,b) < 0) return 0;
  return Math.min(pd(a,c,d), pd(b,c,d), pd(c,a,b), pd(d,a,b));
}
const pdist = (A: P[], B: P[]) => { let m = Infinity; for (let i=0;i<A.length;i++) for (let j=0;j<B.length;j++) m = Math.min(m, sd(A[i],A[(i+1)%A.length],B[j],B[(j+1)%B.length])); return m; };
const hubR = hubDiscs()[0].inkR + 3.4;
const TARGET = 9;
function score() {
  const P = buildRays([]).map((r) => parse(r.outline));
  let worst = Infinity;
  for (let i = 0; i < P.length; i++) {
    worst = Math.min(worst, Math.min(...P[i].map(([x,y]) => Math.hypot(x-CENTER,y-CENTER))) - hubR + 1.5);
    for (let j = i+1; j < P.length; j++) worst = Math.min(worst, pdist(P[i], P[j]));
  }
  return worst;
}
const orig = TEMPLATES.map((t) => ({ a: t.a, w0: t.w0, w1: t.w1 }));
let best = score();
let seed = 7; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let it = 0; it < 4000 && best < TARGET; it++) {
  const k = Math.floor(r() * TEMPLATES.length);
  const t = TEMPLATES[k];
  const old = { a: t.a, w0: t.w0, w1: t.w1 };
  t.a += (r() - 0.5) * 3;
  if (r() < 0.4) t.w0 = Math.max(orig[k].w0 * 0.88, t.w0 - r() * 1.2);
  if (t.w1 && r() < 0.4) t.w1 = Math.max((orig[k].w1 as number) * 0.88, t.w1 - r() * 1.2);
  const s = score();
  if (s >= best - 0.02 && Math.abs(t.a - orig[k].a) < 14) best = Math.max(best, s); else { t.a = old.a; t.w0 = old.w0; t.w1 = old.w1; }
}
console.log('worst gap', best.toFixed(1));
for (const t of TEMPLATES) console.log(JSON.stringify({ ...t, a: +t.a.toFixed(1), w0: +t.w0.toFixed(1), ...(t.w1 ? { w1: +t.w1.toFixed(1) } : {}) }));
