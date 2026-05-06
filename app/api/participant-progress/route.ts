import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Phase = "swipe" | "review" | "food" | "grocery" | "finished";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const participantId = String(searchParams.get("participantId") ?? "").trim();

  if (!participantId) {
    return NextResponse.json({ error: "participantId is required." }, { status: 400 });
  }

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    select: {
      id: true,
      name: true,
      skippedToGrocery: true,
      swipeReviewCompleted: true,
      foodPicksSubmitted: true,
      flowFinished: true,
      swipes: {
        select: { activityId: true, reaction: true },
      },
      easterEggFinds: {
        select: { eggKey: true },
      },
    },
  });

  if (!participant) {
    return NextResponse.json({ error: "Participant not found." }, { status: 404 });
  }

  const activities = await prisma.activity.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      imageUrl: true,
      activityUrl: true,
      includedInStay: true,
    },
  });

  const swipeByActivity = new Map(participant.swipes.map((s) => [s.activityId, s.reaction]));
  let swipeIndex = 0;
  for (let i = 0; i < activities.length; i++) {
    if (!swipeByActivity.has(activities[i].id)) {
      swipeIndex = i;
      break;
    }
    swipeIndex = i + 1;
  }

  const allSwiped = activities.length === 0 || swipeIndex >= activities.length;

  let phase: Phase;
  if (activities.length === 0) {
    phase = "finished";
  } else if (participant.skippedToGrocery) {
    phase = participant.flowFinished ? "finished" : "grocery";
  } else if (!allSwiped) {
    phase = "swipe";
  } else if (!participant.swipeReviewCompleted) {
    phase = "review";
  } else if (!participant.foodPicksSubmitted) {
    phase = "food";
  } else if (!participant.flowFinished) {
    phase = "grocery";
  } else {
    phase = "finished";
  }

  const swipesPayload = participant.swipes.map((s) => ({
    activityId: s.activityId,
    reaction: s.reaction,
  }));

  const easterEggKeys = [
    ...new Set(
      participant.easterEggFinds.map((r) => r.eggKey).filter((k): k is string => typeof k === "string"),
    ),
  ];

  return NextResponse.json({
    participant: {
      id: participant.id,
      name: participant.name,
      skippedToGrocery: participant.skippedToGrocery,
      swipeReviewCompleted: participant.swipeReviewCompleted,
      foodPicksSubmitted: participant.foodPicksSubmitted,
      flowFinished: participant.flowFinished,
    },
    activities,
    swipeIndex,
    phase,
    swipes: swipesPayload,
    easterEggKeys,
  });
}
