import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [activities, participants] = await Promise.all([
    prisma.activity.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        swipes: {
          include: {
            participant: {
              select: { id: true, name: true },
            },
          },
        },
      },
    }),
    prisma.participant.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        swipes: {
          include: {
            activity: {
              select: { id: true, title: true },
            },
          },
        },
      },
    }),
  ]);

  return NextResponse.json({ activities, participants });
}
