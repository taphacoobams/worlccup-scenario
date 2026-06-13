import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  MANAGER_COOKIE,
  verifyManagerSessionToken,
} from "@/lib/manager/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLogin = pathname === "/login";
  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (!isLogin && !isDashboard) {
    return NextResponse.next();
  }

  const token = request.cookies.get(MANAGER_COOKIE)?.value;
  const authenticated = await verifyManagerSessionToken(token);

  if (isLogin) {
    if (authenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard", "/dashboard/:path*"],
};
