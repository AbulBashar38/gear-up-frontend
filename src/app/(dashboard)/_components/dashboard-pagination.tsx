import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ApiMeta } from "@/lib/types";
import { Button } from "@/components/ui/button";

function pageHref(
  pathname: string,
  page: number,
  query?: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  if (page > 1) params.set("page", String(page));
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function DashboardPagination({
  pathname,
  meta,
  query,
}: {
  pathname: string;
  meta: ApiMeta;
  query?: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Dashboard list pagination"
      className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink/15 pt-6"
    >
      <p className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.15em] text-ink/65">
        Page {meta.page} / {totalPages}
      </p>
      <div className="flex gap-2">
        {meta.page > 1 ? (
          <Button asChild variant="outline" size="compact">
            <Link href={pageHref(pathname, meta.page - 1, query)}>
              <ArrowLeft aria-hidden="true" />
              Previous
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="compact" disabled>
            <ArrowLeft aria-hidden="true" />
            Previous
          </Button>
        )}
        {meta.page < totalPages ? (
          <Button asChild variant="outline" size="compact">
            <Link href={pageHref(pathname, meta.page + 1, query)}>
              Next
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="compact" disabled>
            Next
            <ArrowRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </nav>
  );
}
