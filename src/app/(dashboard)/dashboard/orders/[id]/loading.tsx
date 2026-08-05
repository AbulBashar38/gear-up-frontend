import { Skeleton } from "@/components/ui/skeleton";

export default function OrderDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-14">
      <Skeleton className="h-8 w-32 rounded-none" />
      <div className="space-y-4 border border-ink/15 bg-card p-5 sm:p-7">
        <Skeleton className="h-5 w-40 rounded-none" />
        <Skeleton className="h-10 w-3/4 rounded-none" />
        <Skeleton className="h-4 w-52 rounded-none" />
        <div className="flex gap-2 pt-4">
          <Skeleton className="h-11 w-36 rounded-none" />
          <Skeleton className="h-11 w-32 rounded-none" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-none" />
        ))}
      </div>
    </div>
  );
}
