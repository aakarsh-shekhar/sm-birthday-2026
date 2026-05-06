import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { type EasterEggKey, isEasterEggKey } from "@/lib/easter-eggs";

function normalizeKeys(body: Record<string, unknown>): EasterEggKey[] | null {
  const rawSingle = body.eggKey;
  const rawMany = body.eggKeys;
  const keys = new Set<string>();

  if (typeof rawSingle === "string" && rawSingle.trim()) {
    keys.add(rawSingle.trim());
  }
  if (Array.isArray(rawMany)) {
    for (const item of rawMany) {
      if (typeof item === "string" && item.trim()) keys.add(item.trim());
    }
  }

  const list = [...keys];
  if (list.length === 0) return null;

  for (const key of list) {
    if (!isEasterEggKey(key)) return null;
  }
  return list as EasterEggKey[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const participantId = String(body?.participantId ?? "").trim();

    if (!participantId) {
      return NextResponse.json({ error: "participantId is required." }, { status: 400 });
    }

    const keys = normalizeKeys(body);
    if (!keys) {
      return NextResponse.json(
        { error: "Provide eggKey (string) or eggKeys (string[]) with valid egg keys." },
        { status: 400 },
      );
    }

    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      select: { id: true },
    });
    if (!participant) {
      return NextResponse.json({ error: "Participant not found." }, { status: 404 });
    }

    await prisma.easterEggFind.createMany({
      data: keys.map((eggKey) => ({ participantId, eggKey })),
      skipDuplicates: true,
    });

    const uniqueEggCount = await prisma.easterEggFind.count({
      where: { participantId },
    });

    return NextResponse.json({ ok: true, recorded: keys.length, uniqueEggCount });
  } catch (error) {
    console.error("easter-eggs POST", error);
    return NextResponse.json({ error: "Could not save easter egg." }, { status: 500 });
  }
}
