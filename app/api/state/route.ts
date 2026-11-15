import { NextResponse } from "next/server";
import { loadState } from "@/lib/game";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await loadState());
  } catch (e) {
    console.error("GET /api/state", e);
    return NextResponse.json({ error: "Database tidak bisa dihubungi" }, { status: 500 });
  }
}
