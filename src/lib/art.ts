/**
 * Interactive artwork for a tool page. The picture itself is a transparent WebP in /public/tools/<slug>/art.webp
 * (1024 x 1024) and is never cut up or moved; this file says what happens on top of it.
 * Coordinates are pixels of that 1024 square.
 *
 * `front`: the part of the picture that is in front of the sheets (the folder's front panel). It is drawn again,
 *   pixel for pixel, above the sheets, so they can slide out from behind it. The picture underneath stays whole.
 * `sheets`: square sheets that slide out of the opening one after another and drift away.
 * `eyes`: circles that keep turning slowly, like record labels.
 */
export type Pt = [number, number];
export interface Sheet { x: number; y: number; dx: number; dy: number; r: number; fill: 'mustard' | 'coral' | 'cream' | 'ochre'; lines?: number; icon?: 'sun' | 'star' | 'smile' }
/** A copy of part of the picture that drifts away (dx, dy in picture pixels) and fades, again and again. The original stays put. */
export interface Echo { poly: Pt[]; dx: number; dy: number; scale?: number; rot?: number; delay?: number; dur?: number }
export interface ToolArtConfig {
  alt: string;
  front?: Pt[];
  sheets?: Sheet[];
  echoes?: Echo[];
  alive?: boolean; // the whole picture slowly breathes and sways
  strain?: boolean; // the whole picture strains and trembles, as if trying to break free
  sheetsBehind?: boolean; // the sheets start behind the picture (and come out past its edges) instead of in front of it
  eyes?: { x: number; y: number; r: number; dur: number; reverse?: boolean }[];
}

export const ART: Record<string, ToolArtConfig> = {
  // The picture file is public/tools/stockuploader/art.webp (see scripts/cutout.py). Not shown until that file exists.
  stockuploader: {
    alt: '',
    strain: true,
    sheetsBehind: true,
    eyes: [{ x: 512, y: 505, r: 138, dur: 11 }], // the lens turns
    // small drawings on sheets that slip out from behind the picture, up and to the sides, one after another
    sheets: [
      { x: 512, y: 560, dx: 0.4, dy: -4.6, r: 9, fill: 'cream', icon: 'sun' },
      { x: 420, y: 540, dx: -2.4, dy: -3.6, r: -12, fill: 'mustard', icon: 'star' },
      { x: 600, y: 540, dx: 2.6, dy: -3.4, r: 13, fill: 'coral', icon: 'smile' },
      { x: 470, y: 520, dx: -3.4, dy: -1.2, r: -9, fill: 'cream', icon: 'smile' },
      { x: 560, y: 520, dx: 3.5, dy: -1.6, r: 10, fill: 'mustard', icon: 'sun' },
      { x: 512, y: 540, dx: 1.2, dy: -4.9, r: -7, fill: 'coral', icon: 'star' },
    ],
  },
  bowerfs: {
    alt: '',
    // everything below the folder's top edge
    front: [[70, 312], [112, 312], [400, 312], [470, 396], [520, 408], [556, 430], [960, 430], [960, 960], [70, 960]],
    // start hidden behind the front panel (y >= 440), then climb out. dx/dy are in sheet sizes, r in degrees.
    sheets: [
      { x: 520, y: 450, dx: 0.7, dy: -3.4, r: 8, fill: 'mustard', lines: 3 },
      { x: 330, y: 450, dx: -0.5, dy: -3.0, r: -10, fill: 'coral', lines: 2 },
      { x: 690, y: 450, dx: 1.0, dy: -2.8, r: 12, fill: 'cream', lines: 3 },
      { x: 430, y: 450, dx: 0.2, dy: -3.8, r: -5, fill: 'ochre', lines: 2 },
      { x: 600, y: 450, dx: -0.3, dy: -3.2, r: 6, fill: 'coral', lines: 3 },
    ],
    eyes: [
      { x: 352, y: 553, r: 70, dur: 26 },
      { x: 730, y: 556, r: 74, dur: 19, reverse: true },
    ],
  },
};

const pc = (n: number) => `${((n / 1024) * 100).toFixed(3)}%`;
export const polygon = (p: Pt[]) => `polygon(${p.map(([x, y]) => `${pc(x)} ${pc(y)}`).join(', ')})`;
export const circle = (x: number, y: number, r: number) => `circle(${pc(r)} at ${pc(x)} ${pc(y)})`;
