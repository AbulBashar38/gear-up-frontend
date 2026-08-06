import Link from "next/link";
import { PackagePlus } from "lucide-react";
import type { Role } from "@/lib/types";
import { listGear } from "@/services/gear";
import { Button } from "@/components/ui/button";
import { DashboardRegisterPage } from "../../_components/dashboard-register-page";
import { GearList } from "../../_components/dashboard-record-lists";
import { requireDashboardUser } from "../../_utils/dashboard-access";
import {
  type DashboardListPageProps,
  parseDashboardPage,
} from "../../_utils/dashboard-query";
import { getResultTotal } from "../../_utils/dashboard-results";

const GEAR_COPY: Record<Role, { eyebrow: string; title: string; description: string }> = {
  CUSTOMER: {
    eyebrow: "Customer register // discovery",
    title: "Available gear",
    description:
      "Browse the platform inventory before opening the public catalog to filter and request rental gear.",
  },
  PROVIDER: {
    eyebrow: "Provider register // inventory",
    title: "Owned gear",
    description:
      "This register is scoped with the canonical provider ID while backend ownership checks remain authoritative.",
  },
  ADMIN: {
    eyebrow: "Admin register // inventory",
    title: "All platform gear",
    description:
      "Review every provider listing, stock count, daily price, and public availability flag from the canonical gear endpoint.",
  },
};

export default async function DashboardGearPage({
  searchParams,
}: DashboardListPageProps) {
  const { page: rawPage } = await searchParams;
  const page = parseDashboardPage(rawPage);
  const user = await requireDashboardUser("/dashboard/gear");
  const result = await listGear({
    providerId: user.role === "PROVIDER" ? user.id : undefined,
    page,
    limit: 8,
  });
  const copy = GEAR_COPY[user.role];
  const canManageGear = user.role === "ADMIN" || user.role === "PROVIDER";

  return (
    <DashboardRegisterPage
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/gear"
      actions={
        <>
          {canManageGear && (
            <Button asChild size="lg">
              <Link href="/dashboard/gear/new">
                <PackagePlus aria-hidden="true" />
                Add gear
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="lg">
            <Link href="/gear">View public catalog</Link>
          </Button>
        </>
      }
    >
      {result.ok && (
        <GearList gear={result.data} adminActions={canManageGear} />
      )}
    </DashboardRegisterPage>
  );
}
