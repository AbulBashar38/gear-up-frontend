"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type {
  AuthFormState,
  AuthTokens,
  FieldErrors,
  RegistrableRole,
} from "@/lib/types";
import { loginRequest, registerRequest } from "@/services/auth";

// Access token lives ~1 day, refresh ~7 days, matching the backend's own
// cookie lifetimes. These are frontend-domain HttpOnly cookies; the JWTs
// are never exposed to client JavaScript.
const ACCESS_MAX_AGE = 60 * 60 * 24;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s-]{7,20}$/;
const REGISTRABLE_ROLES: RegistrableRole[] = ["CUSTOMER", "PROVIDER"];

async function setSessionCookies(tokens: AuthTokens) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  const base = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };

  cookieStore.set("accessToken", tokens.accessToken, {
    ...base,
    maxAge: ACCESS_MAX_AGE,
  });
  cookieStore.set("refreshToken", tokens.refreshToken, {
    ...base,
    maxAge: REFRESH_MAX_AGE,
  });
}

// Only allow internal, single-slash paths so a crafted `returnTo` can't
// bounce the user to an external origin.
function safeReturnTo(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

function readTrimmed(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(
  redirectTo: string,
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readTrimmed(formData, "email").toLowerCase();
  const password =
    typeof formData.get("password") === "string"
      ? (formData.get("password") as string)
      : "";

  const fieldErrors: FieldErrors = {};
  if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = ["Enter a valid email address."];
  }
  if (password.length < 6) {
    fieldErrors.password = ["Password must be at least 6 characters."];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors,
      values: { email },
    };
  }

  const result = await loginRequest({ email, password });

  if (!result.ok) {
    return {
      status: "error",
      message: result.error.message,
      fieldErrors: result.error.fieldErrors,
      values: { email },
    };
  }

  await setSessionCookies(result.data);

  const destination = safeReturnTo(redirectTo) ?? "/";
  redirect(destination);
}

export async function registerAction(
  redirectTo: string,
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = readTrimmed(formData, "name");
  const email = readTrimmed(formData, "email").toLowerCase();
  const phone = readTrimmed(formData, "phone");
  const password =
    typeof formData.get("password") === "string"
      ? (formData.get("password") as string)
      : "";
  const roleValue = readTrimmed(formData, "role");
  const role = REGISTRABLE_ROLES.includes(roleValue as RegistrableRole)
    ? (roleValue as RegistrableRole)
    : "CUSTOMER";

  const fieldErrors: FieldErrors = {};
  if (!name) {
    fieldErrors.name = ["Name is required."];
  }
  if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = ["Enter a valid email address."];
  }
  if (!PHONE_PATTERN.test(phone)) {
    fieldErrors.phone = ["Enter a valid phone number (7–20 digits)."];
  }
  if (password.length < 6) {
    fieldErrors.password = ["Password must be at least 6 characters."];
  }

  // Preserve safe input on failure; never echo the password back.
  const values = { name, email, phone, role };

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors,
      values,
    };
  }

  const result = await registerRequest({ name, email, phone, password, role });

  if (!result.ok) {
    return {
      status: "error",
      message: result.error.message,
      fieldErrors: result.error.fieldErrors,
      values,
    };
  }

  await setSessionCookies(result.data);

  const destination = safeReturnTo(redirectTo) ?? "/";
  redirect(destination);
}
