import { requireDashboardRole } from "../../_utils/dashboard-access";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireDashboardRole("ADMIN", "/dashboard/admin");
  return children;
}
