# Index Aset + Prompt (Gemini / GPT)

Semua yang di bawah ini sekarang masih tampil sebagai placeholder (kotak warna, ikon garis, atau lukisan
bawaan). Generate di Gemini, **simpan hasilnya ke folder `assets-src/`**, lalu bilang ke Claude
(contoh: "sudah, assets-src/outfits-sheet.png"). Claude yang memotong, membuang latar, mengubah ukuran,
dan memasangnya. Gambar yang ditempel di chat tidak bisa diambil, jadi harus disimpan ke folder.

**Tips Gemini**
- Pakai **sheet** (banyak gambar dalam satu file, grid rapi) supaya gayanya seragam.
- Latar **putih polos** saja; Gemini sering tidak bisa transparan, nanti Claude yang hapus.
- Minta **tanpa teks/label** di dalam gambar (kecuali logo), supaya mudah dipotong.
- Kalau hasil grid berantakan, generate ulang atau pecah jadi 2 sheet.

---

## Index

| # | Bagian di game | Sekarang | Jumlah | Simpan sebagai |
| --- | --- | --- | --- | --- |
| A | Baju di Lemari / Toko Ajis | kotak warna | 10 | `assets-src/outfits-sheet.png` |
| B | Barang Toko Ajis (lahan, upgrade, hewan, dekorasi) | ikon garis | 21 | `assets-src/shop-sheet-1.png`, `shop-sheet-2.png` |
| C | Ikon item (tas, dapur, etalase, resep) | ikon garis | 20 | `assets-src/items-sheet-1.png`, `items-sheet-2.png` |
| D | Wajah karakter 3D | lukisan bawaan | 4 | `assets-src/faces-sheet.png` (sudah Anda buat) |
| E | Potret dialog & tutorial | ikon | 13 | `assets-src/portraits-sheet-1.png`, `portraits-sheet-2.png` |
| F | Logo menu utama | logo teks | 1 | `assets-src/logo.png` |
| G | Latar menu utama (potret HP) | scene 3D | 1 | `assets-src/menu-bg.png` |
| H | UI: koin & ikon kecil | ikon garis | 1 sheet | `assets-src/ui-sheet.png` (sudah Anda buat) |
| I | Video intro | ilustrasi ikon | 4 | `public/video/intro-1.mp4` … `intro-4.mp4` |
| J | Tekstur (opsional) | warna polos | 5 | `assets-src/textures-sheet.png` |

---

## A. Baju (10) → `outfits-sheet.png`

Urutan grid (kiri→kanan, atas→bawah): 1 Seragam Toko · 2 Kasual Pink · 3 Hoodie Matcha · 4 Piyama Lemon ·
5 Overall Denim · 6 Dress Lavender · 7 Sweater & Beret · 8 Kencan Rose · 9 Sundress & Topi · 10 Gaun Pesta

```
Cute cozy anime dress-up game clothing icons, soft cel shading, thin dark-brown outlines, pastel palette, each outfit shown as clothes only (no person, no mannequin), front view, neatly laid out, evenly spaced in a 5 columns x 2 rows grid on a plain white background, no text, no labels, no borders. In order:
1) plum long-sleeve shirt with a long red bakery apron and a small black name tag,
2) pink t-shirt with blue jeans,
3) matcha green hoodie with dark grey pants,
4) lemon yellow pajamas with a small pink hair ribbon,
5) cream t-shirt with blue denim overalls and a yellow hair ribbon,
6) lavender dress with a purple hair ribbon,
7) caramel brown sweater, cream skirt and a red beret,
8) rose pink blouse, light pink skirt and a red hair ribbon,
9) yellow sundress with a straw sun hat,
10) sparkly light blue party gown with a white ribbon.
```

## B. Barang Toko Ajis (21) → 2 sheet

**Sheet 1 → `shop-sheet-1.png`** (lahan, bangunan, upgrade): 1 lahan kebun · 2 lahan peternakan ·
3 kandang ayam · 4 kandang sapi · 5 kulkas · 6 oven besar · 7 oven profesional · 8 etalase kecil ·
9 etalase mewah · 10 penyiram otomatis · 11 kasur empuk · 12 sepatu lari

```
Cute cozy anime farming game shop icons, soft cel shading, thin dark-brown outlines, pastel palette, slight 3/4 view, each object centered in its cell, evenly spaced in a 4 columns x 3 rows grid on a plain white background, no text, no labels, no borders. In order:
1) a small square plot of brown tilled farm soil with a tiny wooden fence,
2) a small fenced green meadow pasture,
3) a cute wooden chicken coop with a red roof,
4) a cute red barn,
5) a retro pastel mint refrigerator,
6) a big cozy brick bread oven with warm fire inside,
7) a professional stainless steel bakery oven with flames,
8) a small glass bakery display case with cakes,
9) a luxury glass bakery display case with gold trim and cakes,
10) an automatic garden sprinkler spraying water,
11) a soft fluffy pink bed with pillows,
12) a pair of pink running shoes.
```

**Sheet 2 → `shop-sheet-2.png`** (hewan & dekorasi): 1 ayam · 2 sapi · 3 kelinci · 4 kucing oren ·
5 anjing shiba · 6 pot bunga · 7 lampion · 8 karpet rajut · 9 papan menu

```
Cute cozy anime farming game shop icons, soft cel shading, thin dark-brown outlines, pastel palette, each subject centered in its cell, evenly spaced in a 3 columns x 3 rows grid on a plain white background, no text, no labels, no borders. In order:
1) a cute chubby white chicken,
2) a cute black and white spotted cow,
3) a fluffy white bunny,
4) a cute orange tabby cat,
5) a cute shiba inu dog,
6) a terracotta flower pot with pink and yellow flowers,
7) a glowing hanging paper lantern,
8) a round knitted cozy rug,
9) a standing chalkboard menu sign with a wooden frame (blank board, no writing).
```

## C. Ikon item (20) → 2 sheet

**Sheet 1 → `items-sheet-1.png`**: 1 benih gandum · 2 benih stroberi · 3 pakan ternak · 4 gandum ·
5 stroberi · 6 beri liar · 7 chamomile · 8 jamur · 9 telur · 10 susu

```
Cute cozy anime farming game item icons, soft cel shading, thin dark-brown outlines, pastel palette, slight top-down 3/4 view, soft shadow under each, each item centered in its cell, evenly spaced in a 5 columns x 2 rows grid on a plain white background, no text, no labels, no frames. In order:
1) a small paper seed packet with wheat seeds,
2) a small paper seed packet with strawberry seeds,
3) a small burlap sack of animal feed grain,
4) a bundle of golden wheat stalks,
5) two fresh red strawberries with leaves,
6) a handful of wild blue-purple berries,
7) a few white and yellow chamomile flowers,
8) two red-capped mushrooms with white spots,
9) three brown eggs,
10) a glass bottle of fresh milk.
```

**Sheet 2 → `items-sheet-2.png`**: 1 roti gandum · 2 teh chamomile · 3 tart beri liar · 4 pai jamur ·
5 kue stroberi · 6 Kue Spesial Windi · 7 pancake madu · 8 puding susu · 9 kue bolu · 10 cheesecake stroberi

```
Cute cozy anime bakery game food icons, soft cel shading, thin dark-brown outlines, warm pastel palette, slight top-down 3/4 view, soft shadow under each, each item centered in its cell, evenly spaced in a 5 columns x 2 rows grid on a plain white background, no text, no labels, no frames. In order:
1) a round golden loaf of wheat bread,
2) a cup of chamomile tea with steam,
3) a wild berry tart,
4) a golden mushroom pie,
5) a slice of strawberry cream cake,
6) a three-tier celebration cake in pink, cream and lavender with a strawberry on top,
7) a stack of pancakes with honey dripping,
8) a caramel milk pudding,
9) a fluffy yellow sponge cake,
10) a strawberry cheesecake slice.
```

## D. Wajah (4) → `faces-sheet.png`

Sudah Anda buat (Windi, Ajis, girl, boy). Cukup simpan gambarnya ke `assets-src/faces-sheet.png`.

## E. Potret karakter (13) → 2 sheet

Setengah badan, menghadap depan sedikit miring, senyum.

**Sheet 1 → `portraits-sheet-1.png`** (3×2): 1 Windi · 2 Ajis · 3 Bu Sari · 4 Pak Budi · 5 Dimas · 6 Rara

```
Cute cozy anime game character portraits, soft cel shading, thin dark-brown outlines, warm pastel palette, half-body bust portraits facing the viewer with a slight 3/4 turn and a warm smile, evenly spaced in a 3 columns x 2 rows grid on a plain white background, no text, no labels, no frames. In order:
1) Windi: young woman, long dark brown hair with bangs, pink flower hair clip, big brown eyes, small beauty mark near her mouth, plum long-sleeve shirt and red bakery apron with name tag,
2) Ajis: young man, short black hair, round thin glasses, navy shirt with a green shopkeeper apron, friendly calm smile,
3) Bu Sari: kind middle-aged woman wearing a cream hijab and green clothes, holding a shopping bag,
4) Pak Budi: gentle grandpa with grey hair and glasses, white shirt,
5) Dimas: cheerful little boy with black hair and a light blue t-shirt, big open smile,
6) Rara: cheerful little girl with long brown hair and a pink dress, big open smile.
```

**Sheet 2 → `portraits-sheet-2.png`** (4×2): 1 Mbak Lia · 2 Kak Nadia · 3 Mas Andi · 4 Mas Bayu ·
5 Rina · 6 Fajar · 7 Pak Pos

```
Cute cozy anime game character portraits, soft cel shading, thin dark-brown outlines, warm pastel palette, half-body bust portraits facing the viewer with a slight 3/4 turn and a warm smile, evenly spaced in a 4 columns x 2 rows grid on a plain white background (last cell empty), no text, no labels, no frames. In order:
1) Lia: sporty young woman in a black sport hijab and teal workout clothes,
2) Nadia: gentle young woman in a lavender hijab hugging a book,
3) Andi: friendly young florist in an orange t-shirt holding a flower bouquet,
4) Bayu: relaxed young musician in a black t-shirt holding an acoustic guitar,
5) Rina: sweet young woman in a pink hijab and rose blouse,
6) Fajar: friendly young man in a light blue shirt,
7) Pak Pos: cheerful middle-aged mailman in an orange uniform with a mail bag.
```

## F. Logo → `logo.png`

```
Game title logo that reads exactly "Windi's Sweet Bakery" on three lines: "Windi's" in chocolate brown, "Sweet" in strawberry pink with a thick white outline, "Bakery" in chocolate brown. Bubbly rounded cute letters on a cream cookie-shaped badge with a thick brown border, two small rolling pins on the sides, tiny hearts and sparkles. Cozy anime bakery game style, centered, plain white background.
```

## G. Latar menu utama → `menu-bg.png` (tegak 9:16)

```
Vertical 9:16 mobile game background, cozy anime illustration, Studio Ghibli inspired: a charming rustic bakery storefront in a small village street in warm morning light, wooden sign, bread displayed in the window, hanging flower baskets, a chalkboard menu stand, cobblestone path, trees with sunlight, soft golden glow. Leave the top third and bottom third calm and simple (space for a logo and buttons). No people, no text.
```

## H. UI kecil → `ui-sheet.png`

Sudah Anda buat. Yang akan dipakai: ikon koin, panah, centang, bintang, kilau, kotak dialog, tombol kayu.

## I. Video intro (4) → `public/video/intro-1.mp4` … `intro-4.mp4`

Pakai 4 prompt adegan yang sudah Anda tulis (toko, Windi memanggang, Ajis menyiram, penutup).
Rasio **9:16 tegak**, 4–6 detik per adegan. Tambahkan di setiap prompt: `vertical 9:16 framing`.

## J. Tekstur (opsional) → `textures-sheet.png`

```
Five seamless tileable game textures, top-down flat view, even lighting, no perspective, cozy pastel anime game style, arranged in a single row on a white background, no text. In order: 1) soft pastel park grass, 2) cream cobblestone path, 3) warm wooden floor planks, 4) cream wall with a subtle flower pattern, 5) strawberry red roof tiles.
```
