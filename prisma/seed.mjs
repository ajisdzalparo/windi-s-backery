// Memasukkan surat dari prisma/letters.json ke database.
// Aman dijalankan berulang: status "sudah dibaca" dan posisi surat tidak ditimpa.
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const letters = JSON.parse(readFileSync(new URL("./letters.json", import.meta.url), "utf8"));

for (const l of letters) {
  const data = {
    title: l.title,
    body: l.body,
    photoUrl: l.photoUrl ?? null,
    availableOn: l.availableOn,
  };
  await prisma.letter.upsert({ where: { id: l.id }, update: data, create: { id: l.id, ...data } });
}

console.log(`Seed selesai: ${letters.length} surat.`);
await prisma.$disconnect();
