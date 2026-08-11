export type DashboardSearchParamValue = string | string[] | undefined;

export type DashboardListPageProps = {
  searchParams: Promise<Record<string, DashboardSearchParamValue>>;
};

export function firstDashboardParam(value: DashboardSearchParamValue) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseDashboardText(
  value: DashboardSearchParamValue,
  maxLength = 100,
) {
  return firstDashboardParam(value).trim().slice(0, maxLength);
}

export function parseDashboardChoice<T extends string>(
  value: DashboardSearchParamValue,
  choices: readonly T[],
): T | "" {
  const candidate = firstDashboardParam(value);
  return choices.includes(candidate as T) ? (candidate as T) : "";
}

export function parseDashboardPage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}
