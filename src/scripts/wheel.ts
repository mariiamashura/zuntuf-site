/** Star-wheel behaviour: hover/focus highlight, caption, keyboard, rotate-then-open. No dependencies. */

import { createRipples } from './ripples';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initWheel(stage: HTMLElement): void {
  const svg = stage.querySelector<SVGSVGElement>('svg.wheel');
  const spin = svg?.querySelector<SVGGElement>('.spin');
  const leader = svg?.querySelector<SVGPolylineElement>('.leader');
  const cap = stage.querySelector<HTMLElement>('.cap');
  if (!svg || !spin || !leader || !cap) return;
  const nameEl = cap.querySelector<HTMLElement>('.cap__name')!;
  const descEl = cap.querySelector<HTMLElement>('.cap__desc')!;
  const links = Array.from(svg.querySelectorAll<SVGAElement>('a.ray--item'));
  let active: SVGAElement | null = null;

  // Decorative glyphs near the opened ray or its caption drift away toward the page edges, then come back.
  const cues = Array.from(document.querySelectorAll<HTMLElement>('.cue'));
  const avoid = (a: SVGAElement | null) => {
    if (!cues.length) return;
    const setVars = (c: HTMLElement, ax: number, ay: number) => {
      c.style.setProperty('--ax', `${ax}px`); c.style.setProperty('--ay', `${ay}px`);
      c.dataset.ax = String(ax); c.dataset.ay = String(ay);
    };
    if (!a) { cues.forEach((c) => setVars(c, 0, 0)); return; }
    const obstacles = [
      { r: cap.getBoundingClientRect(), pad: 34 },
      { r: a.querySelector('.vis')!.getBoundingClientRect(), pad: 46 },
    ];
    for (const c of cues) {
      const r = c.getBoundingClientRect();
      const bx = Number(c.dataset.ax || 0), by = Number(c.dataset.ay || 0);
      const base = { l: r.left - bx, r: r.right - bx, t: r.top - by, b: r.bottom - by };
      let ax = 0, ay = 0;
      for (const { r: o, pad } of obstacles) {
        if (base.r > o.left - pad && base.l < o.right + pad && base.b > o.top - pad && base.t < o.bottom + pad) {
          const dir = (base.l + base.r) / 2 < innerWidth / 2 ? -1 : 1;
          const room = dir < 0 ? base.l - 10 : innerWidth - base.r - 10;
          ax = dir * Math.min(Math.max(room, 0), 170);
          ay = ((base.t + base.b) / 2 < (o.top + o.bottom) / 2 ? -1 : 1) * 80;
        }
      }
      setVars(c, Math.round(ax), Math.round(ay));
    }
  };

  // hover on the centre of the star: a ripple leaves the hub
  const hubHit = svg.querySelector<SVGCircleElement>('.hub-hit');
  let lastRipple = 0;
  hubHit?.addEventListener('pointerenter', () => {
    const canvas = document.querySelector<HTMLCanvasElement>('.ripples');
    const now = performance.now();
    if (!canvas || reduceMotion() || now - lastRipple < 700) return;
    lastRipple = now;
    const r = hubHit.getBoundingClientRect();
    const rip = createRipples(canvas);
    rip?.spawn(r.x + r.width / 2, r.y + r.height / 2, Math.min(innerWidth, innerHeight) * 0.42, 1.8, 1.4);
  });

  const show = (a: SVGAElement) => {
    if (active && active !== a) active.classList.remove('is-active');
    active = a;
    a.classList.add('is-active');
    svg.dataset.active = '1';
    const d = a.dataset;
    const side = d.side === 'l' ? 'l' : 'r';
    const edge = side === 'l' ? -30 : 1030;
    leader.setAttribute('points', `${d.tx},${d.ty} ${d.ex},${d.ey} ${edge},${d.ey}`);
    nameEl.textContent = d.label ?? '';
    descEl.textContent = d.desc ?? '';
    cap.dataset.side = side;
    cap.style.top = `${Number(d.ey) / 10}%`;
    cap.hidden = false;
    avoid(a);
  };

  const hide = (a: SVGAElement) => {
    if (active !== a || svg.classList.contains('is-busy')) return;
    a.classList.remove('is-active');
    active = null;
    delete svg.dataset.active;
    cap.hidden = true;
    avoid(null);
  };

  const move = (from: SVGAElement, step: number) => {
    const i = links.indexOf(from);
    links[(i + step + links.length) % links.length].focus();
  };

  links.forEach((a) => {
    a.addEventListener('pointerenter', () => show(a));
    a.addEventListener('pointerleave', () => { hide(a); });
    a.addEventListener('focus', () => show(a));
    a.addEventListener('blur', () => hide(a));

    a.addEventListener('keydown', (e) => {
      const k = (e as KeyboardEvent).key;
      if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); move(a, 1); }
      else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); move(a, -1); }
      else if (k === 'Escape') { a.blur(); }
    });

    // Rotate the selected ray toward the right (where page content will appear), then navigate.
    // Clicking empty background, or pressing Esc, before the page opens puts everything back.
    a.addEventListener('click', (e) => {
      const m = e as MouseEvent;
      if (m.button !== 0 || m.ctrlKey || m.metaKey || m.shiftKey || m.altKey || reduceMotion()) return;
      e.preventDefault();
      const angle = Number(a.dataset.angle);
      const delta = ((90 - angle + 540) % 360) - 180; // shortest arc to 3 o'clock
      svg.classList.add('is-busy');
      spin.classList.add('is-turning');
      spin.style.transform = `rotate(${delta}deg)`;

      let cancelled = false;
      let left = false;
      const timers: number[] = [];
      const go = () => { if (!cancelled) location.href = a.getAttribute('href')!; };
      const leave = () => {
        if (left || cancelled) return;
        left = true;
        // Others retract into the hub; remember where the ray and hub are for the next page.
        svg.classList.add('is-leaving');
        a.classList.add('is-active');
        try {
          const r = a.querySelector('.vis')!.getBoundingClientRect();
          const hb = svg.querySelector('.hub')!.getBoundingClientRect();
          const box = (q: DOMRect) => ({ x: q.x, y: q.y, w: q.width, h: q.height });
          sessionStorage.setItem('zuntuf-handoff', JSON.stringify({
            t: Date.now(), slug: (a.getAttribute('href') || '').split('/').filter(Boolean).pop(),
            fill: getComputedStyle(a.querySelector('.vis')!).fill, ray: box(r), hub: box(hb),
          }));
        } catch {}
        timers.push(window.setTimeout(go, 340));
      };

      const cancel = () => {
        if (cancelled) return;
        cancelled = true;
        timers.forEach(clearTimeout);
        document.removeEventListener('click', onAway, true);
        document.removeEventListener('keydown', onKey, true);
        try { sessionStorage.removeItem('zuntuf-handoff'); } catch {}
        svg.classList.remove('is-leaving');
        spin.style.transform = 'rotate(0deg)'; // turns back to the starting position
        hide(a);
        timers.push(window.setTimeout(() => {
          svg.classList.remove('is-busy');
          spin.classList.remove('is-turning');
          spin.style.transform = '';
        }, 780));
      };
      const onAway = () => cancel(); // the wheel ignores pointers while busy, so any click is "elsewhere"
      const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape') cancel(); };
      timers.push(window.setTimeout(() => {
        document.addEventListener('click', onAway, true);
        document.addEventListener('keydown', onKey, true);
      }, 0));

      spin.addEventListener('transitionend', leave, { once: true });
      timers.push(window.setTimeout(leave, Math.abs(delta) < 0.5 ? 60 : 800)); // fallback when no transition runs
    });
  });

  try { sessionStorage.removeItem('zuntuf-rebuild'); } catch {}
  setTimeout(() => document.documentElement.classList.remove('rebuild'), 1200);

  // A quiet hint that the rays can be pressed: the clickable ones take turns giving a little twitch outward.
  // Paused during the intro, while a ray is open, while turning, when the tab is hidden or motion is reduced.
  if (links.length && !reduceMotion()) {
    let next = 0;
    const idle = () =>
      !document.hidden && !document.documentElement.classList.contains('intro-run') && !svg.dataset.active &&
      !svg.classList.contains('is-busy') && !svg.matches('.is-leaving');
    window.setInterval(() => {
      if (!idle()) return;
      const a = links[next++ % links.length];
      a.classList.remove('nudge');
      void a.getBoundingClientRect(); // restart the animation
      a.classList.add('nudge');
      a.addEventListener('animationend', () => a.classList.remove('nudge'), { once: true });
    }, 2300);
  }

  // Restore state when returning via the back button (bfcache).
  window.addEventListener('pageshow', (e) => {
    if ((e as PageTransitionEvent).persisted) {
      svg.classList.remove('is-busy', 'is-leaving');
      spin.classList.remove('is-turning');
      spin.style.transform = '';
    }
  });
}
