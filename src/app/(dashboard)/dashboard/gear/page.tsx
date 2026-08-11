import Link from "next/link";
import { PackagePlus } from "lucide-react";
import type { Role } from "@/lib/types";
import { listGear } from "@/services/gear";
import { listCategories } from "@/services/categories";
import { Button } from "@/components/ui/button";
import { DashboardRegisterPage } from "../../_components/dashboard-register-page";
import { GearList } from "../../_components/dashboard-record-lists";
import {
  GearRegisterFilters,
  type GearFilterValues,
} from "../../_components/dashboard-register-filters";
import { DashboardApiFeedback } from "../../_components/dashboard-feedback";
import { requireDashboardRoles } from "../../_utils/dashboard-access";
import {
  type DashboardListPageProps,
  parseDashboardChoice,
  parseDashboardPage,
  parseDashboardText,
} from "../../_utils/dashboard-query";
import { getResultTotal } from "../../_utils/dashboard-results";

// Customers are not served here: gear discovery lives in the public `/gear`
// catalog, so this register is provider inventory and admin oversight only.
const GEAR_COPY: Record<
  Exclude<Role, "CUSTOMER">,
  { eyebrow: string; title: string; description: string }
> = {
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
  const params = await searchParams;
  const page = parseDashboardPage(params.page);
  const values: GearFilterValues = {
    search: parseDashboardText(params.search, 255),
    category: parseDashboardText(params.category, 255),
    availability: parseDashboardChoice(params.availability, ["true", "false"]),
    stock: parseDashboardChoice(params.stock, ["true", "false"]),
  };
  const [user, categoriesResult] = await Promise.all([
    requireDashboardRoles(["PROVIDER", "ADMIN"], "/dashboard/gear"),
    listCategories(),
  ]);
  const result = await listGear({
    providerId: user.role === "PROVIDER" ? user.id : undefined,
    search: values.search || undefined,
    category: values.category || undefined,
    isAvailable: values.availability
      ? values.availability === "true"
      : undefined,
    inStock: values.stock ? values.stock === "true" : undefined,
    page,
    limit: 8,
  });
  const copy =
    user.role === "PROVIDER" ? GEAR_COPY.PROVIDER : GEAR_COPY.ADMIN;

  return (
    <DashboardRegisterPage
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/gear"
      paginationQuery={{
        search: values.search || undefined,
        category: values.category || undefined,
        availability: values.availability || undefined,
        stock: values.stock || undefined,
      }}
      filters={
        <>
          <GearRegisterFilters
            values={values}
            categories={categoriesResult.ok ? categoriesResult.data : []}
          />
          {!categoriesResult.ok && (
            <div className="mt-4">
              <DashboardApiFeedback problems={[categoriesResult.error]} />
            </div>
          )}
        </>
      }
      actions={
        <>
          <Button asChild size="lg">
            <Link href="/dashboard/gear/new">
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
