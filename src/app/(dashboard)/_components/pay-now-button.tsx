"use client";

import { useActionState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import type { DecimalValue } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { startCheckoutAction } from "../_actions/checkout-actions";
import {
  AdminActionMessage,
  INITIAL_ADMIN_MUTATION_STATE,
} from "./admin-mutation-feedback";
import { formatDashboardMoney } from "../_utils/dashboard-format";

export function PayNowButton({
  orderId,
  totalPrice,
}: {
  orderId: string;
  totalPrice: DecimalValue;
}) {
  const [state, action, pending] = useActionState(
    startCheckoutAction.bind(null, orderId),
    INITIAL_ADMIN_MUTATION_STATE,
  );

  useEffect(() => {
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={action} className="space-y-2">
      <Button type="submit" size="lg" disabled={pending}>
        <CreditCard aria-hidden="true" />
        {pending
          ? "Redirecting to Stripe…"
          : `Pay ${formatDashboardMoney(totalPrice)}`}
      </Button>
      <AdminActionMessage state={state} />
    </form>
  );
}
