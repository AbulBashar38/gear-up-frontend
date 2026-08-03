import { Skeleton } from "@/components/ui/skeleton";
import { CatalogContentSkeleton } from "../_components/gear/catalog-content-skeleton";

export default function GearCatalogLoading() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      aria-label="Loading gear catalog"
      className="bg-paper"
    >
      <section className="bg-ink pb-16 pt-36">
        <div className="mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12">
          <Skeleton className="h-4 w-52 rounded-none bg-paper/15" />
          <Skeleton className="mt-6 h-40 max-w-3xl rounded-none bg-paper/15" />
        </div>
      </section>
      <CatalogContentSkeleton />
    </main>
  );
}
