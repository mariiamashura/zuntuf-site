/**
 * The small glyphs around the star shy away from the pointer. When the cursor comes near one, it slides off along
 * the free space: away from the pointer, kept inside the window, clear of the header, the footer and the star.
 * When the cursor leaves, it floats back. Offsets go in --fx/--fy (see SoftwareCues.astro); the CSS transition does the gliding.
 */
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cues = Array.from(document.querySelectorAll<HTMLElement>('.cue'));

if (fine && !calm && cues.length) {
  const MARGIN = 14;
  let px = -9999, py = -9999, raf = 0;
  const off = new Map<HTMLElement, [number, number]>(cues.map((c) => [c, [0, 0]])); // where each one is heading
  // actual position and velocity: the glyph is steered toward its goal, never snapped, so it travels in slow wide curves
  const st = new Map<HTMLElement, { x: number; y: number; vx: number; vy: number }>(cues.map((c) => [c, { x: 0, y: 0, vx: 0, vy: 0 }]));
  let last = 0, run = 0;
  const SPEED = 175, STEER = 1.5; // px per second at most; how quickly the heading may turn (1/s)
  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    let moving = false;
    for (const c of cues) {
      const s = st.get(c)!, g = off.get(c)!;
      const dx = g[0] - s.x, dy = g[1] - s.y, d = Math.hypot(dx, dy);
      const sp = Math.min(SPEED, d * 0.5); // slows down on arrival
      const wx = d ? (dx / d) * sp : 0, wy = d ? (dy / d) * sp : 0;
      const k = 1 - Math.exp(-STEER * dt); // low steering = wide, gentle turns
      s.vx += (wx - s.vx) * k; s.vy += (wy - s.vy) * k;
      s.x += s.vx * dt; s.y += s.vy * dt;
      c.style.setProperty('--fx', `${s.x.toFixed(2)}px`); c.style.setProperty('--fy', `${s.y.toFixed(2)}px`);
      if (d > 0.4 || Math.hypot(s.vx, s.vy) > 0.4) moving = true;
    }
    run = moving ? requestAnimationFrame(tick) : 0;
  };
  const go = () => { if (!run) { last = performance.now(); run = requestAnimationFrame(tick); } };

  const frame = () => {
    raf = 0;
    if (document.documentElement.classList.contains('intro-run')) return;
    const wheel = document.querySelector('.wheel')?.getBoundingClientRect();
    const wc = wheel ? { x: wheel.x + wheel.width / 2, y: wheel.y + wheel.height / 2, r: wheel.width * 0.46 } : null;
    const head = (document.querySelector('header')?.getBoundingClientRect().bottom ?? 0) + 6;
    const foot = document.querySelector('footer')?.getBoundingClientRect().top ?? innerHeight;
    const boxes = cues.filter((c) => getComputedStyle(c).display !== 'none').map((c) => ({ c, r: c.getBoundingClientRect(), o: off.get(c)! }));

    for (const { c, r, o } of boxes) {
      const w = r.width, h = r.height;
      const cur = st.get(c)!;
      const hx = r.x + w / 2 - cur.x, hy = r.y + h / 2 - cur.y; // where it lives when undisturbed
      const dist = Math.hypot(px - (r.x + w / 2), py - (r.y + h / 2));
      const reach = Math.max(w, h) * 0.5 + 90; // starts to run when the pointer is this close
      if (dist > reach * 1.7) { if (o[0] || o[1]) { o[0] = 0; o[1] = 0; apply(c, 0, 0); } continue; }
      if (dist > reach) continue; // in between: stay where it is
      // pick the free direction, preferring straight away from the pointer
      const away = Math.atan2(r.y + h / 2 - py, r.x + w / 2 - px);
      const step = reach + 50;
      let best: [number, number] | null = null, bestScore = -Infinity;
      for (const da of [0, 0.5, -0.5, 1, -1, 1.6, -1.6, 2.4, -2.4, Math.PI]) {
        const a = away + da;
        let x = hx + cur.x + Math.cos(a) * step, y = hy + cur.y + Math.sin(a) * step;
        // stay inside the window, below the header and above the footer
        x = Math.min(Math.max(x, MARGIN + w / 2), innerWidth - MARGIN - w / 2);
        y = Math.min(Math.max(y, head + h / 2), Math.max(head + h / 2, foot - h / 2 - 6));
        // keep out of the star
        if (wc) {
          const d = Math.hypot(x - wc.x, y - wc.y), min = wc.r + Math.max(w, h) * 0.5;
          if (d < min) { x = wc.x + ((x - wc.x) / (d || 1)) * min; y = wc.y + ((y - wc.y) / (d || 1)) * min; }
        }
        // keep clear of the other glyphs
        const clash = boxes.some((b) => b.c !== c && Math.hypot(x - (b.r.x + b.r.width / 2), y - (b.r.y + b.r.height / 2)) < (w + b.r.width) * 0.5);
        const score = Math.hypot(x - px, y - py) - (clash ? 400 : 0) - Math.abs(da) * 12;
        if (score > bestScore) { bestScore = score; best = [x, y]; }
      }
      if (best) { o[0] = best[0] - hx; o[1] = best[1] - hy; apply(c, o[0], o[1]); }
    }
  };
  const apply = (_c: HTMLElement, _x: number, _y: number) => go(); // the goal is already in `off`; the steering loop does the moving

  addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
  document.addEventListener('pointerleave', () => { px = py = -9999; if (!raf) raf = requestAnimationFrame(frame); });
}
