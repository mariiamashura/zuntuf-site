// Generates public/favicon.svg from the face data. Run: node --experimental-strip-types scripts/make-favicon.ts
import { writeFileSync } from 'node:fs';
import { C, pieces, eyes, nose, waves, arcs, pts } from '../src/lib/face.ts';
const skip = new Set(['tick-l', 'tick-r', 'bar-chin']);
let g = '';
for (const p of pieces) if (!skip.has(p.id)) g += `<polygon points="${pts(p.pts)}" fill="${p.fill}"/>`;
for (const e of eyes) {
  g += `<polygon points="${pts(e.outer)}" fill="${C.brown}"/><polygon points="${pts(e.inner)}" fill="${C.cream}"/>`;
  g += `<clipPath id="${e.id}"><polygon points="${pts(e.inner)}"/></clipPath><g clip-path="url(#${e.id})">` +
    [46, 28].map((r) => `<circle cx="${e.sx}" cy="${e.sy}" r="${r}" fill="none" stroke="${C.coral}" stroke-width="12"/>`).join('') + '</g>';
}
g += `<polygon points="${pts(nose.outer)}" fill="${C.brown}"/><polygon points="${pts(nose.inner)}" fill="${C.ochre}"/>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="150 0 480 650"><rect x="150" y="0" width="480" height="650" fill="${C.cream}"/>${g}</svg>\n`;
writeFileSync(new URL('../public/favicon.svg', import.meta.url), svg);
console.log('favicon.svg', svg.length, 'bytes');
