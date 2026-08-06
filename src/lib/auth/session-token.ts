import type { Role } from "@/lib/types";

// Claims the GearUp backend embeds in its access/refresh JWTs
// (see backend auth.service.ts: `{ id, name, email, role }` + iat/exp).
export type SessionTokenClaims = {
  id?: string;
  name?: string;
  email?: string;
  role?: Role;
  iat?: number;
  exp?: number;
};

const VALID_ROLES: readonly Role[] = ["CUSTOMER", "PROVIDER", "ADMIN"];

// Edge-safe base64url decode. Runs inside Proxy (Edge runtime), so it relies on
// `atob`/`TextDecoder` and never touches Node's `Buffer`.
function base64UrlDecode(segment: string): string | null {
  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Decode a backend JWT payload for optimistic routing only. This does NOT
 * verify the signature — the frontend does not hold the signing secret and must
 * not pretend it did. Real authorization stays at the data/mutation layer via
 * `/auth/me` and backend role checks.
 */
export function decodeSessionToken(
  token: string | undefined | null,
): SessionTokenClaims | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  const json = base64UrlDecode(parts[1]);
  if (!json) return null;

  try {
    const payload = JSON.parse(json) as Record<string, unknown>;
    const role =
      typeof payload.role === "string" &&
      VALID_ROLES.includes(payload.role as Role)
        ? (payload.role as Role)
        : undefined;

    return {
      id: typeof payload.id === "string" ? payload.id : undefined,
      name: typeof payload.name === "string" ? payload.name : undefined,
      email: typeof payload.email === "string" ? payload.email : undefined,
      role,
      iat: typeof payload.iat === "number" ? payload.iat : undefined,
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
    };
  } catch {
    return null;
  }
}
