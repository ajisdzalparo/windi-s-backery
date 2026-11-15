import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dayKey } from "@/lib/data";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const letter = await prisma.letter.findUnique({ where: { id } });
  if (!letter || letter.availableOn > dayKey()) {
    return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });
  }
  const readAt = letter.readAt ?? new Date();
  if (!letter.readAt) await prisma.letter.update({ where: { id }, data: { readAt } });
  return NextResponse.json({ readAt: readAt.toISOString() });
}
