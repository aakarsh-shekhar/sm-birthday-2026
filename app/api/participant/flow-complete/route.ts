import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const participantId = String(body?.participantId ?? "").trim();

    if (!participantId) {
      return NextResponse.json({ error: "participantId is required." }, { status: 400 });
    }

    const updated = await prisma.participant.updateMany({
      where: { id: participantId },
      data: { flowFinished: true },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Participant not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("flow-complete", error);
    return NextResponse.json({ error: "Could not update progress." }, { status: 500 });
  }
}
