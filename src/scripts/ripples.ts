/**
 * Water ripples on a single canvas. The loop runs only while ripples are alive,
 * so an idle page costs nothing. Dark mode (intro) uses light ochre rings,
 * paper mode uses faint brown rings.
 */
export type Mode = 'dark' | 'paper';

interface Ripple { x: number; y: number; t0: number; dur: number; max: number; k: number }

const MAX_LIVE = 12;

export function createRipples(canvas: HTMLCanvasElement) {
  const existing = (canvas as any).__rip;
  if (existing) return existing as ReturnType<typeof create>;
  const made = create(canvas);
  (canvas as any).__rip = made;
  return made;
}

function create(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const c = ctx;
  const live: Ripple[] = [];
  let mode: Mode = 'paper';
  let raf = 0;
  let dpr = 1;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  canvas.style.display = 'block';
  window.addEventListener('resize', resize);

  const frame = (now: number) => {
    raf = 0;
    c.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = live.length - 1; i >= 0; i--) {
      const r = live[i];
      const p = (now - r.t0) / (r.dur * 1000);
      if (p >= 1) { live.splice(i, 1); continue; }
      if (p < 0) continue; // scheduled for later
      const e = 1 - Math.pow(1 - p, 3);
      const a = Math.pow(1 - p, 1.7) * r.k * (mode === 'dark' ? 0.55 : 0.2);
      c.strokeStyle = mode === 'dark' ? `rgba(214,172,100,${a})` : `rgba(81,43,25,${a})`;
      c.lineWidth = mode === 'dark' ? 1.2 : 1.5;
      c.beginPath();
      c.arc(r.x, r.y, e * r.max, 0, Math.PI * 2);
      c.stroke();
    }
    if (live.length) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  function spawn(x: number, y: number, max = 190, dur = 2, k = 1, delay = 0) {
    if (live.length >= MAX_LIVE) live.shift();
    live.push({ x, y, t0: performance.now() + delay * 1000, dur, max, k });
    kick();
  }

  // pointer ripples: throttled, never one per event
  let lastT = 0, lastX = -999, lastY = -999;
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const now = performance.now();
    if (now - lastT < 120 || Math.hypot(e.clientX - lastX, e.clientY - lastY) < 40) return;
    lastT = now; lastX = e.clientX; lastY = e.clientY;
    spawn(e.clientX, e.clientY, 150 + Math.random() * 60, 1.9);
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  // touch: one small ripple per tap
  const onDown = (e: PointerEvent) => { if (e.pointerType === 'touch') spawn(e.clientX, e.clientY, 110, 1.3, 0.9); };
  window.addEventListener('pointerdown', onDown, { passive: true });

  return {
    spawn,
    setMode(m: Mode) { mode = m; },
    destroy() { window.removeEventListener('resize', resize); window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); live.length = 0; },
  };
}
