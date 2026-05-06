import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const participantId = String(id ?? "").trim();

    if (!participantId) {
      return NextResponse.json({ error: "Invalid participant id." }, { status: 400 });
    }

    await prisma.participant.delete({
      where: { id: participantId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? (error as { code?: string }).code : "";
    if (code === "P2025") {
      return NextResponse.json({ error: "Participant not found." }, { status: 404 });
    }
    console.error("admin delete participant", error);
    return NextResponse.json({ error: "Could not delete participant." }, { status: 500 });
  }
}
