import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Boxes, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getGearItem } from "@/services/gear";
import { CustomerOrderForm } from "../../../_components/customer-order-form";
import { DashboardApiFeedback } from "../../../_components/dashboard-feedback";
import { DashboardPageHeader } from "../../../_components/dashboard-page-header";
import { requireDashboardRole } from "../../../_utils/dashboard-access";
import { formatDashboardMoney } from "../../../_utils/dashboard-format";
import { rentalOrderGearQuerySchema } from "../../../validation/order.schema";

type NewOrderPageProps = {
  searchParams: Promise<{ gearItemId?: string | string[] }>;
};

export default async function NewOrderPage({ searchParams }: NewOrderPageProps) {
  await requireDashboardRole("CUSTOMER", "/dashboard/orders/new");
  const rawGearId = (await searchParams).gearItemId;
  const parsedGearId = rentalOrderGearQuerySchema.safeParse(
    Array.isArray(rawGearId) ? rawGearId[0] : rawGearId,
  );

  if (!parsedGearId.success) {
    notFound();
  }

  const gearResult = await getGearItem(parsedGearId.data);

  if (!gearResult.ok && gearResult.error.status === 404) {
    notFound();
  }

  const gear = gearResult.ok ? gearResult.data : null;
  const canRequest = gear?.isAvailable && gear.stock > 0;

  return (
    <div className="p-5 sm:p-8 lg:p-10 xl:p-14">
      <DashboardPageHeader
        eyebrow="Customer rental // new request"
        title="Request this gear"
        description="Send the provider your dates and quantity. The backend calculates the inclusive rental duration and authoritative total."
        actions={
          <Button asChild variant="outline" size="lg">
            <Link href={gear ? `/gear/${gear.id}` : "/gear"}>
              <ArrowLeft aria-hidden="true" />
              Back to listing
            </Link>
          </Button>
        }
      />

      <div className="mt-8 max-w-5xl">
        {!gearResult.ok ? (
          <DashboardApiFeedback problems={[gearResult.error]} />
        ) : gear ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            {canRequest ? (
              <CustomerOrderForm
                gear={gear}
                minimumDate={new Date().toISOString().slice(0, 10)}
              />
            ) : (
              <Card className="gap-0 rounded-none border border-dashed border-ink/25 bg-card py-0 ring-0 shadow-none">
                <CardContent className="p-8 text-center">
                  <Boxes aria-hidden="true" className="mx-auto size-9 text-signal" />
                  <h2 className="mt-4 font-display text-4xl font-black uppercase">Requests are paused</h2>
                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-ink/65">
                    This item is unavailable or has no listed stock. Return to the catalog for another option.
                  </p>
                  <Button asChild className="mt-6"><Link href="/gear">Browse available gear</Link></Button>
                </CardContent>
              </Card>
            )}

            <Card className="surface-inverse gap-0 rounded-none bg-ink py-0 text-paper ring-0 shadow-none">
              <CardContent className="p-6">
                <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-orange">Selected item</p>
                <h2 className="mt-5 font-display text-4xl font-black uppercase leading-[0.9]">{gear.name}</h2>
                <dl className="mt-7 space-y-4 border-t border-paper/15 pt-5 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-paper/55">Daily price</dt><dd className="font-extrabold text-lime">{formatDashboardMoney(gear.pricePerDay)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-paper/55">Listed stock</dt><dd className="font-extrabold">{gear.stock}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-paper/55">Provider</dt><dd className="flex items-center gap-1.5 font-extrabold"><UserRound aria-hidden="true" className="size-4" />{gear.provider.name}</dd></div>
                </dl>
                <p className="mt-6 border-t border-paper/15 pt-5 text-xs leading-5 text-paper/55">
                  Your final total comes from the API response, not a client-side calculation.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
