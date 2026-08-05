import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardRegisterPage } from "../../../_components/dashboard-register-page";
import { GearList } from "../../../_components/dashboard-record-lists";
import { requireDashboardRole } from "../../../_utils/dashboard-access";
import {
  type DashboardListPageProps,
  parseDashboardPage,
} from "../../../_utils/dashboard-query";
import { getResultTotal } from "../../../_utils/dashboard-results";
import { listGear } from "@/services/gear";

export default async function ProviderGearPage({
  searchParams,
}: DashboardListPageProps) {
  const user = await requireDashboardRole("PROVIDER", "/dashboard/provider/gear");
  const { page: rawPage } = await searchParams;
  const page = parseDashboardPage(rawPage);
  const result = await listGear({ providerId: user.id, page, limit: 8 });

  return (
    <DashboardRegisterPage
      eyebrow="Provider register // inventory"
      title="Owned gear"
      description="This register uses the public provider filter while backend ownership checks remain authoritative for future create, edit, and delete actions."
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/provider/gear"
      actions={
        <Button asChild variant="outline" size="lg">
          <Link href="/gear">View public catalog</Link>
        </Button>
      }
    >
      {result.ok && <GearList gear={result.data} />}
    </DashboardRegisterPage>
  );
}
