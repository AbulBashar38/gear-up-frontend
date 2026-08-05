import { redirect } from "next/navigation";
import { ROLE_DASHBOARD_PATH } from "../_config/dashboard-navigation";
import { requireDashboardUser } from "../_utils/dashboard-access";

export default async function DashboardIndexPage() {
  const user = await requireDashboardUser();
  redirect(ROLE_DASHBOARD_PATH[user.role]);
}
