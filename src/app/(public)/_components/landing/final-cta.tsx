import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "./motion-primitives";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-pine py-20 text-paper sm:py-28">
      <div aria-hidden="true" className="topo-lines absolute inset-0 opacity-25" />
      <div className="relative mx-auto grid w-full max-w-[90rem] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:items-end lg:px-12">
        <Reveal className="lg:col-span-9">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.25em] text-lime">
            Next field window // whenever you are ready
          </p>
          <h2 className="mt-5 font-display text-[clamp(4.4rem,10vw,10rem)] font-black uppercase leading-[0.77] tracking-[-0.06em]">
            Plan bigger.
            <br />
            <span className="text-lime">Store less.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-3">
          <p className="max-w-sm text-sm leading-6 text-paper/60">
            Start with what the community already has. Request it by the day and
            keep your space for the stories.
          </p>
          <Button
            asChild
            className="notch-button mt-6 min-h-14 w-full rounded-none bg-lime px-7 text-sm font-extrabold text-ink transition-transform duration-300 hover:-translate-y-1 hover:bg-lime/90 sm:w-auto lg:w-full"
          >
            <Link href="/gear">
              Open the gear locker
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
