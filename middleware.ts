import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, api routes, and public auth pages
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return NextResponse.next();
  }

  // Check Supabase session cookies (sb-*-auth-token or custom auth indicator)
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some((c) =>
    c.name.includes("sb-") || c.name.includes("auth") || c.name === "electiveos_user"
  );
  const authHeader = request.headers.get("authorization");

  // In development / demo or mock, if no session present on protected page:
  // (API endpoints perform strict token/user verification independently)
  if (!hasAuthCookie && !authHeader && !pathname.startsWith("/api/")) {
    // Check if user is trying to access protected dashboard
    if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname.startsWith("/browse") || pathname.startsWith("/picks") || pathname.startsWith("/advisor")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    const roleCookie = request.cookies.get("user_role")?.value;
    if (roleCookie && roleCookie !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
