import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const title = String(body?.title ?? "").trim();

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const option = await prisma.foodOption.update({
      where: { id },
      data: { title },
    });

    return NextResponse.json({ option });
  } catch (error) {
    console.error("Failed to update food option", error);
    return NextResponse.json({ error: "Could not update food option." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    await prisma.foodOption.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete food option", error);
    return NextResponse.json({ error: "Could not delete food option." }, { status: 500 });
  }
}
