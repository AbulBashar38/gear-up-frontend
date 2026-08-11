import { listCategories } from "@/services/categories";
import { AdminCategoryManager } from "../../_components/admin-category-manager";
import { DashboardRegisterPage } from "../../_components/dashboard-register-page";
import { CategoryRegisterFilters } from "../../_components/dashboard-register-filters";
import { requireDashboardRole } from "../../_utils/dashboard-access";
import {
  type DashboardListPageProps,
  parseDashboardText,
} from "../../_utils/dashboard-query";
import { getResultTotal } from "../../_utils/dashboard-results";

export default async function AdminCategoriesPage({
  searchParams,
}: DashboardListPageProps) {
  const params = await searchParams;
  const search = parseDashboardText(params.search);
  await requireDashboardRole("ADMIN", "/dashboard/categories");
  const result = await listCategories({ search: search || undefined });

  return (
    <DashboardRegisterPage
      eyebrow="Admin register // taxonomy"
      title="Gear categories"
      description="Categories power public filtering and provider gear forms. Used categories cannot be deleted by the backend."
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      filters={<CategoryRegisterFilters search={search} />}
    >
      {result.ok && (
        <AdminCategoryManager
          categories={result.data}
          isFiltered={Boolean(search)}
        />
      )}
    </DashboardRegisterPage>
  );
}
