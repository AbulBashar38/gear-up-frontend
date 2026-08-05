import type { ReactNode } from "react";
import type { ApiMeta, ApiProblem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { DashboardApiFeedback } from "./dashboard-feedback";
import { DashboardPageHeader } from "./dashboard-page-header";
import { DashboardPagination } from "./dashboard-pagination";

type DashboardRegisterPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  total: number | null;
  problem?: ApiProblem;
  meta?: ApiMeta;
  pathname?: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export function DashboardRegisterPage({
  eyebrow,
  title,
  description,
  total,
  problem,
  meta,
  pathname,
  actions,
  children,
}: DashboardRegisterPageProps) {
  return (
    <div className="p-5 sm:p-8 lg:p-10 xl:p-14">
      <DashboardPageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 pb-5">
        <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-ink/60">
          API register // newest first
        </p>
        <Badge variant="outline" className="h-auto rounded-none px-3 py-1.5 uppercase">
          {total === null ? "Count unavailable" : `${total} total`}
        </Badge>
      </div>

      {problem ? (
        <div className="mt-6">
          <DashboardApiFeedback problems={[problem]} />
        </div>
      ) : (
        <div className="mt-6">{children}</div>
      )}

      {meta && pathname && (
        <DashboardPagination pathname={pathname} meta={meta} />
      )}
    </div>
  );
}
