import { Compass, MoveLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GearItemNotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="relative grid min-h-[80dvh] place-items-center overflow-hidden bg-paper px-5 pb-20 pt-36 text-ink">
      <div aria-hidden="true" className="topo-lines absolute inset-0 opacity-30" />
      <section className="relative w-full max-w-3xl border border-ink/15 bg-paper/90 p-7 sm:p-12">
        <span className="grid size-12 place-items-center bg-pine text-lime"><Compass aria-hidden="true" className="size-5" /></span>
        <p className="mt-12 font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-signal">Listing not found // 404</p>
        <h1 className="mt-3 font-display text-5xl font-black uppercase leading-[0.86] sm:text-7xl">This gear left the locker.</h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-ink/65">The listing may have been removed, or the address is invalid. Browse the current catalog for another field-ready option.</p>
        <Button asChild variant="primary" size="lg" className="mt-7"><Link href="/gear"><MoveLeft aria-hidden="true" />Browse current gear</Link></Button>
      </section>
    </main>
  );
}
