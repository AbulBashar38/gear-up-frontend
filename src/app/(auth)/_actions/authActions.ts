"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type {
  AuthFormState,
  AuthTokens,
  RegistrableRole,
} from "@/lib/types";
import { getZodFieldErrors } from "@/lib/validations/zod-errors";
import { loginRequest, registerRequest } from "@/services/auth";
import { loginFormSchema, registerFormSchema } from "../validation/auth.schema";

// Access token lives ~1 day, refresh ~7 days, matching the backend's own
// cookie lifetimes. These are frontend-domain HttpOnly cookies; the JWTs
// are never exposed to client JavaScript.
const ACCESS_MAX_AGE = 60 * 60 * 24;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

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

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function loginAction(
  redirectTo: string,
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const input = {
    email: readTrimmed(formData, "email").toLowerCase(),
    password: readString(formData, "password"),
  };
  const parsed = loginFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: getZodFieldErrors(parsed.error),
      values: { email: input.email },
    };
  }

  const result = await loginRequest(parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message: result.error.message,
      fieldErrors: result.error.fieldErrors,
      values: { email: parsed.data.email },
    };
  }

  await setSessionCookies(result.data);

  const destination = safeReturnTo(redirectTo) ?? "/dashboard";
  redirect(destination);
}

export async function registerAction(
  redirectTo: string,
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const input = {
    name: readTrimmed(formData, "name"),
    email: readTrimmed(formData, "email").toLowerCase(),
    phone: readTrimmed(formData, "phone"),
    password: readString(formData, "password"),
    role: readTrimmed(formData, "role"),
  };
  const parsed = registerFormSchema.safeParse(input);
  const safeRole: RegistrableRole =
    input.role === "PROVIDER" ? "PROVIDER" : "CUSTOMER";

  // Preserve safe input on failure; never echo the password back.
  const values = {
    name: input.name,
    email: input.email,
    phone: input.phone,
    role: safeRole,
  };

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: getZodFieldErrors(parsed.error),
      values,
    };
  }

  const result = await registerRequest(parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message: result.error.message,
      fieldErrors: result.error.fieldErrors,
      values,
    };
  }

  await setSessionCookies(result.data);

  const destination = safeReturnTo(redirectTo) ?? "/dashboard";
  redirect(destination);
}
