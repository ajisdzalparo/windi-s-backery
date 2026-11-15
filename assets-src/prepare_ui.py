"""Menyiapkan logo, latar menu, dan tekstur dari sheet di assets-src.

Pemakaian: python assets-src/prepare_ui.py   (dari folder proyek)
"""

from pathlib import Path

from PIL import Image

from slice import PUB, SRC, grid_boxes, remove_bg

# Logo: latar putih dihapus, dipangkas, lebar maks 900 px.
logo = remove_bg(Image.open(SRC / "logo.webp").convert("RGB"))
logo = logo.crop(logo.getbbox())
logo.thumbnail((600, 600), Image.LANCZOS)
(PUB / "ui").mkdir(parents=True, exist_ok=True)
logo.save(PUB / "ui" / "logo.webp", quality=88, method=6)
print("ui/logo.webp", logo.size)

# Latar menu: buang bagian atas di atas sambungan (baris 284) supaya tidak terlihat patah.
bg = Image.open(SRC / "menu-bg.webp").convert("RGB")
bg = bg.crop((0, 286, bg.width, bg.height))
bg.save(PUB / "ui" / "menu-bg.jpg", quality=88, optimize=True)
print("ui/menu-bg.jpg", bg.size)

# Tekstur: 5 panel berjajar; ambil kotak persegi di tengah tiap panel lalu 512x512.
sheet = Image.open(SRC / "textures-sheet.png").convert("RGB")
boxes = grid_boxes(sheet, min_gap=4, min_len=60)
names = ["grass", "path", "wood_floor", "wall", "roof"]
print("tekstur ditemukan:", len(boxes))
(PUB / "textures").mkdir(parents=True, exist_ok=True)
for (x0, y0, x1, y1), name in zip(boxes, names):
    inset = 6
    x0, y0, x1, y1 = x0 + inset, y0 + inset, x1 - inset, y1 - inset
    side = min(x1 - x0, y1 - y0)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    tile = sheet.crop((cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2)).resize((512, 512), Image.LANCZOS)
    tile.save(PUB / "textures" / f"{name}.jpg", quality=88)
    print(f"textures/{name}.jpg")
