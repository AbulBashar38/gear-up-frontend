import { AdminCreateAdminForm } from "../../../../_components/admin-create-admin-form";
import { DashboardPageHeader } from "../../../../_components/dashboard-page-header";

export default function NewAdminPage() {
  return (
    <div className="p-5 sm:p-8 lg:p-10 xl:p-14">
      <DashboardPageHeader
        eyebrow="Admin control // protected creation"
        title="Create administrator"
        description="Create a dedicated platform administrator. This protected action is separate from public registration, which never offers the admin role."
      />
      <div className="mt-8 max-w-3xl">
        <AdminCreateAdminForm />
      </div>
    </div>
  );
}
