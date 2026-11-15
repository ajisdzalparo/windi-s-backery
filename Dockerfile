# Image produksi Windi's Sweet Bakery (multi-stage supaya kecil & ringan di VPS).

# ---------- 1) Build ----------
FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npm run build

# ---------- 2) Prisma CLI (untuk menyinkronkan skema database saat container start) ----------
FROM node:22-alpine AS prisma-cli
WORKDIR /prisma-cli
RUN apk add --no-cache openssl \
  && npm init -y >/dev/null \
  && npm install --omit=dev --no-audit --no-fund prisma@6.19.3

# ---------- 3) Runtime ----------
FROM node:22-alpine AS run
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

# Server Next.js mandiri + file statis + aset game
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# Prisma client (dengan engine Linux) + skema + data surat untuk seed
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=build /app/prisma ./prisma
COPY --from=prisma-cli /prisma-cli/node_modules /prisma-cli/node_modules

EXPOSE 3000
# Sinkronkan skema, masukkan surat dari prisma/letters.json, lalu jalankan server.
CMD ["sh", "-c", "/prisma-cli/node_modules/.bin/prisma db push --skip-generate --schema prisma/schema.prisma && node prisma/seed.mjs && node server.js"]
