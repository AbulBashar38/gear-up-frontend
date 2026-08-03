import { Boxes, SlidersHorizontal, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { GearCard } from "./gear-card";
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
import type { ApiResult, GearItem } from "@/lib/api/types";
import {
  buildGearHref,
  type CatalogFilterValues,
} from "../../_utils/catalog-query";

type CatalogResultsProps = {
  catalog: ApiResult<GearItem[]> | null;
  validationErrors: string[];
  activeFilters: string[];
  values: CatalogFilterValues;
  page: number;
  totalPages: number;
};

export function CatalogResults({
  catalog,
  validationErrors,
  activeFilters,
  values,
  page,
  totalPages,
}: CatalogResultsProps) {
  return (
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
            className="mt-8 rounded-none p-5"
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
            className="mt-8 rounded-none p-5"
          >
            <TriangleAlert aria-hidden="true" />
            <AlertTitle>
              {catalog.error.retryable
                ? "The gear desk is temporarily offline."
                : "The catalog request could not be completed."}
            </AlertTitle>
            <AlertDescription>{catalog.error.message}</AlertDescription>
          </Alert>
        ) : catalog?.ok && catalog.data.length > 0 ? (
          <>
            <div className="mt-8 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-ink/70">
                Showing {catalog.data.length} of{" "}
                {catalog.meta?.total ?? catalog.data.length} items
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
                        href={buildGearHref(values, page - 1)}
                        variant="outline"
                      />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <span
                      aria-current="page"
                      className="grid min-h-11 min-w-16 place-items-center bg-accent px-3 font-mono text-xs font-bold text-accent-foreground"
                    >
                      {page} / {totalPages}
                    </span>
                  </PaginationItem>
                  {page < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        href={buildGearHref(values, page + 1)}
                        variant="outline"
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
                variant="primary"
                className="mt-6"
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
  );
}
