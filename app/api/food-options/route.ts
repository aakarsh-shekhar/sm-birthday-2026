import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const participantId = String(searchParams.get("participantId") ?? "");

  if (!participantId) {
    return NextResponse.json({ error: "participantId is required." }, { status: 400 });
  }

  const [options, selections] = await Promise.all([
    prisma.foodOption.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true, description: true, infoUrl: true },
    }),
    prisma.foodSelection.findMany({
      where: { participantId },
      select: { foodOptionId: true },
    }),
  ]);

  return NextResponse.json({
    options,
    selectedOptionIds: selections.map((selection) => selection.foodOptionId),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const participantId = String(body?.participantId ?? "");
    const optionIds = Array.isArray(body?.optionIds)
      ? body.optionIds.map((id: unknown) => String(id))
      : [];

    if (!participantId) {
      return NextResponse.json({ error: "participantId is required." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.foodSelection.deleteMany({ where: { participantId } }),
      ...(optionIds.length > 0
        ? [
            prisma.foodSelection.createMany({
              data: optionIds.map((foodOptionId: string) => ({
                participantId,
                foodOptionId,
              })),
            }),
          ]
        : []),
      prisma.participant.update({
        where: { id: participantId },
        data: { foodPicksSubmitted: true },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save food options", error);
    return NextResponse.json({ error: "Could not save food options." }, { status: 500 });
  }
}
