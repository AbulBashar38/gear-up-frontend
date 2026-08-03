import { Skeleton } from "@/components/ui/skeleton";

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
      <section className="bg-mist py-10">
        <div className="mx-auto grid w-full max-w-[90rem] gap-4 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-none bg-ink/10" />
          ))}
        </div>
      </section>
      <section className="py-16 sm:py-24">
        <div className="mx-auto grid w-full max-w-[90rem] gap-5 px-5 sm:grid-cols-2 sm:px-8 lg:px-12 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border border-ink/10">
              <Skeleton className="h-56 rounded-none bg-ink/10" />
              <div className="space-y-4 p-6">
                <Skeleton className="h-3 w-2/3 rounded-none bg-ink/10" />
                <Skeleton className="h-14 rounded-none bg-ink/10" />
                <Skeleton className="h-3 rounded-none bg-ink/10" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
