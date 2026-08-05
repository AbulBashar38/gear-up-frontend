import type { ReactNode } from "react";

type DashboardPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: DashboardPageHeaderProps) {
  return (
    <header className="grid gap-6 border-b border-ink/15 pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div>
        <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.22em] text-signal">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-5xl font-display text-[clamp(3.4rem,7vw,7.5rem)] font-black uppercase leading-[0.8] tracking-[-0.05em]">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-6 text-ink/68 sm:text-base sm:leading-7">
          {description}
        </p>
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}
