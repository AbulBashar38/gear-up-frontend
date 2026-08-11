import type { DecimalValue } from "@/lib/types";

const configuredCurrency = process.env.GEARUP_CURRENCY?.trim().toUpperCase();
const currency =
  configuredCurrency && /^[A-Z]{3}$/.test(configuredCurrency)
    ? configuredCurrency
    : "USD";

export function formatDashboardMoney(value: DecimalValue) {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return "Price unavailable";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDashboardDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Payments move through Stripe and its webhook, so their records are read at a
 * finer resolution than the date-only rental fields.
 */
export function formatDashboardDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

export function formatDashboardRating(value: DecimalValue) {
  const rating = typeof value === "number" ? value : Number(value);
  return Number.isFinite(rating) ? rating.toFixed(1) : "—";
}

export function formatStatusLabel(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}
