import type { LucideIcon } from "lucide-react";

/**
 * Shared label/value card used by the dashboard detail screens. Kept generic:
 * callers supply their own icon and rows.
 */
export function DetailCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-ink/15 bg-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-ink/55">
        <Icon aria-hidden="true" className="size-3.5" />
        {title}
      </h2>
      <div className="mt-4 space-y-2 text-sm text-ink/80">{children}</div>
    </section>
  );
}

export function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-xs text-ink/55">{label}</dt>
      <dd className="min-w-0 wrap-break-word text-right font-medium text-ink">
        {value}
      </dd>
    </div>
  );
}
