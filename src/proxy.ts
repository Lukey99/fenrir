import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes = ["/login", "/register"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  // Exact match for "/" — the landing page — since every pathname starts
  // with "/" and a startsWith check here would make every route "public".
  const isPublicRoute =
    req.nextUrl.pathname === "/" ||
    publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route));

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|screenshots|icon).*)"],
};
