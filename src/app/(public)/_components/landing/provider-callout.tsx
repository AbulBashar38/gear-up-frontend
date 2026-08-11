import {
  ArrowUpRight,
  BadgeCheck,
  Boxes,
  PackageCheck,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { Reveal } from "./motion-primitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const providerTools = [
  {
    title: "Set the daily rate",
    copy: "Price and describe each listing clearly.",
    icon: SlidersHorizontal,
  },
  {
    title: "Control your stock",
    copy: "Pause availability or adjust quantity as gear moves.",
    icon: Boxes,
  },
  {
    title: "Confirm the right request",
    copy:
      "GearUp checks overlapping rentals and available stock before confirmation.",
    icon: BadgeCheck,
  },
  {
    title: "Track every return",
    copy: "Move paid orders through pickup and return with clear status.",
    icon: PackageCheck,
  },
];

export function ProviderCallout() {
  return (
    <section
      id="providers"
      aria-labelledby="provider-title"
      className="surface-warm scroll-mt-20 bg-orange text-ink"
    >
      <div className="mx-auto grid w-full max-w-[90rem] lg:grid-cols-12">
        <div className="surface-warm relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28 lg:col-span-7 lg:px-12">
          <div aria-hidden="true" className="route-grid absolute inset-0 opacity-20" />
          <Reveal className="relative">
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.25em]">
              For gear providers
            </p>
            <h2
              id="provider-title"
              className="mt-5 max-w-4xl font-display text-[clamp(4rem,8vw,8.2rem)] font-black uppercase leading-[0.79] tracking-[-0.055em]"
            >
              Your spare gear
              <br />
              has another
              <br />
              lap in it.
            </h2>
            <p className="mt-7 max-w-xl text-base font-medium leading-7 text-ink/72 sm:text-lg sm:leading-8">
              List equipment, manage stock, confirm incoming requests, and keep
              fulfillment visible from one provider workspace.
            </p>
            <Button
              asChild
              variant="primary"
              size="xl"
              className="mt-8"
            >
              <Link href="/register?role=PROVIDER">
                Create a provider account
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </Reveal>
        </div>

        <div
          id="provider-workflow"
          className="surface-inverse bg-ink px-5 py-16 text-paper sm:px-8 lg:col-span-5 lg:px-12 lg:py-24"
        >
          <Reveal>
            <div className="mb-8 flex items-center justify-between border-b border-paper/15 pb-4">
              <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em] text-lime">
                Provider tools
              </p>
              <span className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-paper/60">
                Included with your account
              </span>
            </div>
          </Reveal>

          <div className="space-y-3">
            {providerTools.map((tool, index) => {
              const Icon = tool.icon;

              return (
                <Reveal key={tool.title} delay={index * 0.06}>
                  <Card
                    asChild
                    className="gap-0 rounded-none bg-transparent py-0 text-paper ring-1 ring-paper/15 shadow-none transition-colors hover:bg-paper/[0.04] hover:ring-lime/45"
                  >
                    <article>
                      <CardContent className="grid grid-cols-[3rem_1fr] gap-4 p-4">
                        <span className="grid size-12 place-items-center bg-paper/[0.07] text-orange transition-colors group-hover/card:bg-lime group-hover/card:text-ink">
                          <Icon aria-hidden="true" className="size-5" />
                        </span>
                        <div>
                          <h3 className="font-display text-xl font-black uppercase tracking-tight">
                            {tool.title}
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-paper/55">
                            {tool.copy}
                          </p>
                        </div>
                      </CardContent>
                    </article>
                  </Card>
                </Reveal>
              );
            })}
          </div>

          <p className="mt-7 border-l-2 border-orange pl-4 text-xs leading-5 text-paper/52">
            Providers only manage their own listings and the orders attached to
            their gear. Admins retain platform-wide oversight.
          </p>
        </div>
      </div>
    </section>
  );
}
