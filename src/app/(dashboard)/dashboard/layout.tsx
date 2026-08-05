import type { Metadata } from "next";
import { DashboardShell } from "../_components/dashboard-shell";
import { requireDashboardUser } from "../_utils/dashboard-access";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Role-based GearUp rental operations dashboard.",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireDashboardUser();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
