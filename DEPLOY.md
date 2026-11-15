# Deploy ke VPS (Docker + Caddy)

Alurnya: **push ke GitHub → GitHub Actions membuat image Docker → VPS menarik image itu.**
VPS tidak perlu build apa pun, jadi ringan.

Perkiraan beban di VPS (diukur): game ±55 MB RAM, Postgres ±40–80 MB, Caddy ±20 MB.
VPS 1 vCPU / 1 GB RAM sudah lebih dari cukup. Grafik 3D dihitung di HP Windi, bukan di server.

## 1. Push ke GitHub

Repo: `https://github.com/ajisdzalparo/windi-s-backery` (branch `master`).

```bash
git push origin master
```

Setelah push, buka tab **Actions** di GitHub dan tunggu "Build & push Docker image" selesai (±3–5 menit).
Image-nya: `ghcr.io/ajisdzalparo/windi-s-backery:latest`.

Kalau repo **private**, package GHCR juga private. Di VPS perlu login sekali (pakai Personal Access Token
dengan izin `read:packages`):

```bash
echo TOKEN_KAMU | docker login ghcr.io -u ajisdzalparo --password-stdin
```

## 2. Sekali saja: siapkan VPS

1. Arahkan domain (record **A**) ke IP VPS. Kalau pakai Cloudflare, set **DNS only** (awan abu-abu)
   dulu supaya Caddy bisa membuat sertifikat HTTPS.
2. Pasang Docker:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
3. Buat folder dan salin 3 file dari repo ini ke VPS: `docker-compose.yml`, `Caddyfile`, `.env.production.example`.
   ```bash
   mkdir -p ~/windi && cd ~/windi
   cp .env.production.example .env
   nano .env   # isi APP_IMAGE, POSTGRES_PASSWORD, DOMAIN
   ```
4. Jalankan:
   ```bash
   docker compose pull
   docker compose up -d
   ```
   Buka `https://domainkamu`. Saat pertama jalan, game otomatis membuat tabel database dan memasukkan surat
   dari `prisma/letters.json`.

## 3. Update game (setiap kali ada perubahan)

Di laptop: commit & push ke `main`. Tunggu Actions selesai, lalu di VPS:

```bash
cd ~/windi
docker compose pull app
docker compose up -d app
```

Progres Windi aman: data ada di volume database `windi_db`, tidak hilang saat update.

## Perintah berguna di VPS

```bash
docker compose logs -f app        # lihat log game
docker compose ps                 # status semua layanan
docker stats --no-stream          # pemakaian RAM/CPU
docker compose exec db pg_dump -U windi windi > backup-$(date +%F).sql   # backup database
```
