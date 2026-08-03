import { Skeleton } from "@/components/ui/skeleton";

export function GearCardSkeleton() {
  return (
    <div className="border border-ink/10 bg-paper">
      <Skeleton className="h-56 rounded-none bg-ink/10" />
      <div className="space-y-4 p-6">
        <Skeleton className="h-3 w-2/3 rounded-none bg-ink/10" />
        <Skeleton className="h-14 rounded-none bg-ink/10" />
        <Skeleton className="h-3 rounded-none bg-ink/10" />
      </div>
    </div>
  );
}
