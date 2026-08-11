import { NextResponse, type NextRequest } from "next/server";
import {
  getCurrentUserWithAccessToken,
  refreshAccessTokenRequest,
} from "@/services/auth";

const ACCESS_MAX_AGE = 60 * 60 * 24;

function safeDashboardReturnTo(value: string | null) {
  if (!value || value.startsWith("//")) return "/dashboard";

  try {
    const url = new URL(value, "http://gearup.local");
    const isDashboardPath =
      url.pathname === "/dashboard" ||
      url.pathname.startsWith("/dashboard/");

    return isDashboardPath ? `${url.pathname}${url.search}` : "/dashboard";
  } catch {
    return "/dashboard";
  }
}

function loginUrl(request: NextRequest, returnTo: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("returnTo", returnTo);
  url.searchParams.set("reason", "session-expired");
  return url;
}

function clearSessionAndRedirect(request: NextRequest, returnTo: string) {
  const response = NextResponse.redirect(loginUrl(request, returnTo));
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
  return response;
}

/**
 * Server Components cannot rotate cookies. Protected page guards redirect here
 * after an authoritative 401/403 so this same-origin handler can exchange the
 * HttpOnly refresh token, verify the new access token with `/auth/me`, and then
 * resume the original dashboard path. Any failure clears both cookies, which
 * makes the flow terminate at login instead of redirecting forever.
 */
export async function GET(request: NextRequest) {
  const returnTo = safeDashboardReturnTo(
    request.nextUrl.searchParams.get("returnTo"),
  );
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return clearSessionAndRedirect(request, returnTo);
  }

  const refreshed = await refreshAccessTokenRequest(refreshToken);
  if (!refreshed.ok) {
    return clearSessionAndRedirect(request, returnTo);
  }

  // Validate the rotated token before sending the browser back to a protected
  // page. This also catches accounts made inactive/suspended since login.
  const currentUser = await getCurrentUserWithAccessToken(
    refreshed.data.accessToken,
  );
  if (!currentUser.ok) {
    return clearSessionAndRedirect(request, returnTo);
  }

  const response = NextResponse.redirect(new URL(returnTo, request.url));
  response.cookies.set("accessToken", refreshed.data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
  return response;
}
