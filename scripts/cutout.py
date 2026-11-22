"""Turns an illustration on a plain light background into a transparent WebP for the tool pages.
Usage:  python scripts/cutout.py refs/stockuploader.jpg public/tools/stockuploader/art.webp
Needs Pillow and numpy. The background is found from the four corners and removed only where it touches the border,
so light details inside the picture stay."""
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
if im.size != (1024, 1024):
    im = im.resize((1024, 1024), Image.LANCZOS)  # the interaction maps in src/lib/art.ts use a 1024 square
a = np.asarray(im).astype(np.int32)
h, w, _ = a.shape
corners = np.concatenate([a[:6, :6].reshape(-1, 3), a[:6, -6:].reshape(-1, 3), a[-6:, :6].reshape(-1, 3), a[-6:, -6:].reshape(-1, 3)])
bg = np.median(corners, axis=0)
d = np.sqrt(((a - bg) ** 2).sum(axis=2))
near = d < 38
seen = np.zeros((h, w), bool)
q = deque()
for x in range(w):
    for y in (0, h - 1):
        if near[y, x] and not seen[y, x]:
            seen[y, x] = True; q.append((y, x))
for y in range(h):
    for x in (0, w - 1):
        if near[y, x] and not seen[y, x]:
            seen[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w and near[ny, nx] and not seen[ny, nx]:
            seen[ny, nx] = True; q.append((ny, nx))
alpha = np.full((h, w), 255, np.uint8)
alpha[seen] = 0
grow = np.asarray(Image.fromarray((seen * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
ring = grow & ~seen
alpha[ring] = (np.clip((d - 30) / 65, 0, 1) * 255).astype(np.uint8)[ring]
Image.fromarray(np.dstack([a.astype(np.uint8), alpha]), 'RGBA').save(dst, quality=90, method=6)
print('saved', dst)
