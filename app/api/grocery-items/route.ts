import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getGroceryDelegate() {
  return (prisma as unknown as {
    groceryItem?: {
      findMany: typeof prisma.groceryItem.findMany;
      create: typeof prisma.groceryItem.create;
    };
  }).groceryItem;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const participantId = String(searchParams.get("participantId") ?? "");

    if (!participantId) {
      return NextResponse.json({ error: "participantId is required." }, { status: 400 });
    }

    const groceryItem = getGroceryDelegate();
    if (!groceryItem) {
      return NextResponse.json(
        { error: "Server is out of date. Regenerate Prisma client and restart." },
        { status: 500 },
      );
    }

    const items = await groceryItem.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        participant: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      items,
      myItemIds: items
        .filter((item) => item.participantId === participantId)
        .map((item) => item.id),
    });
  } catch (error) {
    console.error("Failed to load grocery items", error);
    return NextResponse.json(
      { error: "Could not load grocery items. Ensure DB schema is up to date." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const participantId = String(body?.participantId ?? "");
    const item = String(body?.item ?? "").trim();

    if (!participantId) {
      return NextResponse.json({ error: "participantId is required." }, { status: 400 });
    }
    if (!item) {
      return NextResponse.json({ error: "item is required." }, { status: 400 });
    }

    const groceryDelegate = getGroceryDelegate();
    if (!groceryDelegate) {
      return NextResponse.json(
        { error: "Server is out of date. Regenerate Prisma client and restart." },
        { status: 500 },
      );
    }

    const groceryItem = await groceryDelegate.create({
      data: { participantId, item },
      include: {
        participant: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ groceryItem });
  } catch (error) {
    console.error("Failed to save grocery item", error);
    return NextResponse.json({ error: "Could not save grocery item." }, { status: 500 });
  }
}
