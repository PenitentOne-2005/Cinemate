import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token");
  const { pathname } = request.nextUrl;

  // 1. Если пользователь НЕ авторизован и лезет на защищенные роуты -> шлем на /
  if (
    !token &&
    (pathname.startsWith("/home") || pathname.startsWith("/profile"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Если пользователь АВТОРИЗОВАН и пытается зайти на корневую "/" -> кидаем на /home
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/home/:path*", "/profile/:path*"],
};
