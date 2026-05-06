import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const activities = await prisma.activity.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ activities });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = String(body?.title ?? "").trim();

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const count = await prisma.activity.count();
    const activity = await prisma.activity.create({
      data: {
        title,
        description: String(body?.description ?? "").trim() || null,
        category: String(body?.category ?? "").trim() || null,
        imageUrl: String(body?.imageUrl ?? "").trim() || null,
        activityUrl: String(body?.activityUrl ?? "").trim() || null,
        includedInStay:
          typeof body?.includedInStay === "boolean" ? body.includedInStay : null,
        sortOrder: Number.isInteger(body?.sortOrder) ? body.sortOrder : count,
      },
    });

    return NextResponse.json({ activity });
  } catch (error) {
    console.error("Failed to create activity", error);
    return NextResponse.json({ error: "Could not create activity." }, { status: 500 });
  }
}
