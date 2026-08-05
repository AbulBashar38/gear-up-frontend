import { requireDashboardRole } from "../../_utils/dashboard-access";

export default async function ProviderDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireDashboardRole("PROVIDER", "/dashboard/provider");
  return children;
}
