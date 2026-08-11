import { Compass, MoveLeft } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative grid min-h-dvh place-items-center overflow-hidden bg-paper px-5 py-20 text-ink"
    >
      <div aria-hidden="true" className="topo-lines absolute inset-0 opacity-30" />
      <section className="relative w-full max-w-3xl border border-ink/15 bg-paper/90 p-7 sm:p-12">
        <BrandMark />
        <p className="mt-16 font-display text-[clamp(5rem,18vw,12rem)] font-black leading-[0.68] tracking-[-0.07em] text-orange">
          404
        </p>
        <div className="mt-10 grid gap-6 border-t border-ink/15 pt-8 sm:grid-cols-[auto_1fr] sm:items-start">
          <span className="grid size-12 place-items-center bg-ink text-lime">
            <Compass aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-signal">
              Page not found
            </p>
            <h1 className="mt-3 font-display text-4xl font-black uppercase leading-none sm:text-6xl">
              This trail ends here.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-ink/65">
              The address may have moved or never existed. Return home or
              continue browsing all available gear.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                variant="primary"
                size="lg"
              >
                <Link href="/">
                  <MoveLeft aria-hidden="true" />
                  Return home
                </Link>
              </Button>
              <Button
                asChild
                variant="outline-accent"
                size="lg"
              >
                <Link href="/gear">Browse all gear</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
