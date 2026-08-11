"use client";

import { useEffect, useRef, useTransition, type ChangeEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Filter, Info, LoaderCircle, RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import type { Category } from "@/lib/types";
import type { CatalogFilterValues } from "../../_utils/catalog-query";

type CatalogFiltersProps = {
  categories: Category[];
  categoriesError?: string;
  values: CatalogFilterValues;
  minimumDate: string;
};

export function CatalogFilters({
  categories,
  categoriesError,
  values,
  minimumDate,
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasKnownCategory = categories.some(
    (category) => category.id === values.category,
  );

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  function replaceFromForm() {
    if (!formRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    const params = new URLSearchParams();
    const data = new FormData(formRef.current);
    for (const [key, rawValue] of data.entries()) {
      const value = String(rawValue).trim();
      if (value) params.set(key, value);
    }
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname));
  }

  function scheduleReplace(target: HTMLInputElement | HTMLSelectElement) {
    if (timerRef.current) clearTimeout(timerRef.current);
    const delay = target.tagName === "SELECT" || target.type === "date" ? 100 : 450;
    timerRef.current = setTimeout(replaceFromForm, delay);
  }

  function handleFormChange(event: ChangeEvent<HTMLFormElement>) {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) {
      scheduleReplace(target);
    }
  }

  return (
    <section aria-labelledby="catalog-filters-title" className="bg-mist">
      <div className="mx-auto grid w-full max-w-[90rem] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-10">
        <div className="lg:col-span-9">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center bg-ink text-lime">
              <Filter aria-hidden="true" className="size-4" />
            </span>
            <div>
              <p className="section-kicker">Catalog controls // live API</p>
              <h2
                id="catalog-filters-title"
                className="font-display text-3xl font-black uppercase tracking-tight"
              >
                Filter the full locker
              </h2>
            </div>
          </div>

          <form
            ref={formRef}
            key={JSON.stringify(values)}
            action="/gear"
            method="get"
            onSubmit={(event) => {
              event.preventDefault();
              replaceFromForm();
            }}
            onChange={handleFormChange}
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <div className="space-y-2 sm:col-span-2 xl:col-span-4">
              <Label
                htmlFor="search"
                className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ink/70"
              >
                Keyword search
              </Label>
              <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/45" />
                <Input
                  id="search"
                  name="search"
                  type="search"
                  defaultValue={values.search}
                  maxLength={255}
                  placeholder="Search gear, descriptions, brands, categories, or providers"
                  className="h-11 rounded-lg bg-paper pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ink/70"
              >
                Category
              </Label>
              <NativeSelect
                id="category"
                name="category"
                defaultValue={values.category}
                className="w-full [&>select]:h-10"
                aria-describedby={categoriesError ? "category-error" : undefined}
              >
                <NativeSelectOption value="">All categories</NativeSelectOption>
                {categories.map((category) => (
                  <NativeSelectOption key={category.id} value={category.id}>
                    {category.name}
                  </NativeSelectOption>
                ))}
                {values.category && !hasKnownCategory && (
                  <NativeSelectOption value={values.category}>
                    Current category filter
                  </NativeSelectOption>
                )}
              </NativeSelect>
              {categoriesError && (
                <p id="category-error" className="text-xs text-signal">
                  Category choices are reconnecting.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="brand"
                className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ink/70"
              >
                Exact brand
              </Label>
              <Input
                id="brand"
                name="brand"
                defaultValue={values.brand}
                maxLength={255}
                placeholder="e.g. Coleman"
                className="h-10 rounded-lg bg-paper"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="minPrice"
                className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ink/70"
              >
                Minimum daily price
              </Label>
              <Input
                id="minPrice"
                name="minPrice"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                defaultValue={values.minPrice}
                placeholder="0"
                className="h-10 rounded-lg bg-paper"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="maxPrice"
                className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ink/70"
              >
                Maximum daily price
              </Label>
              <Input
                id="maxPrice"
                name="maxPrice"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                defaultValue={values.maxPrice}
                placeholder="No maximum"
                className="h-10 rounded-lg bg-paper"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="startDate"
                className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ink/70"
              >
                Available from
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                min={minimumDate}
                defaultValue={values.startDate}
                className="h-10 rounded-lg bg-paper"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="endDate"
                className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ink/70"
              >
                Available through
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                min={values.startDate || minimumDate}
                defaultValue={values.endDate}
                className="h-10 rounded-lg bg-paper"
              />
            </div>

            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row xl:col-span-4">
              <Button
                type="submit"
                variant="primary"
                disabled={isPending}
              >
                {isPending ? "Updating…" : "Apply filters"}
                {isPending ? (
                  <LoaderCircle aria-hidden="true" className="animate-spin" />
                ) : (
                  <Filter aria-hidden="true" />
                )}
              </Button>
              <Button
                asChild
                variant="outline"
              >
                <Link href="/gear">
                  Clear all
                  <RotateCcw aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </form>
        </div>

        <Alert
          role="note"
          className="h-fit rounded-none border-ink/20 bg-paper/65 p-5 text-ink lg:col-span-3 lg:mt-15"
        >
          <Info aria-hidden="true" className="size-4 text-signal" />
          <AlertTitle className="font-display text-xl font-black uppercase">
            Search scope
          </AlertTitle>
          <AlertDescription className="mt-2 text-xs leading-5 text-ink/70">
            Controls update the URL and query the complete backend catalog.
            Date results exclude stock reserved by confirmed, paid, or picked-up
            orders; brand matching remains exact.
          </AlertDescription>
        </Alert>
      </div>
    </section>
  );
}
