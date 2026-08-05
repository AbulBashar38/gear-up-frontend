import { notFound } from "next/navigation";
import { listCategories } from "@/services/categories";
import { getGearItem } from "@/services/gear";
import { DashboardApiFeedback } from "../../../../_components/dashboard-feedback";
import { AdminGearForm } from "../../../../_components/admin-gear-form";
import { DashboardPageHeader } from "../../../../_components/dashboard-page-header";
import { requireDashboardRole } from "../../../../_utils/dashboard-access";
import { collectApiProblems } from "../../../../_utils/dashboard-results";

export default async function EditAdminGearPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireDashboardRole("ADMIN", `/dashboard/gear/${id}/edit`);
  const [gear, categories] = await Promise.all([
    getGearItem(id),
    listCategories(),
  ]);

  if (!gear.ok && gear.error.status === 404) notFound();
  const problems = collectApiProblems(gear, categories);

  return (
    <div className="p-5 sm:p-8 lg:p-10 xl:p-14">
      <DashboardPageHeader
        eyebrow="Admin inventory // edit listing"
        title={gear.ok ? `Edit ${gear.data.name}` : "Edit gear listing"}
        description="Update listing details while preserving the backend-owned provider relationship and ownership checks."
      />
      <div className="mt-8 max-w-5xl">
        {problems.length > 0 ? (
          <DashboardApiFeedback problems={problems} />
        ) : (
          gear.ok &&
          categories.ok && (
            <AdminGearForm gear={gear.data} categories={categories.data} />
          )
        )}
      </div>
    </div>
  );
}
