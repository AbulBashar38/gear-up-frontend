import { listCategories } from "@/services/categories";
import { AdminCategoryManager } from "../../_components/admin-category-manager";
import { DashboardRegisterPage } from "../../_components/dashboard-register-page";
import { requireDashboardRole } from "../../_utils/dashboard-access";
import { getResultTotal } from "../../_utils/dashboard-results";

export default async function AdminCategoriesPage() {
  await requireDashboardRole("ADMIN", "/dashboard/categories");
  const result = await listCategories();

  return (
    <DashboardRegisterPage
      eyebrow="Admin register // taxonomy"
      title="Gear categories"
      description="Categories power public filtering and provider gear forms. Used categories cannot be deleted by the backend."
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
    >
      {result.ok && <AdminCategoryManager categories={result.data} />}
    </DashboardRegisterPage>
  );
}
