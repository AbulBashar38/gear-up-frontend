"use client";

import { ArrowUpRight, CalendarCheck2, RotateCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/components/providers/auth-session-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function RentalRequestCard({
  gearId,
  canRequest,
}: {
  gearId: string;
  canRequest: boolean;
}) {
  const session = useAuthSession();
  const router = useRouter();
  const orderHref = `/dashboard/orders/new?gearItemId=${encodeURIComponent(gearId)}`;
  const loginHref = `/login?returnTo=${encodeURIComponent(orderHref)}`;

  let sessionMessage = "Sign in with a customer account to request this item.";

  if (session.status === "authenticated" && session.user.role === "CUSTOMER") {
    sessionMessage = `Signed in as ${session.user.name}. Your account can place this request.`;
  } else if (session.status === "authenticated") {
    sessionMessage = `${session.user.role.toLowerCase()} accounts cannot rent gear. Use a customer account to place an order.`;
  } else if (session.status === "unavailable") {
    sessionMessage = "Your session could not be verified. Refresh the check before continuing.";
  }

  return (
    <Card className="surface-accent gear-tag gap-0 rounded-none bg-lime py-0 text-ink ring-0 shadow-none">
      <CardContent className="p-7 sm:p-9">
        <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em] text-ink/70">
          Rental request
        </p>
        <h2 className="mt-7 font-display text-5xl font-black uppercase leading-[0.86] tracking-[-0.04em]">
          Dates are confirmed by the provider.
        </h2>
        <p className="mt-5 text-sm leading-6 text-ink/70">
          A request does not reserve stock. The provider checks your dates and
          quantity before payment becomes available.
        </p>

        {!canRequest ? (
          <Button type="button" variant="primary" size="xl" className="mt-7 w-full" disabled>
            Requests are paused
          </Button>
        ) : session.status === "authenticated" && session.user.role === "CUSTOMER" ? (
          <Button asChild variant="primary" size="xl" className="mt-7 w-full">
            <Link href={orderHref}>
              Request this gear
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        ) : session.status === "anonymous" ? (
          <Button asChild variant="primary" size="xl" className="mt-7 w-full">
            <Link href={loginHref}>
              Sign in to request dates
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        ) : session.status === "unavailable" ? (
          <Button type="button" variant="primary" size="xl" className="mt-7 w-full" onClick={() => router.refresh()}>
            <RotateCw aria-hidden="true" />
            Retry session check
          </Button>
        ) : (
          <Button type="button" variant="primary" size="xl" className="mt-7 w-full" disabled>
            Customer account required
          </Button>
        )}

        <p aria-live="polite" className="mt-3 text-xs font-semibold leading-5 text-ink/65">
          {sessionMessage}
        </p>

        <div className="mt-7 space-y-4 border-t border-ink/20 pt-6">
          <p className="flex gap-3 text-xs font-bold leading-5 text-ink/70">
            <CalendarCheck2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-signal" />
            Select date-only rental dates; same-day rental counts as one day.
          </p>
          <p className="flex gap-3 text-xs font-bold leading-5 text-ink/70">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-signal" />
            GearUp calculates the final total and checks available stock.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
