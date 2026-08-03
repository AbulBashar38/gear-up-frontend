import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { CatalogContent } from "../_components/gear/catalog-content";
import { CatalogContentSkeleton } from "../_components/gear/catalog-content-skeleton";
import type { GearPageSearchParams } from "../_utils/catalog-query";

export const metadata: Metadata = {
  title: "Explore all gear",
  description:
    "Filter the GearUp equipment catalog by category, exact brand, and daily price.",
};

export default function GearCatalogPage({
  searchParams,
}: {
  searchParams: Promise<GearPageSearchParams>;
}) {
  return (
    <main id="main-content" tabIndex={-1} className="bg-paper text-ink">
      <section className="surface-inverse relative overflow-hidden bg-background pb-16 pt-36 text-foreground sm:pb-20 sm:pt-40">
        <div aria-hidden="true" className="route-grid absolute inset-0 opacity-35" />
        <div className="relative mx-auto grid w-full max-w-[90rem] gap-8 px-5 sm:px-8 lg:grid-cols-12 lg:items-end lg:px-12">
          <div className="lg:col-span-8">
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.28em] text-lime">
              Public catalog // full dispatch
            </p>
            <h1 className="mt-5 font-display text-[clamp(4.5rem,10vw,9rem)] font-black uppercase leading-[0.78] tracking-[-0.055em]">
              The full
              <br />
              <span className="text-orange">gear locker.</span>
            </h1>
          </div>
          <div className="lg:col-span-4">
            <p className="max-w-lg text-sm leading-6 text-paper/70 sm:text-base sm:leading-7">
              Browse every current listing, narrow the catalog with supported
              backend filters, then request dates once you find the right kit.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-6"
            >
              <Link href="/">
                <ArrowLeft aria-hidden="true" />
                Back to field access
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Suspense fallback={<CatalogContentSkeleton />}>
        <CatalogContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
