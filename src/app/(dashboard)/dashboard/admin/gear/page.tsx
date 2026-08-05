import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardRegisterPage } from "../../../_components/dashboard-register-page";
import { GearList } from "../../../_components/dashboard-record-lists";
import {
  type DashboardListPageProps,
  parseDashboardPage,
} from "../../../_utils/dashboard-query";
import { getResultTotal } from "../../../_utils/dashboard-results";
import { listGear } from "@/services/gear";

export default async function AdminGearPage({
  searchParams,
}: DashboardListPageProps) {
  const { page: rawPage } = await searchParams;
  const page = parseDashboardPage(rawPage);
  const result = await listGear({ page, limit: 8 });

  return (
    <DashboardRegisterPage
      eyebrow="Admin register // inventory"
      title="All platform gear"
      description="Review every provider listing, stock count, daily price, and public availability flag from the canonical gear endpoint."
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/admin/gear"
      actions={
        <>
          <Button asChild size="lg">
            <Link href="/dashboard/admin/gear/new">
              <PackagePlus aria-hidden="true" />
              Add gear
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/gear">View public catalog</Link>
          </Button>
        </>
      }
    >
      {result.ok && <GearList gear={result.data} adminActions />}
    </DashboardRegisterPage>
  );
}
