import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const participantId = String(body?.participantId ?? "");
    const note = String(body?.note ?? "").trim();

    if (!participantId) {
      return NextResponse.json({ error: "participantId is required." }, { status: 400 });
    }

    if (!note) {
      await prisma.groceryNote.deleteMany({ where: { participantId } });
      return NextResponse.json({ ok: true });
    }

    await prisma.groceryNote.upsert({
      where: { participantId },
      update: { note },
      create: { participantId, note },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save grocery note", error);
    return NextResponse.json({ error: "Could not save grocery note." }, { status: 500 });
  }
}
