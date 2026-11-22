/**
 * Intro maze, understated: only hints of the star's own geometry. A few of the real ray outlines are repeated as
 * nested, slightly turned echoes, but each one is drawn only partly (open, broken contours), with a couple of
 * thin corridors and one or two half-arcs of the hub. Fewer lines, fainter toward the edges, so the shapes are
 * suggested rather than spelled out. The CSS draws them from the outside in and then pulls them onto the star.
 */
const NS = 'http://www.w3.org/2000/svg';
const rnd = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7 + 5.1) * 43758.5453; return x - Math.floor(x); };

type P = [number, number];

export function buildWeb(cx: number, cy: number, wheel: SVGSVGElement): SVGSVGElement {
  const box = wheel.getBoundingClientRect();
  const s = box.width / 1000;
  const polys: P[][] = Array.from(wheel.querySelectorAll('.ray .vis')).map((el) => {
    const pts = el.getAttribute('points')!.trim().split(/\s+/).map((q) => { const [x, y] = q.split(',').map(Number); return [(x - 500) * s, (y - 500) * s] as P; });
    // arrow rays (7 corners) are echoed as plain spikes: no barbs, no hooked corner
    return pts.length === 7 ? [pts[0], pts[3], pts[6]] : pts;
  });

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'web');
  svg.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.style.transformOrigin = `${cx}px ${cy}px`;

  // outermost first; fainter the farther out
  const layers = [
    { k: 3.3, r: 7, o: 0.3 }, { k: 2.1, r: -4, o: 0.42 }, { k: 1.4, r: 2, o: 0.55 },
  ];
  // Keep every line inside the window: shrink all echoes together until the biggest one fits with a small margin.
  const MARGIN = 14;
  const rot = (p: P, deg: number): P => { const a = (deg * Math.PI) / 180; return [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)]; };
  let kFit = Infinity;
  const limit = (v: number, room: number) => { if (Math.abs(v) > 0.001) kFit = Math.min(kFit, Math.max(room, 0) / Math.abs(v)); };
  for (const L of layers) {
    for (const poly of polys) for (const q of poly) {
      const [x, y] = rot(q, L.r);
      limit(x * L.k, x > 0 ? innerWidth - MARGIN - cx : cx - MARGIN); // distance available on that side
      limit(y * L.k, y > 0 ? innerHeight - MARGIN - cy : cy - MARGIN);
    }
    limit(120 * s * L.k, Math.min(cx, innerWidth - cx, cy, innerHeight - cy) - MARGIN); // the echoed hub ring too
  }
  // `kFit` is the largest factor by which everything can still grow or must shrink to fit; never enlarge, only shrink
  const fit = Math.min(1, kFit);
  layers.forEach((L) => { L.k *= fit; });
  const place = (p: P, k: number, deg: number): P => {
    const a = (deg * Math.PI) / 180, c = Math.cos(a), sn = Math.sin(a);
    return [cx + (p[0] * c - p[1] * sn) * k, cy + (p[0] * sn + p[1] * c) * k];
  };
  const f = (p: P) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  const tipOf = (poly: P[]) => poly.reduce((m, q) => (Math.hypot(...q) > Math.hypot(...m) ? q : m), poly[0]);

  // Thin lines must never lie on top of each other: every line is cut at the point where it would cross, touch or
  // run right alongside a line that is already there (lines that meet end to end are fine). Outer layers win.
  type Seg = [number, number, number, number];
  const kept: Seg[] = [];
  const GAP = 7; // px: closer than this counts as overlapping
  const orient = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const crosses = (p: Seg, q: Seg) => {
    const d1 = orient(p[0], p[1], p[2], p[3], q[0], q[1]), d2 = orient(p[0], p[1], p[2], p[3], q[2], q[3]);
    const d3 = orient(q[0], q[1], q[2], q[3], p[0], p[1]), d4 = orient(q[0], q[1], q[2], q[3], p[2], p[3]);
    return d1 * d2 < 0 && d3 * d4 < 0;
  };
  const ptSeg = (x: number, y: number, s: Seg) => {
    const dx = s[2] - s[0], dy = s[3] - s[1], l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - s[0]) * dx + (y - s[1]) * dy) / l2));
    return Math.hypot(x - (s[0] + t * dx), y - (s[1] + t * dy));
  };
  const shares = (p: Seg, q: Seg) => [[p[0], p[1]], [p[2], p[3]]].some(([x, y]) => [[q[0], q[1]], [q[2], q[3]]].some(([u, v]) => Math.hypot(x - u, y - v) < 1.5));
  const free = (p: Seg) => !kept.some((q) => !shares(p, q) && (crosses(p, q) || Math.min(ptSeg(p[0], p[1], q), ptSeg(p[2], p[3], q), ptSeg(q[0], q[1], p), ptSeg(q[2], q[3], p)) < GAP));
  // a run of points becomes path data; wherever a segment would overlap, the run is broken and continues after it
  const pathOf = (runs: P[][]) => {
    let d = '';
    for (const run of runs) {
      let pen = false;
      for (let q = 0; q + 1 < run.length; q++) {
        const sg: Seg = [run[q][0], run[q][1], run[q + 1][0], run[q + 1][1]];
        if (free(sg)) { kept.push(sg); d += pen ? ` L${f(run[q + 1])}` : `M${f(run[q])} L${f(run[q + 1])}`; pen = true; } else pen = false;
      }
    }
    return d;
  };

  layers.forEach((L, j) => {
    const runs: P[][] = [];
    polys.forEach((poly, i) => {
      if (rnd(j + 3, i) < 0.55) return; // most shapes are simply left out
      // an open contour: only a run of consecutive corners, so the shape is implied, never closed
      const n = poly.length;
      const start = Math.floor(rnd(i, j + 9) * n);
      const count = Math.max(2, Math.min(n, Math.round(n * (0.4 + rnd(j, i + 5) * 0.25))));
      runs.push(Array.from({ length: count }, (_, q) => place(poly[(start + q) % n], L.k, L.r)));
      // sometimes a single thin corridor continues inward from the tip
      if (j < layers.length - 1 && rnd(i, j + 40) < 0.25) {
        const t = tipOf(poly);
        runs.push([place(t, L.k, L.r), place(t, layers[j + 1].k, layers[j + 1].r)]);
      }
    });
    // half an arc of the hub, on the outer and the inner echo only (drawn as short straight pieces so it can be checked too)
    if (j !== 1) {
      const R = 120 * s * L.k, a0 = rnd(j, 77) * Math.PI * 2, span = (0.6 + rnd(j, 78) * 0.5) * Math.PI;
      runs.push(Array.from({ length: 25 }, (_, q) => [cx + Math.cos(a0 + (span * q) / 24) * R, cy + Math.sin(a0 + (span * q) / 24) * R] as P));
    }
    const el = document.createElementNS(NS, 'path');
    el.setAttribute('d', pathOf(runs));
    el.setAttribute('pathLength', '1');
    el.style.setProperty('--k', String(j * 3));
    el.style.strokeOpacity = String(L.o);
    svg.appendChild(el);
  });
  return svg;
}
