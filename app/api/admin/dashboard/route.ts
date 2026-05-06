import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [activities, participants, foodOptions, groceryItems] = await Promise.all([
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
        foodSelections: {
          include: {
            foodOption: {
              select: { id: true, title: true },
            },
          },
        },
        groceryNote: true,
        groceryItems: {
          select: { id: true, item: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
        easterEggFinds: {
          select: { eggKey: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.foodOption.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        selections: {
          include: {
            participant: {
              select: { id: true, name: true },
            },
          },
        },
      },
    }),
    prisma.groceryItem.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        participant: {
          select: { id: true, name: true },
        },
      },
    }),
  ]);

  return NextResponse.json({ activities, participants, foodOptions, groceryItems });
}
