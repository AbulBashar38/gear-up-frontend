import type { GearCatalogQuery } from "@/lib/types";

type SearchParamValue = string | string[] | undefined;

export type GearPageSearchParams = Record<string, SearchParamValue>;

export type CatalogFilterValues = {
  category: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
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

export function parseCatalogQuery(
  searchParams: GearPageSearchParams,
): ParsedCatalogQuery {
  const values: CatalogFilterValues = {
    category: cleanText(searchParams.category),
    brand: cleanText(searchParams.brand),
    minPrice: cleanText(searchParams.minPrice, 30),
    maxPrice: cleanText(searchParams.maxPrice, 30),
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

  return {
    values,
    page,
    validationErrors,
    query: {
      category: values.category || undefined,
      brand: values.brand || undefined,
      minPrice,
      maxPrice,
      page,
      limit: 12,
    },
  };
}

export function buildGearHref(values: CatalogFilterValues, page: number) {
  const params = new URLSearchParams();

  if (values.category) params.set("category", values.category);
  if (values.brand) params.set("brand", values.brand);
  if (values.minPrice) params.set("minPrice", values.minPrice);
  if (values.maxPrice) params.set("maxPrice", values.maxPrice);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/gear?${query}` : "/gear";
}
