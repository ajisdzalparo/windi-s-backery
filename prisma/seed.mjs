// Menyinkronkan surat dari prisma/letters.json ke database. Aman dijalankan berulang:
// - surat yang tidak berubah tanggalnya tetap menyimpan status "sudah dibaca" & posisinya;
// - surat yang tanggalnya berubah dianggap surat baru (status baca & posisi diulang);
// - surat yang sudah tidak ada di file dihapus.
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const letters = JSON.parse(readFileSync(new URL("./letters.json", import.meta.url), "utf8"));

for (const l of letters) {
  const data = { title: l.title, body: l.body, photoUrl: l.photoUrl ?? null, availableOn: l.availableOn };
  const existing = await prisma.letter.findUnique({ where: { id: l.id } });
  if (!existing) {
    await prisma.letter.create({ data: { id: l.id, ...data } });
  } else if (existing.availableOn !== l.availableOn) {
    await prisma.letter.update({ where: { id: l.id }, data: { ...data, readAt: null, posX: null, posZ: null } });
  } else {
    await prisma.letter.update({ where: { id: l.id }, data });
  }
}

const removed = await prisma.letter.deleteMany({ where: { id: { notIn: letters.map((l) => l.id) } } });
console.log(`Seed selesai: ${letters.length} surat${removed.count ? `, ${removed.count} surat lama dihapus` : ""}.`);
await prisma.$disconnect();
