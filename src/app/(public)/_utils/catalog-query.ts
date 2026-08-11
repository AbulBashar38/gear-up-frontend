import type { GearCatalogQuery } from "@/lib/types";

type SearchParamValue = string | string[] | undefined;

export type GearPageSearchParams = Record<string, SearchParamValue>;

export type CatalogFilterValues = {
  search: string;
  category: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  startDate: string;
  endDate: string;
};

export type ParsedCatalogQuery = {
  values: CatalogFilterValues;
  page: number;
  query: GearCatalogQuery;
  validationErrors: string[];
};

const firstValue = (value: SearchParamValue) =>
  Array.isArray(value) ? value[0] : value;

const cleanText = (value: SearchParamValue, maxLength = 255) =>
  (firstValue(value) ?? "").trim().slice(0, maxLength);

function parsePrice(value: string, label: string, errors: string[]) {
  if (!value) return undefined;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    errors.push(`${label} must be a non-negative number.`);
    return undefined;
  }

  return parsed;
}

function parsePage(value: SearchParamValue) {
  const parsed = Number(firstValue(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function isRealDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function parseCatalogQuery(
  searchParams: GearPageSearchParams,
): ParsedCatalogQuery {
  const values: CatalogFilterValues = {
    search: cleanText(searchParams.search),
    category: cleanText(searchParams.category),
    brand: cleanText(searchParams.brand),
    minPrice: cleanText(searchParams.minPrice, 30),
    maxPrice: cleanText(searchParams.maxPrice, 30),
    startDate: cleanText(searchParams.startDate, 10),
    endDate: cleanText(searchParams.endDate, 10),
  };
  const page = parsePage(searchParams.page);
  const validationErrors: string[] = [];
  const minPrice = parsePrice(
    values.minPrice,
    "Minimum daily price",
    validationErrors,
  );
  const maxPrice = parsePrice(
    values.maxPrice,
    "Maximum daily price",
    validationErrors,
  );

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    minPrice > maxPrice
  ) {
    validationErrors.push(
      "Minimum daily price cannot be greater than maximum daily price.",
    );
  }

  if (Boolean(values.startDate) !== Boolean(values.endDate)) {
    validationErrors.push("Choose both a start date and an end date.");
  } else if (values.startDate && values.endDate) {
    if (!isRealDateOnly(values.startDate) || !isRealDateOnly(values.endDate)) {
      validationErrors.push("Availability dates must be valid calendar dates.");
    } else if (values.endDate < values.startDate) {
      validationErrors.push("End date must be on or after the start date.");
    }
  }

  return {
    values,
    page,
    validationErrors,
    query: {
      search: values.search || undefined,
      category: values.category || undefined,
      brand: values.brand || undefined,
      minPrice,
      maxPrice,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
      page,
      limit: 12,
    },
  };
}

export function buildGearHref(values: CatalogFilterValues, page: number) {
  const params = new URLSearchParams();

  if (values.search) params.set("search", values.search);
  if (values.category) params.set("category", values.category);
  if (values.brand) params.set("brand", values.brand);
  if (values.minPrice) params.set("minPrice", values.minPrice);
  if (values.maxPrice) params.set("maxPrice", values.maxPrice);
  if (values.startDate) params.set("startDate", values.startDate);
  if (values.endDate) params.set("endDate", values.endDate);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/gear?${query}` : "/gear";
}
