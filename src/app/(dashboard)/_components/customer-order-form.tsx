"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarDays, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import type { GearDetail, OrderMutationState } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRentalOrderAction } from "../_actions/order-actions";

const INITIAL_STATE: OrderMutationState = {
  status: "idle",
  message: "",
};

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null;

  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-signal">
      <AlertCircle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
      {messages[0]}
    </p>
  );
}

export function CustomerOrderForm({
  gear,
  minimumDate,
}: {
  gear: GearDetail;
  minimumDate: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    createRentalOrderAction.bind(null, gear.id),
    INITIAL_STATE,
  );
  const fields = state.fieldErrors ?? {};
  const values = state.values ?? {};

  const [startDate, setStartDate] = useState(values.startDate ?? "");
  const [endDate, setEndDate] = useState(values.endDate ?? "");

  useEffect(() => {
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }

    if (state.status === "success") {
      toast.success(state.message || "Rental request placed.", {
        description: state.data
          ? `${state.data.rentalDays} rental day${state.data.rentalDays === 1 ? "" : "s"} · authoritative total saved to your order`
          : undefined,
      });
      router.push("/dashboard/orders");
      router.refresh();
    }
  }, [router, state]);

  return (
    <form action={action} noValidate className="border border-ink/15 bg-card p-6 sm:p-8">
      <Alert className="rounded-none border-ink/15 bg-mist/55 p-4">
        <CalendarDays aria-hidden="true" />
        <AlertTitle>Request first, reserve after confirmation</AlertTitle>
        <AlertDescription>
          PLACED requests do not reserve stock. The provider checks these dates
          and quantity before confirming the rental.
        </AlertDescription>
      </Alert>

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="rental-start-date" className="font-bold">
            Start date
          </Label>
          <div className="mt-2">
            <DatePickerField
              id="rental-start-date"
              name="startDate"
              value={startDate}
              onValueChange={(next) => {
                setStartDate(next);
                if (endDate && next && endDate < next) setEndDate("");
              }}
              min={minimumDate}
              disabled={pending}
              placeholder="Pick a start date"
              aria-invalid={Boolean(fields.startDate)}
              aria-describedby={fields.startDate ? "rental-start-date-error" : undefined}
            />
          </div>
          <FieldError id="rental-start-date-error" messages={fields.startDate} />
        </div>

        <div>
          <Label htmlFor="rental-end-date" className="font-bold">
            End date
          </Label>
          <div className="mt-2">
            <DatePickerField
              id="rental-end-date"
              name="endDate"
              value={endDate}
              onValueChange={setEndDate}
              min={startDate || minimumDate}
              disabled={pending}
              placeholder="Pick an end date"
              aria-invalid={Boolean(fields.endDate)}
              aria-describedby={fields.endDate ? "rental-end-date-error" : undefined}
            />
          </div>
          <FieldError id="rental-end-date-error" messages={fields.endDate} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="rental-quantity" className="font-bold">
            Quantity
          </Label>
          <Input
            id="rental-quantity"
            name="quantity"
            type="number"
            inputMode="numeric"
            min={1}
            max={gear.stock}
            step={1}
            required
            disabled={pending}
            defaultValue={values.quantity ?? "1"}
            aria-invalid={Boolean(fields.quantity)}
            aria-describedby={fields.quantity ? "rental-quantity-error" : "rental-quantity-hint"}
            className="mt-2 h-12 rounded-none"
          />
          <p id="rental-quantity-hint" className="mt-1.5 text-xs text-ink/55">
            Current listed stock: {gear.stock}. Date-aware stock is checked when
            the provider confirms.
          </p>
          <FieldError id="rental-quantity-error" messages={fields.quantity} />
        </div>
      </div>

      {state.status === "error" && state.message && (
        <p aria-live="polite" className="mt-5 flex items-start gap-2 text-sm font-semibold text-signal">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      )}

      <div className="mt-7 flex flex-col gap-3 border-t border-ink/12 pt-6 sm:flex-row">
        <Button type="submit" size="lg" disabled={pending || !gear.isAvailable || gear.stock < 1}>
          <PackageCheck aria-hidden="true" />
          {pending ? "Placing request…" : "Place rental request"}
        </Button>
        <Button type="button" variant="outline" size="lg" disabled={pending} onClick={() => router.back()}>
          Back to listing
        </Button>
      </div>
    </form>
  );
}
