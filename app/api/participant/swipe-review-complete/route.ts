import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const participantId = String(body?.participantId ?? "").trim();

    if (!participantId) {
      return NextResponse.json({ error: "participantId is required." }, { status: 400 });
    }

    try {
      await prisma.participant.update({
        where: { id: participantId },
        data: { swipeReviewCompleted: true },
      });
    } catch (err) {
      const code = err && typeof err === "object" && "code" in err ? (err as { code?: string }).code : "";
      if (code === "P2025") {
        return NextResponse.json({ error: "Participant not found." }, { status: 404 });
      }
      throw err;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("swipe-review-complete", error);
    return NextResponse.json({ error: "Could not update progress." }, { status: 500 });
  }
}
