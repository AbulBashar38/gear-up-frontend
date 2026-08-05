import "server-only";

import { cookies } from "next/headers";

const PENDING_CHECKOUT_COOKIE = "gearup_pending_checkout";
// Stripe Checkout Sessions expire well within 24h; keep the return context short.
const PENDING_CHECKOUT_MAX_AGE = 60 * 30;

export type PendingCheckout = {
  orderId: string;
  paymentId: string;
};

/**
 * Only Stripe's hosted Checkout is an acceptable redirect target. Guards against
 * an unexpected/tampered `checkoutUrl` sending the customer off-platform.
 */
export function isTrustedStripeCheckoutUrl(rawUrl: string) {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;

  const host = url.hostname.toLowerCase();
  return host === "checkout.stripe.com" || host.endsWith(".stripe.com");
}

export async function setPendingCheckout(context: PendingCheckout) {
  const cookieStore = await cookies();
  cookieStore.set(PENDING_CHECKOUT_COOKIE, JSON.stringify(context), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_CHECKOUT_MAX_AGE,
  });
}

export async function readPendingCheckout(): Promise<PendingCheckout | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PENDING_CHECKOUT_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PendingCheckout>;
    if (
      typeof parsed.orderId === "string" &&
      typeof parsed.paymentId === "string"
    ) {
      return { orderId: parsed.orderId, paymentId: parsed.paymentId };
    }
  } catch {
    // Ignore malformed context and treat it as absent.
  }

  return null;
}

export async function clearPendingCheckout() {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_CHECKOUT_COOKIE);
}
