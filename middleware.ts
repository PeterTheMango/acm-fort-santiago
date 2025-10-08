import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const protectedRoutes = createRouteMatcher([
  "/(.*)",
  "/admin(.*)",
  "/api(.*)",
  "/profile(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (protectedRoutes(req)) await auth.protect();

  const { userId } = await auth();
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

  // Check userSetup flag - first from cache cookie, then from database via API call
  if (userId && !allowWhileSettingUp) {
    // Check cache cookie first
    const setupCookie = req.cookies.get("user_setup_complete")?.value;
    if (setupCookie === "true") {
      return; // User setup is complete, allow request
    }

    // If no cache, check database via API call
    try {
      const apiUrl = new URL("/api/users/me", req.url);
      const response = await fetch(apiUrl.toString(), {
        headers: {
          Cookie: req.headers.get("cookie") || "",
        },
      });

      if (response.ok) {
        const user = await response.json();
        if (!user.userSetup) {
          const url = req.nextUrl.clone();
          url.pathname = "/profile/edit";
          url.search = "";
          return NextResponse.redirect(url);
        } else {
          // User setup is complete, set cache cookie
          const res = NextResponse.next();
          res.cookies.set("user_setup_complete", "true", {
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            sameSite: "lax",
            httpOnly: true,
          });
          return res;
        }
      }
    } catch (error) {
      console.error("Error checking user setup status:", error);
      // On error, allow the request to proceed to avoid blocking users
    }
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
