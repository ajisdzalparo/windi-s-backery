"""Memotong sheet aset (latar putih) menjadi file PNG transparan per item.

Cara kerja:
1. Cari baris & kolom kosong (putih) untuk memisahkan item di grid.
2. Hapus latar putih yang tersambung ke tepi potongan (putih di dalam item, mis. telur/susu, tetap).
3. Pangkas ke isi, lalu taruh di tengah kanvas persegi transparan.

Pemakaian: python -I assets-src/slice.py   (dijalankan dari folder proyek)
"""

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src"
PUB = ROOT / "public"

WHITE = 236  # piksel dengan semua kanal >= ini dianggap latar putih


def is_white(rgb: np.ndarray) -> np.ndarray:
    return rgb.min(axis=2) >= WHITE


def runs(profile: np.ndarray, min_gap: int, min_len: int) -> list[tuple[int, int]]:
    """Rentang berisi (True) yang dipisahkan celah kosong minimal min_gap piksel."""
    out: list[tuple[int, int]] = []
    start = None
    gap = 0
    for i, v in enumerate(profile):
        if v:
            if start is None:
                start = i
            gap = 0
            end = i
        elif start is not None:
            gap += 1
            if gap >= min_gap:
                if end - start + 1 >= min_len:
                    out.append((start, end + 1))
                start = None
    if start is not None and end - start + 1 >= min_len:
        out.append((start, end + 1))
    return out


def grid_boxes(img: Image.Image, min_gap=10, min_len=40) -> list[tuple[int, int, int, int]]:
    rgb = np.asarray(img.convert("RGB")).astype(np.int16)
    content = ~is_white(rgb)
    boxes = []
    for y0, y1 in runs(content.sum(axis=1) > 2, min_gap, min_len):
        band = content[y0:y1]
        for x0, x1 in runs(band.sum(axis=0) > 1, min_gap, min_len):
            sub = content[y0:y1, x0:x1]
            ys = np.where(sub.sum(axis=1) > 0)[0]
            boxes.append((x0, y0 + ys[0], x1, y0 + ys[-1] + 1))
    return boxes


def remove_bg(img: Image.Image) -> Image.Image:
    """Latar putih yang tersambung ke tepi → transparan, dengan tepi halus."""
    rgba = img.convert("RGBA")
    a = np.asarray(rgba).copy()
    white = a[:, :, :3].min(axis=2) >= WHITE
    h, w = white.shape
    bg = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if white[y, x] and not bg[y, x]:
                bg[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if white[y, x] and not bg[y, x]:
                bg[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and white[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True
                q.append((ny, nx))
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    # Haluskan tepi: piksel isi yang menempel latar dan sangat terang dibuat semi-transparan.
    edge = np.zeros_like(bg)
    edge[1:, :] |= bg[:-1, :]
    edge[:-1, :] |= bg[1:, :]
    edge[:, 1:] |= bg[:, :-1]
    edge[:, :-1] |= bg[:, 1:]
    edge &= ~bg
    light = a[:, :, :3].min(axis=2)
    soft = np.clip((255 - light.astype(int)) * 4, 60, 255).astype(np.uint8)
    alpha = np.where(edge, np.minimum(alpha, soft), alpha)
    a[:, :, 3] = alpha
    return Image.fromarray(a, "RGBA")


def fit_square(img: Image.Image, size: int, pad: float = 0.06) -> Image.Image:
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    inner = int(size * (1 - 2 * pad))
    img.thumbnail((inner, inner), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(img, ((size - img.width) // 2, (size - img.height) // 2), img)
    return canvas


def slice_sheet(name: str, names: list[str | None], out_dir: str, size=256, pad=0.06, margin=6, **kw):
    img = Image.open(SRC / name).convert("RGB")
    boxes = grid_boxes(img, **kw)
    print(f"{name}: {len(boxes)} potongan ditemukan, {sum(1 for n in names if n)} dipakai")
    dest = PUB / out_dir
    dest.mkdir(parents=True, exist_ok=True)
    for (x0, y0, x1, y1), item in zip(boxes, names):
        if not item:
            continue
        crop = img.crop((max(0, x0 - margin), max(0, y0 - margin), min(img.width, x1 + margin), min(img.height, y1 + margin)))
        # WebP kecil (dengan transparansi) supaya ringan dimuat di HP.
        fit_square(remove_bg(crop), size * 2, pad).resize((size, size), Image.LANCZOS).save(dest / f"{item}.webp", quality=86, method=6)
    if len(boxes) < len([n for n in names if n]):
        print(f"  PERINGATAN: potongan kurang dari jumlah nama di {name}")


if __name__ == "__main__":
    slice_sheet(
        "outfits-sheet.png",
        ["apron_06", "casual_01", "hoodie_02", "pajama_04", "overall_07", "dress_03", "beret_08", "date_05", "sundress_09", "gown_10"],
        "outfits",
    )
    slice_sheet(
        "shop-sheet-1.webp",
        ["land_farm2", "land_ranch", "coop", "barn", "fridge", "oven2", "oven3", "big_case", "case_lux", "sprinkler", "bed", "shoes"],
        "shop",
    )
    slice_sheet("shop-sheet-2.webp", ["chicken", "cow", "bunny", "cat", "dog", "flowers", "lanterns", "rug", "menu_board"], "shop")
    slice_sheet(
        "items-sheet-1.png",
        ["seed_wheat", "seed_strawberry", "feed", "wheat", "strawberry", "wild_berry", "chamomile", "mushroom", "egg", "milk"]
        + [None] * 5,  # baris ketiga di sheet ini ekstra, tidak dipakai
        "icons",
    )
    slice_sheet(
        "items-sheet-2.png",
        ["bread", "chamomile_tea", "berry_tart", "mushroom_pie", "strawberry_cake", "windi_special", "pancake", "milk_pudding", "sponge_cake", "cheesecake"],
        "icons",
    )
    slice_sheet("portraits-sheet-1.png", ["windi", "ajis", "sari", "budi", "dimas", "rara"], "portraits", size=384, pad=0.02)
    slice_sheet("portraits-sheet-2.png", ["lia", "nadia", "andi", "bayu", "rina", "fajar", "pos"], "portraits", size=384, pad=0.02)
