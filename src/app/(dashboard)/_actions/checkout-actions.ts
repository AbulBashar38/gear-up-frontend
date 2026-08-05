"use server";

import { redirect } from "next/navigation";
import type { AdminMutationState } from "@/lib/types";
import {
  isTrustedStripeCheckoutUrl,
  setPendingCheckout,
} from "@/lib/checkout";
import { createCheckoutSession } from "@/services/orders";
import { requireDashboardRole } from "../_utils/dashboard-access";
import { idSchema } from "../validation/order.schema";

function errorState(message: string): AdminMutationState {
  return { status: "error", message };
}

/**
 * Customer-only. Creates (or reuses) the hosted Stripe Checkout Session for a
 * CONFIRMED, payment-PENDING order, stores short-lived return context, and
 * redirects straight to Stripe. The backend enforces order ownership and
 * eligibility; the button on the order detail page is only a convenience.
 */
export async function startCheckoutAction(
  orderId: string,
  _previousState: AdminMutationState,
  _formData: FormData,
): Promise<AdminMutationState> {
  void _previousState;
  void _formData;
  await requireDashboardRole("CUSTOMER", `/dashboard/orders/${orderId}`);

  const parsedId = idSchema.safeParse(orderId);
  if (!parsedId.success) {
    return errorState("This order reference is not valid.");
  }

  const result = await createCheckoutSession(parsedId.data);
  if (!result.ok) {
    return errorState(result.error.message);
  }

  if (!isTrustedStripeCheckoutUrl(result.data.checkoutUrl)) {
    return errorState(
      "The payment link couldn't be verified as a secure Stripe page. Please try again.",
    );
  }

  await setPendingCheckout({
    orderId: result.data.orderId,
    paymentId: result.data.paymentId,
  });

  // Absolute external redirect to Stripe-hosted Checkout.
  redirect(result.data.checkoutUrl);
}
