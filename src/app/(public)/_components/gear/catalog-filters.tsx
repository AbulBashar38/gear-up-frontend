"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Filter, Info, LoaderCircle, RotateCcw, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import type { Category } from "@/lib/types";
import {
  buildGearHref,
  type CatalogFilterValues,
} from "../../_utils/catalog-query";
import {
  PriceRangeSlider,
  type PriceRangeValue,
} from "./price-range-slider";
import {
  DatePickerWithRange,
  type DateRangeValue,
} from "@/components/ui/date-range-picker";

type CatalogFiltersProps = {
  categories: Category[];
  categoriesError?: string;
  values: CatalogFilterValues;
  minimumDate: string;
  priceBounds?: PriceRangeValue;
  priceRangeError?: string;
  currency: string;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function CatalogFilters({
  categories,
  categoriesError,
  values,
  minimumDate,
  priceBounds,
  priceRangeError,
  currency,
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [draftDateRange, setDraftDateRange] = useState<DateRangeValue>({
    from: values.startDate,
    to: values.endDate,
  });
  const [draftPrice, setDraftPrice] = useState<PriceRangeValue>(() => {
    if (!priceBounds) return { min: 0, max: 0 };
    const requestedMin = values.minPrice ? Number(values.minPrice) : Number.NaN;
    const requestedMax = values.maxPrice ? Number(values.maxPrice) : Number.NaN;
    const min = Number.isFinite(requestedMin)
      ? clamp(requestedMin, priceBounds.min, priceBounds.max)
      : priceBounds.min;
    const max = Number.isFinite(requestedMax)
      ? clamp(requestedMax, priceBounds.min, priceBounds.max)
      : priceBounds.max;
    return { min: Math.min(min, max), max: Math.max(min, max) };
  });
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
      if (
        priceBounds &&
        ((key === "minPrice" && Number(value) === priceBounds.min) ||
          (key === "maxPrice" && Number(value) === priceBounds.max))
      ) {
        continue;
      }
      if (value) params.set(key, value);
    }
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname));
  }

  function scheduleSearch(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const href = buildGearHref(
        { ...values, search: value.trim() },
        1,
      );
      startTransition(() => router.replace(href, { scroll: false }));
    }, 450);
  }

  function handleFormChange(event: ChangeEvent<HTMLFormElement>) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) {
      return;
    }

    if (target.name === "search") {
      scheduleSearch(target.value);
      return;
    }

  }

  function clearFilters() {
    if (timerRef.current) clearTimeout(timerRef.current);
    const form = formRef.current;
    if (form) {
      for (const control of Array.from(form.elements)) {
        if (
          control instanceof HTMLInputElement ||
          control instanceof HTMLSelectElement
        ) {
          control.value = "";
        }
      }
    }
    setDraftDateRange({ from: "", to: "" });
    if (priceBounds) setDraftPrice(priceBounds);
    startTransition(() => router.replace(pathname, { scroll: false }));
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
              <p className="section-kicker">Search and filters</p>
              <h2
                id="catalog-filters-title"
                className="font-display text-3xl font-black uppercase tracking-tight"
              >
                Find the right gear
              </h2>
            </div>
          </div>

          <form
            ref={formRef}
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

            {priceBounds ? (
              <PriceRangeSlider
                bounds={priceBounds}
                value={draftPrice}
                currency={currency}
                onValueChange={setDraftPrice}
              />
            ) : (
              <div className="space-y-2 sm:col-span-2 xl:col-span-2">
                <Label className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ink/70">
                  Daily price range
                </Label>
                <div className="grid min-h-20 place-items-center border border-dashed border-ink/25 bg-paper/55 px-4 text-center text-xs text-ink/60">
                  {priceRangeError ?? "Add a gear item to enable price filtering."}
                </div>
                <input type="hidden" name="minPrice" value={values.minPrice} />
                <input type="hidden" name="maxPrice" value={values.maxPrice} />
              </div>
            )}

            <div className="space-y-2 sm:col-span-2 xl:col-span-2">
              <Label
                htmlFor="availabilityDates"
                className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ink/70"
              >
                Availability dates
              </Label>
              <DatePickerWithRange
                id="availabilityDates"
                startName="startDate"
                endName="endDate"
                value={draftDateRange}
                minimumDate={minimumDate}
                onValueChange={setDraftDateRange}
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
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={clearFilters}
              >
                Clear all
                <RotateCcw aria-hidden="true" />
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
            How filters work
          </AlertTitle>
          <AlertDescription className="mt-2 text-xs leading-5 text-ink/70">
            Keyword search updates as you type. Category, brand, price, and date
            choices wait for Apply filters. Date results show items with enough
            stock across your selected rental window.
          </AlertDescription>
        </Alert>
      </div>
    </section>
  );
}
