import "server-only";

import type { Payment, PaymentListQuery } from "@/lib/types";
import { gearUpFetch } from "./server-client";

export function listPayments(query: PaymentListQuery = {}) {
  return gearUpFetch<Payment[]>("/payments", {
    auth: true,
    cache: "no-store",
    query: {
      status: query.status,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    },
    fallbackMessage:
      "Payment activity couldn't be loaded. Try again shortly.",
  });
}
