import { listCategories } from "@/services/categories";
import { AdminCategoryManager } from "../../_components/admin-category-manager";
import { CategoryList } from "../../_components/dashboard-record-lists";
import { DashboardEmptyState } from "../../_components/dashboard-feedback";
import { DashboardRegisterPage } from "../../_components/dashboard-register-page";
import { CategoryRegisterFilters } from "../../_components/dashboard-register-filters";
import { requireDashboardRoles } from "../../_utils/dashboard-access";
import {
  type DashboardListPageProps,
  parseDashboardText,
} from "../../_utils/dashboard-query";
import { getResultTotal } from "../../_utils/dashboard-results";

const CATEGORY_COPY = {
  ADMIN: {
    eyebrow: "Admin register // taxonomy",
    title: "Gear categories",
    description:
      "Categories power public filtering and provider gear forms. Used categories cannot be deleted by the backend.",
  },
  PROVIDER: {
    eyebrow: "Provider register // taxonomy",
    title: "Gear categories",
    description:
      "Reference list of the categories you can assign when publishing gear. Only an admin can create, rename, or delete a category.",
  },
} as const;

export default async function DashboardCategoriesPage({
  searchParams,
}: DashboardListPageProps) {
  const params = await searchParams;
  const search = parseDashboardText(params.search);
  // Providers read the taxonomy their gear forms depend on; the category
  // mutation actions and the backend both stay admin-only.
  const user = await requireDashboardRoles(
    ["ADMIN", "PROVIDER"],
    "/dashboard/categories",
  );
  const result = await listCategories({ search: search || undefined });
  const copy =
    user.role === "ADMIN" ? CATEGORY_COPY.ADMIN : CATEGORY_COPY.PROVIDER;

  return (
    <DashboardRegisterPage
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      filters={<CategoryRegisterFilters search={search} />}
    >
      {result.ok &&
        (user.role === "ADMIN" ? (
          <AdminCategoryManager
            categories={result.data}
            isFiltered={Boolean(search)}
          />
        ) : result.data.length === 0 ? (
          <DashboardEmptyState
            title={search ? "No matching categories" : "No categories"}
            description={
              search
                ? "Try another category name or clear the current search."
                : "An admin has not published any categories yet, so gear cannot be listed."
            }
          />
        ) : (
          <CategoryList categories={result.data} />
        ))}
    </DashboardRegisterPage>
  );
}
