import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ROLE_HOME, allowedRolesForPath } from "@/lib/auth/dashboard-routes";
import {
  decodeSessionToken,
  hasUnexpiredSessionToken,
} from "@/lib/auth/session-token";

const AUTH_ROUTES = ["/login", "/register"];

// Keep redirects internal so a crafted returnTo can't bounce to another origin.
function safeReturnTo(pathAndQuery: string): string {
  return pathAndQuery.startsWith("/") && !pathAndQuery.startsWith("//")
    ? pathAndQuery
    : "/dashboard";
}

// Proxy performs only optimistic, cookie-based redirects. It never refreshes
// tokens, calls the backend, or verifies signatures — the frontend has no
// signing secret, so it decodes the JWT purely to route. Authentication and
// authorization are enforced near the data via /auth/me and backend role/
// ownership checks (see requireDashboardRole).
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const accessClaims = decodeSessionToken(
    request.cookies.get("accessToken")?.value,
  );
  const refreshClaims = decodeSessionToken(
    request.cookies.get("refreshToken")?.value,
  );
  const usableAccessClaims = hasUnexpiredSessionToken(accessClaims)
    ? accessClaims
    : null;
  const usableRefreshClaims = hasUnexpiredSessionToken(refreshClaims)
    ? refreshClaims
    : null;
  const claims = usableAccessClaims ?? usableRefreshClaims;
  const hasSessionHint = Boolean(claims);
  const role = claims?.role ?? null;
  const home = role ? ROLE_HOME[role] : "/dashboard";

  if (AUTH_ROUTES.includes(pathname)) {
    // Only a currently usable access token can optimistically skip login.
    if (usableAccessClaims) {
      return NextResponse.redirect(new URL(home, request.url));
    }

    // An unexpired refresh-token hint must be checked by the backend. Route it
    // through the narrow same-origin adapter instead of bouncing directly back
    // to a dashboard that may reject the stale access token.
    if (usableRefreshClaims) {
      const refreshUrl = new URL("/auth/refresh", request.url);
      refreshUrl.searchParams.set("returnTo", home);
      return NextResponse.redirect(refreshUrl);
    }
  }

  if (pathname.startsWith("/dashboard")) {
    // Guests are sent to login with a safe path to return to afterwards.
    if (!hasSessionHint) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "returnTo",
        safeReturnTo(`${pathname}${search}`),
      );
      return NextResponse.redirect(loginUrl);
    }

    // Optimistically bounce an obviously wrong-role visitor to their own
    // dashboard. When the role can't be decoded we defer to the page guard.
    const allowedRoles = allowedRolesForPath(pathname);
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
