"use server";

import { revalidatePath, updateTag } from "next/cache";
import type { ReviewMutationState } from "@/lib/types";
import { getZodFieldErrors } from "@/lib/validations/zod-errors";
import { createReview } from "@/services/reviews";
import { requireDashboardRole } from "../_utils/dashboard-access";
import { createReviewFormSchema } from "../validation/review.schema";

function readTrimmed(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createReviewAction(
  orderId: string,
  _previousState: ReviewMutationState,
  formData: FormData,
): Promise<ReviewMutationState> {
  await requireDashboardRole("CUSTOMER", `/dashboard/orders/${orderId}`);

  const values = {
    rating: readTrimmed(formData, "rating"),
    comment: readTrimmed(formData, "comment"),
  };
  const parsed = createReviewFormSchema.safeParse({ orderId, ...values });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted review details and try again.",
      fieldErrors: getZodFieldErrors(parsed.error),
      values,
    };
  }

  const result = await createReview(parsed.data);
  if (!result.ok) {
    return {
      status: "error",
      message: result.error.message,
      fieldErrors: result.error.fieldErrors,
      values,
    };
  }

  updateTag("reviews");
  updateTag("gear");
  updateTag(`gear:${result.data.gearItemId}`);
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/customer");

  return {
    status: "success",
    message: result.message,
    data: result.data,
  };
}
