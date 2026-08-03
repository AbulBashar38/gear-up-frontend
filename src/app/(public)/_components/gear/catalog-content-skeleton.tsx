import { GearCardSkeleton } from "./gear-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function CatalogContentSkeleton() {
  return (
    <div aria-label="Loading catalog filters and listings">
      <section className="bg-mist">
        <div className="mx-auto grid w-full max-w-[90rem] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-10">
          <div className="space-y-5 lg:col-span-9">
            <Skeleton className="h-12 max-w-sm rounded-none bg-ink/10" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-16 rounded-none bg-ink/10"
                />
              ))}
            </div>
          </div>
          <Skeleton className="h-36 rounded-none bg-ink/10 lg:col-span-3" />
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12">
          <Skeleton className="h-14 max-w-md rounded-none bg-ink/10" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <GearCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
