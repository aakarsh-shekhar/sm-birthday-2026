import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const options = await prisma.foodOption.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ options });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = String(body?.title ?? "").trim();
    const description =
      typeof body?.description === "string" ? body.description.trim() || null : null;
    const infoUrl = typeof body?.infoUrl === "string" ? body.infoUrl.trim() || null : null;

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const count = await prisma.foodOption.count();
    const option = await prisma.foodOption.create({
      data: {
        title,
        description,
        infoUrl,
        sortOrder: Number.isInteger(body?.sortOrder) ? body.sortOrder : count,
      },
    });

    return NextResponse.json({ option });
  } catch (error) {
    console.error("Failed to create food option", error);
    return NextResponse.json({ error: "Could not create food option." }, { status: 500 });
  }
}
