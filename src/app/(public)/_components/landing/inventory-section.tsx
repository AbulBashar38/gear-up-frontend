import { ArrowUpRight, Boxes, Compass } from "lucide-react";
import Link from "next/link";
import { GearCard } from "../gear/gear-card";
import { GearCardSkeleton } from "../gear/gear-card-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listCategories } from "@/lib/api/categories";
import { listGear } from "@/lib/api/gear";
import { Reveal } from "./motion-primitives";

export async function InventorySection() {
  const [categories, gear] = await Promise.all([
    listCategories(),
    listGear({ page: 1, limit: 6 }),
  ]);

  return (
    <section id="gear-locker" className="scroll-mt-20 bg-paper py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 border-b border-ink/20 pb-8 md:flex-row md:items-end">
            <div>
              <p className="section-kicker">Dispatch board // recently listed</p>
              <h2 className="mt-4 max-w-4xl font-display text-[clamp(3.5rem,7vw,7.3rem)] font-black uppercase leading-[0.82] tracking-[-0.05em] text-ink">
                Find your next
                <br />
                reason to go.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-ink/70 sm:text-base sm:leading-7">
              GearUp makes good equipment useful more often. Browse the newest
              listings, request your dates, and let the provider confirm the fit.
            </p>
          </div>
        </Reveal>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-ink/70">
              Browse by field
            </p>
            {categories.ok && (
              <p className="font-mono text-[0.62rem] text-ink/70">
                {String(categories.data.length).padStart(2, "0")} live categories
              </p>
            )}
          </div>

          {categories.ok && categories.data.length > 0 ? (
            <div className="flex snap-x gap-3 overflow-x-auto pb-3">
              {categories.data.map((category, index) => (
                <Button
                  asChild
                  variant="outline-accent"
                  size="xl"
                  key={category.id}
                  className="min-h-16 min-w-[14rem] snap-start justify-between bg-card/35"
                >
                  <Link href={`/gear?category=${encodeURIComponent(category.id)}`}>
                    <span className="font-display text-xl font-black uppercase">
                      {category.name}
                    </span>
                    <Badge className="size-8 rounded-none bg-ink p-0 font-mono text-[0.62rem] text-lime hover:bg-ink">
                      0{index + 1}
                    </Badge>
                  </Link>
                </Button>
              ))}
            </div>
          ) : (
            <Alert className="min-h-20 rounded-none border-dashed border-ink/25 bg-transparent px-5 text-ink">
              <Compass aria-hidden="true" className="size-5 text-signal" />
              <AlertTitle>Category routes are being mapped.</AlertTitle>
              <AlertDescription className="text-ink/70">
                {categories.ok
                  ? "New categories will appear here when providers start listing gear."
                  : categories.error.message}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
          <h3 className="font-display text-2xl font-black uppercase tracking-tight">
            Fresh from the gear locker
          </h3>
          <div className="flex items-center gap-4">
            {gear.ok && gear.meta && (
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-ink/70">
                Showing {gear.data.length} of {gear.meta.total}
              </p>
            )}
            <Button
              asChild
              variant="outline"
              size="compact"
            >
              <Link href="/gear">
                View all gear
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        {gear.ok && gear.data.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {gear.data.map((item, index) => (
              <Reveal
                key={item.id}
                delay={Math.min(index * 0.06, 0.24)}
                className="h-full"
              >
                <GearCard
                  gear={item}
                  index={index}
                  eyebrow={`New listing // ${String(index + 1).padStart(2, "0")}`}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-5 grid min-h-72 place-items-center border border-dashed border-ink/25 bg-white/25 p-8 text-center">
            <div>
              <Boxes
                aria-hidden="true"
                className="mx-auto size-10 text-signal"
              />
              <h3 className="mt-4 font-display text-3xl font-black uppercase">
                {gear.ok ? "The locker is being stocked." : "Signal interrupted."}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/70">
                {gear.ok
                  ? "Check back soon for newly listed equipment."
                  : gear.error.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function InventorySkeleton() {
  return (
    <section
      aria-label="Loading recently listed gear"
      className="bg-paper py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <Skeleton className="h-4 w-48 rounded-none bg-ink/10" />
        <Skeleton className="mt-6 h-28 max-w-3xl rounded-none bg-ink/10" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <GearCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
