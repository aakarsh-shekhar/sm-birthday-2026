import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedActivities } from "@/lib/activities";

async function ensureActivities() {
  const count = await prisma.activity.count();
  if (count > 0) return;

  await prisma.activity.createMany({
    data: seedActivities.map((activity, index) => ({
      title: activity.title,
      description: activity.description,
      category: activity.category,
      imageUrl: null,
      activityUrl: activity.activityUrl,
      includedInStay: activity.includedInStay,
      sortOrder: index,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    await ensureActivities();

    const participant = await prisma.participant.create({
      data: { name },
    });

    const activities = await prisma.activity.findMany({
      orderBy: { sortOrder: "asc" },
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

    return NextResponse.json({
      participantId: participant.id,
      participantName: participant.name,
      activities,
    });
  } catch (error) {
    console.error("Failed to start session", error);
    return NextResponse.json(
      { error: "Could not start session. Please try again." },
      { status: 500 },
    );
  }
}
