"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-[70dvh] place-items-center p-5 sm:p-8">
      <section className="w-full max-w-2xl border border-ink/15 bg-card p-7 sm:p-10">
        <AlertTriangle aria-hidden="true" className="size-8 text-signal" />
        <p className="mt-7 font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em] text-signal">
          Dashboard interruption // recoverable
        </p>
        <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.88]">
          The field console lost its signal.
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-6 text-ink/65">
          Your account has not been changed. Retry the live dashboard request or
          return to the public catalog.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="button" onClick={reset}>
            <RotateCcw aria-hidden="true" />
            Retry dashboard
          </Button>
          <Button asChild variant="outline">
            <Link href="/gear">Browse public gear</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
