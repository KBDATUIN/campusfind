/* ============================================================
   CampusFind — Vercel Edge Middleware
   ============================================================
   Runs server-side on Vercel BEFORE any static file is served.

   This gates the /admin/ folder: only visitors carrying a staff/admin
   session cookie (cf_role) can reach the admin pages. Everyone else
   is redirected away, so the admin panel effectively doesn't exist
   to the public.

   Written with plain Web APIs (no Next.js) so it works on static
   deployments. The default export receives a standard Request and
   returns a Response (redirect) or undefined (let the request
   continue normally).

   IMPORTANT: This is a convenience gate, not the security layer.
   The real protection is Supabase Row Level Security — admin data
   cannot be read or modified without a staff/admin auth token.
   ============================================================ */

function readCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq > -1 && part.slice(0, eq).trim() === name) {
      try {
        return decodeURIComponent(part.slice(eq + 1).trim());
      } catch (e) {
        return part.slice(eq + 1).trim();
      }
    }
  }
  return undefined;
}

export default function middleware(request) {
  const url = new URL(request.url);
  const { pathname } = url;

  // Only guard the admin panel; every other path passes through untouched.
  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) {
    return undefined;
  }

  const role = readCookie(request, "cf_role");

  if (role === "admin" || role === "staff") {
    return undefined; // staff/admin — allow
  }

  if (!role) {
    // Not logged in at all — send them to the login page (keep their intent).
    const login = new URL("/login.html", url.origin);
    login.searchParams.set("redirect", pathname);
    return Response.redirect(login, 302);
  }

  // Logged in but not staff/admin (e.g. a student) — back to the home page.
  return Response.redirect(new URL("/index.html", url.origin), 302);
}
