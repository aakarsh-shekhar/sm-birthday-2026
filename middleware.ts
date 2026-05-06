import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME, getAccessToken } from "@/lib/access";

function isPublicPath(pathname: string) {
  return (
    pathname === "/unlock" ||
    pathname === "/api/access" ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const expectedToken = getAccessToken();
  const cookieToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value ?? "";

  if (!expectedToken || cookieToken !== expectedToken) {
    const unlockUrl = new URL("/unlock", request.url);
    return NextResponse.redirect(unlockUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)", "/api/:path*"],
};
