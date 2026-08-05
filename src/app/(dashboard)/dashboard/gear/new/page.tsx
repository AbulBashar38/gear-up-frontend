import { listCategories } from "@/services/categories";
import { listUsers } from "@/services/users";
import { DashboardApiFeedback } from "../../../_components/dashboard-feedback";
import { AdminGearForm } from "../../../_components/admin-gear-form";
import { DashboardPageHeader } from "../../../_components/dashboard-page-header";
import { requireDashboardRole } from "../../../_utils/dashboard-access";
import { collectApiProblems } from "../../../_utils/dashboard-results";

export default async function NewAdminGearPage() {
  await requireDashboardRole("ADMIN", "/dashboard/gear/new");
  const [categories, providers] = await Promise.all([
    listCategories(),
    listUsers({ role: "PROVIDER", status: "ACTIVE", page: 1, limit: 100 }),
  ]);
  const problems = collectApiProblems(categories, providers);

  return (
    <div className="p-5 sm:p-8 lg:p-10 xl:p-14">
      <DashboardPageHeader
        eyebrow="Admin inventory // new listing"
        title="Add provider gear"
        description="Assign the listing to an active provider, choose its category, and publish real stock and pricing through the protected gear endpoint."
      />
      <div className="mt-8 max-w-5xl">
        {problems.length > 0 ? (
          <DashboardApiFeedback problems={problems} />
        ) : (
          categories.ok &&
          providers.ok && (
            <AdminGearForm
              categories={categories.data}
              providers={providers.data}
            />
          )
        )}
      </div>
    </div>
  );
}
