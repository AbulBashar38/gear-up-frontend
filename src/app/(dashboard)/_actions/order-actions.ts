"use server";

import { revalidatePath } from "next/cache";
import type { FieldErrors, OrderMutationState } from "@/lib/types";
import { getZodFieldErrors } from "@/lib/validations/zod-errors";
import { createRentalOrder } from "@/services/orders";
import { requireDashboardRole } from "../_utils/dashboard-access";
import { createRentalOrderFormSchema } from "../validation/order.schema";

function readTrimmed(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function errorState(
  message: string,
  fieldErrors?: FieldErrors,
  values?: Record<string, string>,
): OrderMutationState {
  return { status: "error", message, fieldErrors, values };
}

export async function createRentalOrderAction(
  gearItemId: string,
  _previousState: OrderMutationState,
  formData: FormData,
): Promise<OrderMutationState> {
  await requireDashboardRole(
    "CUSTOMER",
    `/dashboard/orders/new?gearItemId=${encodeURIComponent(gearItemId)}`,
  );

  const input = {
    gearItemId,
    startDate: readTrimmed(formData, "startDate"),
    endDate: readTrimmed(formData, "endDate"),
    quantity: readTrimmed(formData, "quantity"),
  };
  const values = {
    startDate: input.startDate,
    endDate: input.endDate,
    quantity: input.quantity,
  };
  const parsed = createRentalOrderFormSchema.safeParse(input);

  if (!parsed.success) {
    return errorState(
      "Check the highlighted rental details and try again.",
      getZodFieldErrors(parsed.error),
      values,
    );
  }

  const result = await createRentalOrder(parsed.data);

  if (!result.ok) {
    return errorState(
      result.error.message,
      result.error.fieldErrors,
      values,
    );
  }

  revalidatePath("/dashboard/customer");
  revalidatePath("/dashboard/orders");

  return {
    status: "success",
    message: result.message,
    data: result.data,
  };
}
