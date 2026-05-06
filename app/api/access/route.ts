import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME, getAccessToken, getEventPasscode } from "@/lib/access";

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const passcode = String(body?.passcode ?? "");

    const expectedPasscode = getEventPasscode();
    const accessToken = getAccessToken();

    if (!expectedPasscode || !accessToken) {
      return NextResponse.json(
        { error: "Access gate not configured on server." },
        { status: 500 },
      );
    }

    if (!safeEqual(passcode, expectedPasscode)) {
      return NextResponse.json({ error: "Invalid passcode." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: ACCESS_COOKIE_NAME,
      value: accessToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 3,
    });

    return response;
  } catch (error) {
    console.error("Failed to verify event passcode", error);
    return NextResponse.json({ error: "Could not verify passcode." }, { status: 500 });
  }
}
