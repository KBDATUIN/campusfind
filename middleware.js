/* ============================================================
   CampusFind — Vercel Edge Middleware
   ============================================================
   Runs server-side on Vercel BEFORE any static file is served.

   It gates the /admin/ folder: only visitors carrying a staff/admin
   session cookie (cf_role) can reach the admin pages. Everyone else
   is redirected away, so the admin panel effectively doesn't exist
   to the public.

   IMPORTANT: This is a convenience gate, not the security layer.
   The real protection is Supabase Row Level Security — admin data
   cannot be read or modified without a staff/admin auth token.
   ============================================================ */
import { NextResponse } from "next/server";

const ADMIN_ROLES = new Set(["admin", "staff"]);

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("cf_role")?.value;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (ADMIN_ROLES.has(role)) {
      return NextResponse.next();
    }
    if (!role) {
      // Not logged in at all — send them to the login page.
      const url = new URL("/login.html", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // Logged in but not staff/admin (e.g. a student) — back to the home page.
    return NextResponse.redirect(new URL("/index.html", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
