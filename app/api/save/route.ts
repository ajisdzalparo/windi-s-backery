import { NextResponse } from "next/server";
import { parseSave, writeSave } from "@/lib/game";

export async function PUT(req: Request) {
  const save = parseSave(await req.json().catch(() => null));
  if (!save) return NextResponse.json({ error: "Data simpanan tidak valid" }, { status: 400 });
  try {
    await writeSave(save);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PUT /api/save", e);
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}
