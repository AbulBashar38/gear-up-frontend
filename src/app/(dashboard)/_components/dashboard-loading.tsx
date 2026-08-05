import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLoading() {
  return (
    <div className="p-5 sm:p-8 lg:p-10 xl:p-14">
      <Skeleton className="h-3 w-48 rounded-none bg-ink/10" />
      <Skeleton className="mt-6 h-32 max-w-4xl rounded-none bg-ink/10" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-64 rounded-none bg-ink/10" />
        ))}
      </div>
      <Skeleton className="mt-10 h-80 rounded-none bg-ink/10" />
    </div>
  );
}
