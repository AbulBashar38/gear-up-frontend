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
      className="relative grid min-h-dvh place-items-center overflow-hidden bg-ink px-5 py-20 text-paper"
    >
      <div aria-hidden="true" className="route-grid absolute inset-0 opacity-25" />
      <section className="relative w-full max-w-3xl border border-paper/15 bg-ink/90 p-7 sm:p-12">
        <BrandMark inverse />
        <TriangleAlert
          aria-hidden="true"
          className="mt-16 size-12 text-orange"
          strokeWidth={1.5}
        />
        <p className="mt-6 font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-lime">
          Dispatch fault // unexpected
        </p>
        <h1 className="mt-4 font-display text-[clamp(3.5rem,9vw,7rem)] font-black uppercase leading-[0.82] tracking-[-0.05em]">
          We lost the trail.
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-6 text-paper/65 sm:text-base sm:leading-7">
          The page hit an unexpected problem. Retry the request, or return to
          the public gear locker while the route reconnects.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={() => unstable_retry()}
            className="notch-button min-h-12 rounded-none bg-lime px-6 font-extrabold text-ink hover:bg-lime/90"
          >
            <RotateCcw aria-hidden="true" />
            Retry this route
          </Button>
          <Button
            asChild
            variant="outline"
            className="min-h-12 rounded-none border-paper/25 bg-transparent px-6 font-extrabold text-paper hover:bg-paper hover:text-ink"
          >
            <Link href="/gear">Open the gear locker</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
