import { listCategories } from "@/services/categories";
import { listUsers } from "@/services/users";
import { DashboardApiFeedback } from "../../../_components/dashboard-feedback";
import { AdminGearForm } from "../../../_components/admin-gear-form";
import { DashboardPageHeader } from "../../../_components/dashboard-page-header";
import { requireDashboardRoles } from "../../../_utils/dashboard-access";
import { collectApiProblems } from "../../../_utils/dashboard-results";

export default async function NewGearPage() {
  const user = await requireDashboardRoles(
    ["ADMIN", "PROVIDER"],
    "/dashboard/gear/new",
  );
  const isAdmin = user.role === "ADMIN";

  // Only admins choose an owning provider; providers create gear for themselves.
  const [categories, providers] = await Promise.all([
    listCategories(),
    isAdmin
      ? listUsers({ role: "PROVIDER", status: "ACTIVE", page: 1, limit: 100 })
      : Promise.resolve(null),
  ]);
  const problems = collectApiProblems(
    categories,
    ...(providers ? [providers] : []),
  );

  return (
    <div className="p-5 sm:p-8 lg:p-10 xl:p-14">
      <DashboardPageHeader
        eyebrow={
          isAdmin
            ? "Admin inventory // new listing"
            : "Provider inventory // new listing"
        }
        title={isAdmin ? "Add provider gear" : "Add gear"}
        description={
          isAdmin
            ? "Assign the listing to an active provider, choose its category, and publish real stock and pricing through the protected gear endpoint."
            : "Choose a category and publish real stock and pricing. The listing is owned by your provider account through the protected gear endpoint."
        }
      />
      <div className="mt-8 max-w-5xl">
        {problems.length > 0 ? (
          <DashboardApiFeedback problems={problems} />
        ) : (
          categories.ok &&
          (!isAdmin || (providers?.ok ?? false)) && (
            <AdminGearForm
              categories={categories.data}
              providers={providers?.ok ? providers.data : []}
              canAssignProvider={isAdmin}
            />
          )
        )}
      </div>
    </div>
  );
}
