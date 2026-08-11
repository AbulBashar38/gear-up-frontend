import Link from "next/link";
import { ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listUsers } from "@/services/users";
import { DashboardRegisterPage } from "../../_components/dashboard-register-page";
import { UserList } from "../../_components/dashboard-record-lists";
import {
  AdminUserFilters,
  type AdminUserFilterValues,
} from "../../_components/admin-user-filters";
import { requireDashboardRole } from "../../_utils/dashboard-access";
import { parseDashboardPage } from "../../_utils/dashboard-query";
import { getResultTotal } from "../../_utils/dashboard-results";
import type { Role, UserStatus } from "@/lib/types";

type SearchParamValue = string | string[] | undefined;
type AdminUsersPageProps = {
  searchParams: Promise<{
    page?: SearchParamValue;
    search?: SearchParamValue;
    role?: SearchParamValue;
    status?: SearchParamValue;
  }>;
};

const first = (value: SearchParamValue) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

function parseRole(value: SearchParamValue): Role | "" {
  const role = first(value).toUpperCase();
  return role === "CUSTOMER" || role === "PROVIDER" || role === "ADMIN"
    ? role
    : "";
}

function parseStatus(value: SearchParamValue): UserStatus | "" {
  const status = first(value).toUpperCase();
  return status === "ACTIVE" || status === "INACTIVE" || status === "SUSPENDED"
    ? status
    : "";
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const params = await searchParams;
  const { page: rawPage } = params;
  const page = parseDashboardPage(rawPage);
  const values: AdminUserFilterValues = {
    search: first(params.search).trim().slice(0, 255),
    role: parseRole(params.role),
    status: parseStatus(params.status),
  };
  const [admin, result] = await Promise.all([
    requireDashboardRole("ADMIN", "/dashboard/users"),
    listUsers({
      search: values.search || undefined,
      role: values.role || undefined,
      status: values.status || undefined,
      page,
      limit: 8,
    }),
  ]);

  return (
    <DashboardRegisterPage
      eyebrow="Admin register // identities"
      title="Platform users"
      description="Inspect customer, provider, and admin accounts with backend-reported role, status, and resource counts."
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/users"
      paginationQuery={{
        search: values.search || undefined,
        role: values.role || undefined,
        status: values.status || undefined,
      }}
      filters={<AdminUserFilters values={values} />}
      actions={
        <Button asChild size="lg">
          <Link href="/dashboard/admins/new">
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
