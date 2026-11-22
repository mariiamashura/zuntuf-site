/**
 * Curved entrance paths for the upper menu and the footer tiles.
 * Each piece follows a cubic Bezier with a damped sideways wobble (menu: lifted like a paper butterfly),
 * or a gravity fall with decaying bounces and a drifting S-curve (footer). Sampled densely into
 * Web Animations keyframes, so the motion is smooth and runs on the compositor.
 */
const N = 64;
const smooth = (t: number) => t * t * (3 - 2 * t);
const bez = (p0: number, p1: number, p2: number, p3: number, u: number) => {
  const v = 1 - u;
  return v * v * v * p0 + 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u * p3;
};

/** menu item: from a point in a lower corner, up along an S-curve, settling softly */
export function flyIn(el: HTMLElement, fromX: number, fromY: number, dir: 1 | -1, delay: number, duration: number, k: number): Animation {
  const r = el.getBoundingClientRect();
  const sx = fromX - (r.x + r.width / 2), sy = fromY - (r.y + r.height / 2);
  const reach = Math.abs(sx) * 0.5 + 120;
  // control points: out and up, over the top, then in
  const c1x = sx + dir * reach * 0.4, c1y = sy * 0.45;
  const c2x = -dir * reach * 0.35, c2y = sy * 0.04 - 70;
  const phase = k * 0.9;
  const kf: Keyframe[] = [];
  let px = sx, py = sy;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const u = 1 - Math.pow(1 - smooth(t), 2.1); // soft start, long soft landing
    const x = bez(sx, c1x, c2x, 0, u), y = bez(sy, c1y, c2y, 0, u);
    const damp = Math.pow(1 - u, 1.35);
    const wob = Math.sin(u * Math.PI * 5.2 + phase) * 46 * damp; // gentle oscillation, dying out
    const tx = x + wob * 0.6, ty = y + Math.cos(u * Math.PI * 4.1 + phase) * 16 * damp;
    const tilt = Math.atan2(ty - py, tx - px) * (180 / Math.PI);
    const rot = dir * Math.sin(u * Math.PI * 3.4 + phase) * 26 * damp + (i ? Math.max(-14, Math.min(14, (tilt - (dir > 0 ? -90 : -90)) * 0.05)) * damp : 0);
    const sc = 0.55 + 0.45 * smooth(Math.min(1, u * 1.15));
    kf.push({ offset: t, opacity: Math.min(1, t * 6), transform: `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})` });
    px = tx; py = ty;
  }
  kf[N - 1].transform = 'none';
  kf[N - 1].opacity = 1;
  return el.animate(kf, { duration: duration * 1000, delay: delay * 1000, easing: 'linear', fill: 'both' });
}

/** footer tile: falls from above on a drifting curve, lands, bounces a few times, wobbles to rest */
export function dropIn(el: HTMLElement, driftX: number, rot0: number, delay: number, duration: number, k: number): Animation {
  const r = el.getBoundingClientRect();
  const fall = r.y + r.height + 140; // start above the top of the window
  const phase = k * 1.3;
  const kf: Keyframe[] = [];
  const bounces = [{ a: 0.58, b: 0.78, h: 34 }, { a: 0.78, b: 0.9, h: 13 }, { a: 0.9, b: 1, h: 4 }];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    let y: number, rot: number;
    if (t < 0.58) { const s = t / 0.58; y = -fall * (1 - s * s); rot = rot0 * (1 - smooth(s)); }
    else {
      const b = bounces.find((q) => t >= q.a && t <= q.b)!;
      const s = (t - b.a) / (b.b - b.a);
      y = -b.h * 4 * s * (1 - s);
      rot = Math.sin(s * Math.PI * 2 + phase) * (b.h / 34) * 3.2 * (rot0 > 0 ? 1 : -1);
    }
    const u = smooth(Math.min(1, t / 0.58));
    const x = driftX * (1 - u) + Math.sin(t * Math.PI * 3 + phase) * 28 * Math.pow(1 - Math.min(1, t / 0.6), 1.5); // an S-shaped drift
    kf.push({ offset: t, opacity: t > 0.01 ? 1 : 0, transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)` });
  }
  kf[N - 1].transform = 'none';
  return el.animate(kf, { duration: duration * 1000, delay: delay * 1000, easing: 'linear', fill: 'both' });
}
