import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const title = String(body?.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        title,
        description: String(body?.description ?? "").trim() || null,
        category: String(body?.category ?? "").trim() || null,
        imageUrl: String(body?.imageUrl ?? "").trim() || null,
        activityUrl: String(body?.activityUrl ?? "").trim() || null,
        includedInStay:
          typeof body?.includedInStay === "boolean" ? body.includedInStay : null,
      },
    });

    return NextResponse.json({ activity });
  } catch (error) {
    console.error("Failed to update activity", error);
    return NextResponse.json({ error: "Could not update activity." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    await prisma.activity.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete activity", error);
    return NextResponse.json({ error: "Could not delete activity." }, { status: 500 });
  }
}
