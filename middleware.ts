import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Note: Route groups like (platform) do not appear in the URL.
// Protect the actual URL paths instead.
const protectedRoutes = createRouteMatcher([
  "/profile(.*)",
  "/admin(.*)",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!protectedRoutes(req)) return;

  await auth.protect();

  // Prefer session claims over network calls in middleware.
  const setupDone = Boolean((auth as any)?.sessionClaims?.publicMetadata?.setupUser);
  // Short-lived cookie set after profile save to bypass redirect immediately
  const setupCookie = req.cookies.get("setup_user")?.value === "1";
  const pathname = req.nextUrl.pathname;

  const allowWhileSettingUp =
    pathname.startsWith("/profile/edit") ||
    // Allow viewing others' profiles even if setup incomplete
    pathname.startsWith("/profile/") ||
    pathname.startsWith("/api/users") ||
    pathname.startsWith("/api/connections") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/sign-out");

  if (!setupDone && !setupCookie && !allowWhileSettingUp) {
    const url = req.nextUrl.clone();
    url.pathname = "/profile/edit";
    url.search = "";
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
