import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const userCookie = req.cookies.get("user")?.value;
  
  let user: any = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch (e) {
      console.error("Failed to parse user cookie", e);
    }
  }

  const hasToken = !!accessToken || !!refreshToken;

  // 1. Auto-redirect from Landing to Dashboard if logged in
  if (pathname === "/" && hasToken && user) {
    const dashboard = user.role === "TEACHER" ? "/teacher/dashboard" : "/school/dashboard";
    return NextResponse.redirect(new URL(dashboard, req.url));
  }

  // 2. Protected Routes
  const isTeacherRoute = pathname.startsWith("/teacher");
  const isSchoolRoute = pathname.startsWith("/school");
  const isAuthRoute = pathname.startsWith("/auth");

  // If trying to access protected route without token
  if ((isTeacherRoute || isSchoolRoute) && !hasToken) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 3. Role-based Protection
  if (isTeacherRoute && user?.role !== "TEACHER") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (isSchoolRoute && user?.role !== "SCHOOL_ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 4. Redirect away from Login/Register if already logged in
  if (isAuthRoute && hasToken && user) {
    const dashboard = user.role === "TEACHER" ? "/teacher/dashboard" : "/school/dashboard";
    return NextResponse.redirect(new URL(dashboard, req.url));
  }

  return NextResponse.next();
}

// Config: Define which paths trigger this middleware
export const config = {
  matcher: [
    "/",
    "/teacher/:path*",
    "/school/:path*",
    "/auth/:path*",
  ],
};
