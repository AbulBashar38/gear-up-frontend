"use server";

import { revalidatePath } from "next/cache";
import type { AdminMutationState } from "@/lib/types";
import { getZodFieldErrors } from "@/lib/validations/zod-errors";
import { updateCurrentUser } from "@/services/auth";
import { requireDashboardUser } from "../_utils/dashboard-access";
import { profileFormSchema } from "../validation/profile.schema";

function readTrimmed(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateProfileAction(
  _previousState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  // The backend resolves the target account from the access token, so there is
  // no user ID to bind or trust here.
  await requireDashboardUser("/dashboard/profile");

  const input = {
    name: readTrimmed(formData, "name"),
    phone: readTrimmed(formData, "phone"),
  };
  const parsed = profileFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: getZodFieldErrors(parsed.error),
      values: input,
    };
  }

  const result = await updateCurrentUser(parsed.data);
  if (!result.ok) {
    // A phone number already held by another account arrives as a `409`.
    return {
      status: "error",
      message: result.error.message,
      fieldErrors: result.error.fieldErrors,
      values: input,
    };
  }

  // The shell, overview pages, and profile all render the `/auth/me` record.
  revalidatePath("/dashboard", "layout");
  return { status: "success", message: result.message };
}
