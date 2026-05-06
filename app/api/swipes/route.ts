import { Reaction } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const validReactions = new Set(Object.values(Reaction));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const participantId = String(body?.participantId ?? "");
    const activityId = String(body?.activityId ?? "");
    const reaction = String(body?.reaction ?? "") as Reaction;

    if (!participantId || !activityId || !validReactions.has(reaction)) {
      return NextResponse.json(
        { error: "participantId, activityId and valid reaction are required." },
        { status: 400 },
      );
    }

    const swipe = await prisma.swipe.upsert({
      where: { participantId_activityId: { participantId, activityId } },
      update: { reaction },
      create: { participantId, activityId, reaction },
    });

    return NextResponse.json({ swipe });
  } catch (error) {
    console.error("Failed to save swipe", error);
    return NextResponse.json(
      { error: "Could not save swipe. Please try again." },
      { status: 500 },
    );
  }
}
