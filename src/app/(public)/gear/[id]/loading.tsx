import { Skeleton } from "@/components/ui/skeleton";

export default function GearDetailLoading() {
  return (
    <main id="main-content" tabIndex={-1} aria-label="Loading gear details" className="bg-paper">
      <section className="bg-ink pb-16 pt-36">
        <div className="mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12">
          <Skeleton className="h-10 w-48 rounded-none bg-paper/15" />
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <Skeleton className="min-h-[25rem] rounded-none bg-paper/15 sm:min-h-[34rem] lg:col-span-7" />
            <div className="border border-paper/10 p-7 lg:col-span-5">
              <Skeleton className="h-7 w-40 rounded-none bg-paper/15" />
              <Skeleton className="mt-12 h-44 rounded-none bg-paper/15" />
              <Skeleton className="mt-20 h-16 rounded-none bg-paper/15" />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-[90rem] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:px-12">
        <div className="space-y-5 lg:col-span-7">
          <Skeleton className="h-4 w-48 rounded-none bg-ink/10" />
          <Skeleton className="h-32 rounded-none bg-ink/10" />
          <Skeleton className="h-40 rounded-none bg-ink/10" />
        </div>
        <Skeleton className="h-96 rounded-none bg-ink/10 lg:col-span-5" />
      </section>
    </main>
  );
}
