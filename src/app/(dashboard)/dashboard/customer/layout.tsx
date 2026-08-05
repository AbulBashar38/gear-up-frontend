import { requireDashboardRole } from "../../_utils/dashboard-access";

export default async function CustomerDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireDashboardRole("CUSTOMER", "/dashboard/customer");
  return children;
}
