"use server";

import { revalidatePath } from "next/cache";
import type {
  AdminMutationState,
  FieldErrors,
  OrderMutationState,
  RentalOrderStatus,
} from "@/lib/types";
import { getZodFieldErrors } from "@/lib/validations/zod-errors";
import { createRentalOrder, updateOrderStatus } from "@/services/orders";
import {
  requireDashboardRole,
  requireDashboardUser,
} from "../_utils/dashboard-access";
import {
  createRentalOrderFormSchema,
  idSchema,
  orderStatusTransitionSchema,
} from "../validation/order.schema";

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

/**
 * Shared, role-aware order transition used by the order detail page. Any
 * authenticated dashboard user may submit it; the backend enforces which
 * role/state combinations are actually permitted and returns 403/409 otherwise.
 */
export async function changeOrderStatusAction(
  orderId: string,
  _previousState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  await requireDashboardUser(`/dashboard/orders/${orderId}`);

  const parsedId = idSchema.safeParse(orderId);
  if (!parsedId.success) {
    return { status: "error", message: "This order reference is not valid." };
  }

  const parsedStatus = orderStatusTransitionSchema.safeParse(
    readTrimmed(formData, "status"),
  );
  if (!parsedStatus.success) {
    return {
      status: "error",
      message: "That order transition isn't allowed from here.",
    };
  }

  const result = await updateOrderStatus(
    parsedId.data,
    parsedStatus.data as RentalOrderStatus,
  );
  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/dashboard/customer");
  revalidatePath("/dashboard/provider");
  revalidatePath("/dashboard/admin");

  return { status: "success", message: result.message };
}
