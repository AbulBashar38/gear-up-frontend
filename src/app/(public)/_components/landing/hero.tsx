import { ArrowDown, ArrowUpRight, BadgeCheck, CreditCard, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./motion-primitives";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate min-h-[760px] overflow-hidden bg-ink text-paper sm:min-h-[820px] lg:min-h-[900px]"
    >
      <Image
        src="/images/gearup-hero.webp"
        alt="Two friends exchange a cycling helmet beside a mountain bike at a forest lake trailhead."
        fill
        preload
        sizes="100vw"
        className="object-cover object-[64%_center] lg:object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,25,18,0.98)_0%,rgba(8,25,18,0.92)_36%,rgba(8,25,18,0.28)_70%,rgba(8,25,18,0.08)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(8,25,18,0.78)_0%,rgba(8,25,18,0.22)_43%,rgba(8,25,18,0.94)_79%,#081912_100%)]"
      />
      <div
        aria-hidden="true"
        className="route-grid absolute inset-0 opacity-35"
      />

      <div className="relative mx-auto grid min-h-[760px] w-full max-w-[90rem] grid-cols-1 items-end px-5 pb-8 pt-28 sm:min-h-[820px] sm:px-8 sm:pb-10 lg:min-h-[900px] lg:grid-cols-12 lg:items-center lg:px-12 lg:pb-24 lg:pt-32">
        <div className="z-10 lg:col-span-7 lg:max-w-[50rem]">
          <Reveal>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-orange" />
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.28em] text-lime">
                GearUp field access // dispatch 01
              </p>
            </div>
          </Reveal>

          <h1
            id="hero-title"
            className="font-display text-[clamp(4.25rem,10.4vw,9.5rem)] font-black uppercase leading-[0.78] tracking-[-0.055em]"
          >
            <span className="block overflow-hidden pb-[0.08em]">
              <Reveal as="span" className="block" distance={42}>
                Own the
              </Reveal>
            </span>
            <span className="block overflow-hidden pb-[0.08em] text-lime">
              <Reveal as="span" className="block" delay={0.08} distance={42}>
                weekend.
              </Reveal>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <Reveal as="span" className="block" delay={0.16} distance={42}>
                Not the gear.
              </Reveal>
            </span>
          </h1>

          <Reveal delay={0.22}>
            <p className="mt-7 max-w-[37rem] text-base leading-7 text-paper/72 sm:text-lg sm:leading-8">
              Request proven sports and outdoor gear by the day. Your provider
              confirms the dates, then Stripe handles the payment securely.
            </p>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="notch-button min-h-14 rounded-none bg-lime px-7 text-sm font-extrabold text-ink transition-transform duration-300 hover:-translate-y-1 hover:bg-lime/90"
              >
                <Link href="/gear">
                  Explore the locker
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="min-h-14 rounded-none border-paper/35 bg-ink/20 px-7 text-sm font-extrabold text-paper backdrop-blur-sm hover:border-orange hover:bg-orange hover:text-ink"
              >
                <Link href="/#providers">Put your gear to work</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.34}>
            <ul className="mt-9 grid max-w-[45rem] gap-3 border-t border-paper/15 pt-5 text-xs font-semibold text-paper/65 sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <BadgeCheck aria-hidden="true" className="size-4 text-orange" />
                Provider-confirmed dates
              </li>
              <li className="flex items-center gap-2">
                <CreditCard aria-hidden="true" className="size-4 text-orange" />
                Secure Stripe Checkout
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="size-4 text-orange" />
                Reviews after return
              </li>
            </ul>
          </Reveal>
        </div>

        <Reveal
          delay={0.4}
          className="absolute bottom-28 right-5 hidden w-[15rem] rotate-2 lg:block xl:right-12"
        >
          <aside className="gear-tag bg-orange p-5 text-ink shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <div className="mb-4 flex items-center justify-between border-b border-ink/20 pb-3 font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em]">
              <span>Field note</span>
              <span>GU—001</span>
            </div>
            <p className="font-display text-3xl font-black uppercase leading-[0.9] tracking-[-0.03em]">
              Request.
              <br />
              Confirm.
              <br />
              Go.
            </p>
            <p className="mt-4 text-xs font-bold leading-5">
              Payment only follows provider confirmation.
            </p>
          </aside>
        </Reveal>

        <Link
          href="/gear"
          className="absolute bottom-6 right-5 flex min-h-11 items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-[0.22em] text-paper/55 transition-colors hover:text-lime sm:right-8 lg:bottom-9 lg:right-auto lg:left-12"
        >
          Scroll to dispatch
          <ArrowDown aria-hidden="true" className="size-4 text-orange" />
        </Link>
      </div>
    </section>
  );
}
