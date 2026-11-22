/** Mobile menu sheet: open/close, Esc, scroll lock, focus handling. No dependencies. */
const btn = document.querySelector<HTMLButtonElement>('.menubtn');
const sheet = document.getElementById('menu');
const close = sheet?.querySelector<HTMLButtonElement>('.sheet__close');

if (btn && sheet) {
  const root = document.documentElement;
  const set = (open: boolean) => {
    sheet.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    root.classList.toggle('menu-open', open);
    if (open) sheet.querySelector<HTMLElement>('.stile')?.focus();
    else btn.focus();
  };
  btn.addEventListener('click', () => set(true));
  close?.addEventListener('click', () => set(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) set(false); });
  // leaving the phone layout (rotation, resize) closes the sheet
  matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)').addEventListener('change', (m) => { if (m.matches && !sheet.hidden) set(false); });
}
