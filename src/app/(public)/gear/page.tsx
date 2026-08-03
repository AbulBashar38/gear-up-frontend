import type { Metadata } from "next";
import { ArrowLeft, Boxes, SlidersHorizontal, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CatalogFilters, type CatalogFilterValues } from "@/components/gear/catalog-filters";
import { GearCard } from "@/components/gear/gear-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  getGearCatalog,
  getLandingCategories,
  type GearCatalogQuery,
} from "@/lib/api/landing";

export const metadata: Metadata = {
  title: "Explore all gear",
  description:
    "Filter the GearUp equipment catalog by category, exact brand, and daily price.",
};

type SearchParamValue = string | string[] | undefined;
type GearPageSearchParams = Record<string, SearchParamValue>;

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

function buildGearHref(values: CatalogFilterValues, page: number) {
  const params = new URLSearchParams();

  if (values.category) params.set("category", values.category);
  if (values.brand) params.set("brand", values.brand);
  if (values.minPrice) params.set("minPrice", values.minPrice);
  if (values.maxPrice) params.set("maxPrice", values.maxPrice);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/gear?${query}` : "/gear";
}

export default async function GearCatalogPage({
  searchParams,
}: {
  searchParams: Promise<GearPageSearchParams>;
}) {
  const rawParams = await searchParams;
  const values: CatalogFilterValues = {
    category: cleanText(rawParams.category),
    brand: cleanText(rawParams.brand),
    minPrice: cleanText(rawParams.minPrice, 30),
    maxPrice: cleanText(rawParams.maxPrice, 30),
  };
  const page = parsePage(rawParams.page);
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

  const query: GearCatalogQuery = {
    category: values.category || undefined,
    brand: values.brand || undefined,
    minPrice,
    maxPrice,
    page,
    limit: 12,
  };

  const categoriesPromise = getLandingCategories();
  const catalogPromise =
    validationErrors.length === 0 ? getGearCatalog(query) : Promise.resolve(null);
  const [categories, catalog] = await Promise.all([
    categoriesPromise,
    catalogPromise,
  ]);

  const matchedCategory = categories.ok
    ? categories.data.find(
        (category) =>
          category.id === values.category ||
          category.name.toLowerCase() === values.category.toLowerCase(),
      )
    : undefined;
  const representedValues: CatalogFilterValues = {
    ...values,
    category: matchedCategory?.id ?? values.category,
  };
  const activeFilters = [
    representedValues.category &&
      `Category: ${matchedCategory?.name ?? "Selected"}`,
    values.brand && `Brand: ${values.brand}`,
    values.minPrice && `From: ${values.minPrice}`,
    values.maxPrice && `Up to: ${values.maxPrice}`,
  ].filter((value): value is string => Boolean(value));
  const totalPages =
    catalog?.ok && catalog.meta
      ? Math.max(1, Math.ceil(catalog.meta.total / catalog.meta.limit))
      : 1;

  if (
    catalog?.ok &&
    catalog.meta &&
    catalog.meta.total > 0 &&
    page > totalPages
  ) {
    redirect(buildGearHref(representedValues, totalPages));
  }

  return (
    <main id="main-content" tabIndex={-1} className="bg-paper text-ink">
      <section className="relative overflow-hidden bg-ink pb-16 pt-36 text-paper sm:pb-20 sm:pt-40">
        <div aria-hidden="true" className="route-grid absolute inset-0 opacity-35" />
        <div className="relative mx-auto grid w-full max-w-[90rem] gap-8 px-5 sm:px-8 lg:grid-cols-12 lg:items-end lg:px-12">
          <div className="lg:col-span-8">
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.28em] text-lime">
              Public catalog // full dispatch
            </p>
            <h1 className="mt-5 font-display text-[clamp(4.5rem,10vw,9rem)] font-black uppercase leading-[0.78] tracking-[-0.055em]">
              The full
              <br />
              <span className="text-orange">gear locker.</span>
            </h1>
          </div>
          <div className="lg:col-span-4">
            <p className="max-w-lg text-sm leading-6 text-paper/70 sm:text-base sm:leading-7">
              Browse every current listing, narrow the catalog with supported
              backend filters, then request dates once you find the right kit.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-6 min-h-11 rounded-none border-paper/30 bg-transparent px-5 font-extrabold text-paper hover:bg-paper hover:text-ink"
            >
              <Link href="/">
                <ArrowLeft aria-hidden="true" />
                Back to field access
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <CatalogFilters
        categories={categories.ok ? categories.data : []}
        categoriesError={categories.ok ? undefined : categories.message}
        values={representedValues}
      />

      <section aria-labelledby="catalog-results-title" className="py-16 sm:py-24">
        <div className="mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-5 border-b border-ink/20 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="section-kicker">Dispatch results // newest first</p>
              <h2
                id="catalog-results-title"
                className="mt-3 font-display text-4xl font-black uppercase tracking-[-0.035em] sm:text-5xl"
              >
                Catalog listings
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.length > 0 ? (
                activeFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="h-auto rounded-none border border-ink/15 bg-mist px-3 py-1.5 text-xs font-bold text-ink"
                  >
                    {filter}
                  </Badge>
                ))
              ) : (
                <Badge className="h-auto rounded-none bg-ink px-3 py-1.5 text-xs font-bold text-paper hover:bg-ink">
                  All gear
                </Badge>
              )}
            </div>
          </div>

          {validationErrors.length > 0 ? (
            <Alert
              variant="destructive"
              className="mt-8 rounded-none border-red-300 bg-red-50 p-5"
            >
              <TriangleAlert aria-hidden="true" />
              <AlertTitle>Check the price filters</AlertTitle>
              <AlertDescription>
                {validationErrors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </AlertDescription>
            </Alert>
          ) : catalog && !catalog.ok ? (
            <Alert
              variant="destructive"
              className="mt-8 rounded-none border-red-300 bg-red-50 p-5"
            >
              <TriangleAlert aria-hidden="true" />
              <AlertTitle>The gear desk is temporarily offline.</AlertTitle>
              <AlertDescription>{catalog.message}</AlertDescription>
            </Alert>
          ) : catalog?.ok && catalog.data.length > 0 ? (
            <>
              <div className="mt-8 flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-ink/70">
                  Showing {catalog.data.length} of {catalog.meta?.total ?? catalog.data.length} items
                </p>
                <Badge
                  variant="outline"
                  className="h-auto rounded-none border-ink/20 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em]"
                >
                  Page {page} of {totalPages}
                </Badge>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {catalog.data.map((gear, index) => (
                  <GearCard
                    key={gear.id}
                    gear={gear}
                    index={index + (page - 1) * 12}
                    eyebrow={`Catalog item // ${String(index + 1 + (page - 1) * 12).padStart(2, "0")}`}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-10 justify-start border-t border-ink/15 pt-6">
                  <PaginationContent>
                    {page > 1 && (
                      <PaginationItem>
                        <PaginationPrevious
                          href={buildGearHref(representedValues, page - 1)}
                          className="rounded-none border border-ink/20 bg-transparent px-4 font-bold hover:bg-ink hover:text-paper"
                        />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <span className="grid min-h-8 min-w-16 place-items-center bg-lime px-3 font-mono text-xs font-bold text-ink">
                        {page} / {totalPages}
                      </span>
                    </PaginationItem>
                    {page < totalPages && (
                      <PaginationItem>
                        <PaginationNext
                          href={buildGearHref(representedValues, page + 1)}
                          className="rounded-none border border-ink/20 bg-transparent px-4 font-bold hover:bg-ink hover:text-paper"
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            <Card className="mt-8 grid min-h-72 place-items-center gap-0 rounded-none border border-dashed border-ink/25 bg-mist/50 p-8 py-8 text-center ring-0 shadow-none">
              <CardContent className="p-0">
                <Boxes aria-hidden="true" className="mx-auto size-10 text-signal" />
                <h3 className="mt-4 font-display text-4xl font-black uppercase">
                  No gear matches this route.
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-ink/70">
                  Try clearing one filter or return to the full catalog. Empty
                  results are different from a connection failure.
                </p>
                <Button
                  asChild
                  className="notch-button mt-6 min-h-11 rounded-none bg-ink px-6 font-extrabold text-paper hover:bg-pine"
                >
                  <Link href="/gear">
                    <SlidersHorizontal aria-hidden="true" />
                    Reset catalog filters
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
