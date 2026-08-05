import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardMetricCardProps = {
  code: string;
  label: string;
  value: number | null;
  detail: string;
  href: string;
  icon: LucideIcon;
  tone?: "paper" | "lime" | "orange" | "ink";
};

const toneClasses = {
  paper: "bg-card text-ink",
  lime: "surface-accent bg-lime text-ink",
  orange: "surface-accent bg-orange text-ink",
  ink: "surface-inverse bg-background text-foreground",
} as const;

export function DashboardMetricCard({
  code,
  label,
  value,
  detail,
  href,
  icon: Icon,
  tone = "paper",
}: DashboardMetricCardProps) {
  return (
    <Card
      className={cn(
        "gear-tag h-full gap-0 rounded-none py-0 ring-1 ring-ink/15 shadow-none",
        toneClasses[tone],
      )}
    >
      <CardContent className="flex h-full flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] opacity-60">
            {code}
          </p>
          <Icon aria-hidden="true" className="size-5" />
        </div>
        <p className="mt-9 font-display text-7xl font-black leading-none tracking-[-0.05em]">
          {value ?? "—"}
        </p>
        <p className="mt-2 font-display text-2xl font-black uppercase leading-none">
          {label}
        </p>
        <p className="mt-5 text-xs leading-5 opacity-65">{detail}</p>
        <Link
          href={href}
          className="mt-7 flex min-h-11 items-center justify-between border-t border-current/20 pt-4 text-xs font-extrabold uppercase tracking-[0.14em]"
        >
          Open register
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
