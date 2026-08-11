import { redirect } from "next/navigation";
import { listCategories } from "@/services/categories";
import { listGear } from "@/services/gear";
import {
  buildGearHref,
  parseCatalogQuery,
  type CatalogFilterValues,
  type GearPageSearchParams,
} from "../../_utils/catalog-query";
import { CatalogFilters } from "./catalog-filters";
import { CatalogResults } from "./catalog-results";

type CatalogContentProps = {
  searchParams: Promise<GearPageSearchParams>;
};

export async function CatalogContent({ searchParams }: CatalogContentProps) {
  const parsed = parseCatalogQuery(await searchParams);
  const categoriesPromise = listCategories();
  const catalogPromise =
    parsed.validationErrors.length === 0
      ? listGear(parsed.query)
      : Promise.resolve(null);
  const [categories, catalog] = await Promise.all([
    categoriesPromise,
    catalogPromise,
  ]);

  const matchedCategory = categories.ok
    ? categories.data.find(
        (category) =>
          category.id === parsed.values.category ||
          category.name.toLowerCase() === parsed.values.category.toLowerCase(),
      )
    : undefined;
  const representedValues: CatalogFilterValues = {
    ...parsed.values,
    category: matchedCategory?.id ?? parsed.values.category,
  };
  const activeFilters = [
    parsed.values.search && `Search: ${parsed.values.search}`,
    representedValues.category &&
      `Category: ${matchedCategory?.name ?? "Selected"}`,
    parsed.values.brand && `Brand: ${parsed.values.brand}`,
    parsed.values.minPrice && `From: ${parsed.values.minPrice}`,
    parsed.values.maxPrice && `Up to: ${parsed.values.maxPrice}`,
    parsed.values.startDate &&
      parsed.values.endDate &&
      `Available: ${parsed.values.startDate} — ${parsed.values.endDate}`,
  ].filter((value): value is string => Boolean(value));
  const totalPages =
    catalog?.ok && catalog.meta && catalog.meta.limit > 0
      ? Math.max(1, Math.ceil(catalog.meta.total / catalog.meta.limit))
      : 1;

  if (
    catalog?.ok &&
    catalog.meta &&
    parsed.page > totalPages
  ) {
    redirect(buildGearHref(representedValues, totalPages));
  }

  return (
    <>
      <CatalogFilters
        key={[
          representedValues.category,
          representedValues.brand,
          representedValues.minPrice,
          representedValues.maxPrice,
          representedValues.startDate,
          representedValues.endDate,
        ].join("|")}
        categories={categories.ok ? categories.data : []}
        categoriesError={
          categories.ok ? undefined : categories.error.message
        }
        values={representedValues}
        minimumDate={new Date().toISOString().slice(0, 10)}
      />
      <CatalogResults
        catalog={catalog}
        validationErrors={parsed.validationErrors}
        activeFilters={activeFilters}
        values={representedValues}
        page={parsed.page}
        totalPages={totalPages}
      />
    </>
  );
}
