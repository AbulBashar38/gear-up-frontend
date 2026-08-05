import "server-only";

import { cache } from "react";
import type {
  AuthTokens,
  CurrentUser,
  LoginInput,
  RegisterInput,
} from "@/lib/types";
import { gearUpFetch } from "./server-client";

export function loginRequest(input: LoginInput) {
  return gearUpFetch<AuthTokens>("/auth/login", {
    method: "POST",
    json: input,
    cache: "no-store",
    fallbackMessage: "We couldn't reach the sign-in desk. Try again shortly.",
  });
}

export function registerRequest(input: RegisterInput) {
  return gearUpFetch<AuthTokens>("/auth/register", {
    method: "POST",
    json: input,
    cache: "no-store",
    fallbackMessage:
      "We couldn't set up your account just now. Try again shortly.",
  });
}

export const getCurrentUser = cache(function getCurrentUserRequest() {
  return gearUpFetch<CurrentUser>("/auth/me", {
    auth: true,
    cache: "no-store",
    fallbackMessage:
      "We couldn't verify your GearUp session. Try again shortly.",
  });
});
