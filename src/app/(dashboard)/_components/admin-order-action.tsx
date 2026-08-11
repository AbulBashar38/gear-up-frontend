"use client";

import { useActionState } from "react";
import type { RentalOrder } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { updateOrderStatusAction } from "../_actions/admin-actions";
import {
  AdminActionMessage,
  INITIAL_ADMIN_MUTATION_STATE,
  useAdminMutationToast,
} from "./admin-mutation-feedback";
import { formatStatusLabel } from "../_utils/dashboard-format";

const ADMIN_TRANSITIONS: Record<
  RentalOrder["status"],
  RentalOrder["status"][]
> = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
  PAID: ["PICKED_UP"],
  PICKED_UP: ["RETURNED"],
  RETURNED: [],
  CANCELLED: [],
};

export function AdminOrderAction({ order }: { order: RentalOrder }) {
  const transitions = ADMIN_TRANSITIONS[order.status];
  const [state, action, pending] = useActionState(
    updateOrderStatusAction.bind(null, order.id),
    INITIAL_ADMIN_MUTATION_STATE,
  );
  useAdminMutationToast(state);

  if (transitions.length === 0) {
    return (
      <p className="text-xs font-bold text-ink/55">
        {order.status === "RETURNED" ? "Fulfilled" : "No manual action"}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <div className="flex flex-wrap justify-end gap-2">
        <NativeSelect
          name="status"
          defaultValue={transitions[0]}
          disabled={pending}
          aria-label={`Next status for order ${order.id}`}
        >
          {transitions.map((status) => (
            <NativeSelectOption key={status} value={status}>
              {formatStatusLabel(status)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Button type="submit" variant="outline" size="compact" disabled={pending}>
          {pending ? "Updating…" : "Apply"}
        </Button>
      </div>
      <AdminActionMessage state={state} className="lg:justify-end" />
    </form>
  );
}
