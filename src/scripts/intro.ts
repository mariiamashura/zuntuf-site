/**
 * Entrance orchestrator. The visual work is CSS (html.intro-run); this file starts the ripples,
 * switches them from dark to paper mode, opens interaction at `live`, and ends/skips the intro.
 * Ending = removing the class, because the plain page is already the final state.
 */
import { motion as m } from '../config/motion';
import { createRipples } from './ripples';
import { buildWeb } from './web';
import { flyIn, dropIn } from './curves';

const canvas = document.querySelector<HTMLCanvasElement>('.ripples');
const fine = matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)').matches;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && fine && !calm) {
  const root = document.documentElement;
  const rip = createRipples(canvas);
  if (rip) {
    if (!root.classList.contains('intro-run')) {
      rip.setMode('paper');
    } else {
      rip.setMode('dark');
      const wheel = document.querySelector('.wheel')?.getBoundingClientRect();
      const cx = wheel ? wheel.x + wheel.width / 2 : innerWidth / 2;
      const cy = wheel ? wheel.y + wheel.height / 2 : innerHeight * 0.46;
      const reach = Math.max(innerWidth, innerHeight) * 0.6;
      for (let i = 0; i < m.ripple.count; i++) rip.spawn(cx, cy, reach, m.ripple.dur, 1, m.ripple.at + i * m.ripple.gap);
      const wheelSvg = document.querySelector<SVGSVGElement>('svg.wheel')!;
      const web = buildWeb(cx, cy, wheelSvg);
      document.body.appendChild(web);

      const anims: Animation[] = [];
      // upper menu: from the lower corners along curves; footer tiles: falling on curves with bounces
      document.querySelectorAll<HTMLElement>('.topnav > *').forEach((el, k) => {
        const dir = k % 2 ? -1 : 1; // alternate corners
        anims.push(flyIn(el, dir > 0 ? -40 : innerWidth + 40, innerHeight + 60, dir as 1 | -1, m.nav.at + k * m.nav.stagger, m.nav.dur, k));
      });
      document.querySelectorAll<HTMLElement>('.foot__tile').forEach((el, k) => {
        const drift = (k % 2 ? 1 : -1) * (90 + k * 28);
        anims.push(dropIn(el, drift, (k % 2 ? 1 : -1) * (14 + k * 4), m.foot.at + k * m.foot.stagger, m.foot.dur, k));
      });
      const timers: number[] = [];
      let over = false;
      const finish = () => {
        if (over) return;
        over = true;
        timers.forEach(clearTimeout);
        removeEventListener('pointerdown', finish);
        removeEventListener('keydown', finish);
        rip.setMode('paper');
        web.remove();
        anims.forEach((a) => a.cancel());
        root.classList.add('intro-live');
        root.classList.remove('intro-run');
      };
      timers.push(window.setTimeout(() => rip.setMode('paper'), (m.flood.at + m.flood.dur * 0.55) * 1000));
      timers.push(window.setTimeout(() => root.classList.add('intro-live'), m.live * 1000));
      // `?hold` (dev): keep the intro alive so frames can be inspected
      if (!/[?&]hold/.test(location.search)) timers.push(window.setTimeout(finish, m.total * 1000));
      addEventListener('pointerdown', finish);
      addEventListener('keydown', finish);
    }
  }
}
