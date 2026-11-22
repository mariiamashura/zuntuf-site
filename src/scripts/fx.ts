/**
 * Site-wide effects: water ripples under the pointer on every page, plus a short ripple burst
 * from the page's focal point when it opens (home does its own, bigger version in intro.ts).
 */
import { createRipples } from './ripples';

const canvas = document.querySelector<HTMLCanvasElement>('.ripples');
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && !calm) {
  const rip = createRipples(canvas);
  const focus = document.querySelector<HTMLElement>('[data-focus]');
  if (rip && focus && !document.documentElement.classList.contains('intro-run')) {
    const r = focus.getBoundingClientRect();
    const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
    for (let i = 0; i < 3; i++) rip.spawn(cx, cy, Math.max(innerWidth, innerHeight) * 0.35, 2.2, 1, 0.1 + i * 0.3);
  }
}
