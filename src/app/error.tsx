"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui/button";

export default function ApplicationError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="surface-inverse relative grid min-h-dvh place-items-center overflow-hidden bg-background px-5 py-20 text-foreground"
    >
      <div aria-hidden="true" className="route-grid absolute inset-0 opacity-25" />
      <section className="relative w-full max-w-3xl border border-border bg-background/90 p-7 sm:p-12">
        <BrandMark inverse />
        <TriangleAlert
          aria-hidden="true"
          className="mt-16 size-12 text-orange"
          strokeWidth={1.5}
        />
        <p className="mt-6 font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-lime">
          Unexpected error
        </p>
        <h1 className="mt-4 font-display text-[clamp(3.5rem,9vw,7rem)] font-black uppercase leading-[0.82] tracking-[-0.05em]">
          We lost the trail.
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-6 text-paper/65 sm:text-base sm:leading-7">
          The page hit an unexpected problem. Retry the request, or return to
          the gear catalog while the problem is resolved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={() => unstable_retry()}
            variant="primary"
            size="lg"
          >
            <RotateCcw aria-hidden="true" />
            Retry this page
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
          >
            <Link href="/gear">Browse all gear</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
