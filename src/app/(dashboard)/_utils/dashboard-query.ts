export type DashboardListPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

export function parseDashboardPage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}
