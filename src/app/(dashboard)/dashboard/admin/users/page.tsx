import Link from "next/link";
import { ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardRegisterPage } from "../../../_components/dashboard-register-page";
import { UserList } from "../../../_components/dashboard-record-lists";
import { requireDashboardRole } from "../../../_utils/dashboard-access";
import {
  type DashboardListPageProps,
  parseDashboardPage,
} from "../../../_utils/dashboard-query";
import { getResultTotal } from "../../../_utils/dashboard-results";
import { listUsers } from "@/services/users";

export default async function AdminUsersPage({
  searchParams,
}: DashboardListPageProps) {
  const { page: rawPage } = await searchParams;
  const page = parseDashboardPage(rawPage);
  const [admin, result] = await Promise.all([
    requireDashboardRole("ADMIN", "/dashboard/admin/users"),
    listUsers({ page, limit: 8 }),
  ]);

  return (
    <DashboardRegisterPage
      eyebrow="Admin register // identities"
      title="Platform users"
      description="Inspect customer, provider, and admin accounts with backend-reported role, status, and resource counts."
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/admin/users"
      actions={
        <Button asChild size="lg">
          <Link href="/dashboard/admin/admins/new">
            <ShieldPlus aria-hidden="true" />
            Create admin
          </Link>
        </Button>
      }
    >
      {result.ok && (
        <UserList users={result.data} currentAdminId={admin.id} />
      )}
    </DashboardRegisterPage>
  );
}
