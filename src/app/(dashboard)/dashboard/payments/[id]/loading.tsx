import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-14">
      <Skeleton className="h-8 w-36 rounded-none" />
      <div className="space-y-4 border border-ink/15 bg-card p-5 sm:p-7">
        <Skeleton className="h-5 w-44 rounded-none" />
        <Skeleton className="h-10 w-56 rounded-none" />
        <Skeleton className="h-4 w-64 rounded-none" />
        <Skeleton className="h-11 w-40 rounded-none" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-44 rounded-none" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-none" />
    </div>
  );
}
