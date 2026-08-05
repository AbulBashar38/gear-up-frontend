import "server-only";

import type {
  OrderListQuery,
  RentalOrder,
  RentalOrderStatus,
} from "@/lib/types";
import { gearUpFetch } from "./server-client";

export function listOrders(query: OrderListQuery = {}) {
  return gearUpFetch<RentalOrder[]>("/orders", {
    auth: true,
    cache: "no-store",
    query: {
      status: query.status,
      paymentStatus: query.paymentStatus,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    },
    fallbackMessage:
      "Your rental orders couldn't be loaded. Try again shortly.",
  });
}

export function updateOrderStatus(id: string, status: RentalOrderStatus) {
  return gearUpFetch<RentalOrder>(`/orders/${id}/status`, {
    method: "PATCH",
    auth: true,
    cache: "no-store",
    json: { status },
    fallbackMessage: "The order status couldn't be updated. Try again shortly.",
  });
}
