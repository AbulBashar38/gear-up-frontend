"use server";

import type { PaymentStatus, RentalOrderStatus } from "@/lib/types";
import { clearPendingCheckout } from "@/lib/checkout";
import { getCurrentUser } from "@/services/auth";
import { getOrder } from "@/services/orders";
import { idSchema } from "../../(dashboard)/validation/order.schema";

export type CheckoutStatusResult =
  | {
      ok: true;
      orderStatus: RentalOrderStatus;
      paymentStatus: PaymentStatus;
    }
  | { ok: false; message: string };

/**
 * Authoritative status read used by the success poller while the Stripe webhook
 * moves payment PENDING -> COMPLETED and order CONFIRMED -> PAID. Never trusts
 * the `session_id`; only the backend order/payment record is truth.
 */
export async function refreshCheckoutStatusAction(
  orderId: string,
): Promise<CheckoutStatusResult> {
  const parsedId = idSchema.safeParse(orderId);
  if (!parsedId.success) {
    return { ok: false, message: "This order reference is not valid." };
  }

  const session = await getCurrentUser();
  if (!session.ok) {
    return { ok: false, message: "Your session has expired. Please sign in again." };
  }

  const result = await getOrder(parsedId.data);
  if (!result.ok) {
    return { ok: false, message: result.error.message };
  }

  return {
    ok: true,
    orderStatus: result.data.status,
    paymentStatus: result.data.payment?.status ?? "PENDING",
  };
}

/** Clears the short-lived pending-checkout cookie after a terminal result. */
export async function finalizeCheckoutAction() {
  await clearPendingCheckout();
}
