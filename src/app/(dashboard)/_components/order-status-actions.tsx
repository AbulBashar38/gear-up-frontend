"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { RentalOrder, RentalOrderStatus, Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { changeOrderStatusAction } from "../_actions/order-actions";
import {
  AdminActionMessage,
  INITIAL_ADMIN_MUTATION_STATE,
} from "./admin-mutation-feedback";

type TransitionTarget = Exclude<RentalOrderStatus, "PLACED" | "PAID">;

/** Which transitions each role may request from a given status (UI only; the
 * backend re-checks ownership and lifecycle authoritatively). */
const ROLE_TRANSITIONS: Record<
  Role,
  Partial<Record<RentalOrderStatus, TransitionTarget[]>>
> = {
  CUSTOMER: {
    PLACED: ["CANCELLED"],
    CONFIRMED: ["CANCELLED"],
  },
  PROVIDER: {
    PLACED: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["CANCELLED"],
    PAID: ["PICKED_UP"],
    PICKED_UP: ["RETURNED"],
  },
  ADMIN: {
    PLACED: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["CANCELLED"],
    PAID: ["PICKED_UP"],
    PICKED_UP: ["RETURNED"],
  },
};

const ACTION_META: Record<
  TransitionTarget,
  { label: string; pending: string; icon: typeof CheckCircle2; destructive?: boolean }
> = {
  CONFIRMED: { label: "Confirm order", pending: "Confirming…", icon: CheckCircle2 },
  PICKED_UP: { label: "Mark picked up", pending: "Updating…", icon: Truck },
  RETURNED: { label: "Mark returned", pending: "Updating…", icon: RotateCcw },
  CANCELLED: {
    label: "Cancel rental",
    pending: "Cancelling…",
    icon: XCircle,
    destructive: true,
  },
};

export function OrderStatusActions({
  order,
  role,
}: {
  order: RentalOrder;
  role: Role;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    changeOrderStatusAction.bind(null, order.id),
    INITIAL_ADMIN_MUTATION_STATE,
  );
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  useEffect(() => {
    if (state.status === "success" && state.message) {
      toast.success(state.message);
      router.refresh();
    }
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [router, state]);

  const targets = ROLE_TRANSITIONS[role][order.status] ?? [];

  if (targets.length === 0) return null;

  const advanceTargets = targets.filter((target) => target !== "CANCELLED");
  const canCancel = targets.includes("CANCELLED");

  return (
    <div className="space-y-3">
      <form action={action} className="flex flex-wrap gap-2">
        {advanceTargets.map((target) => {
          const meta = ACTION_META[target];
          const Icon = meta.icon;
          return (
            <Button
              key={target}
              type="submit"
              name="status"
              value={target}
              variant="primary"
              disabled={pending}
              onClick={() => setConfirmingCancel(false)}
            >
              <Icon aria-hidden="true" />
              {pending ? meta.pending : meta.label}
            </Button>
          );
        })}

        {canCancel &&
          (confirmingCancel ? (
            <div className="flex flex-wrap items-center gap-2 border border-signal/40 bg-signal/5 px-3 py-2">
              <span className="text-xs font-bold text-signal">
                Cancel this rental?
              </span>
              <Button
                type="submit"
                name="status"
                value="CANCELLED"
                variant="destructive"
                size="compact"
                disabled={pending}
              >
                <XCircle aria-hidden="true" />
                {pending ? ACTION_META.CANCELLED.pending : "Yes, cancel"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="compact"
                disabled={pending}
                onClick={() => setConfirmingCancel(false)}
              >
                Keep order
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => setConfirmingCancel(true)}
            >
              <XCircle aria-hidden="true" />
              {ACTION_META.CANCELLED.label}
            </Button>
          ))}
      </form>

      <AdminActionMessage state={state} />

      {role === "CUSTOMER" && order.status === "CONFIRMED" && (
        <p className="text-xs leading-5 text-ink/60">
          Cancelling is permanent. Leaving payment does not cancel a confirmed
          order on its own.
        </p>
      )}
    </div>
  );
}
