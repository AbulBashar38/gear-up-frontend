"use client";

import {
  BadgeCheck,
  CalendarDays,
  CreditCard,
  Search,
} from "lucide-react";
import { m, useReducedMotion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Browse gear",
    copy: "Search by keyword, category, brand, daily price, and rental dates.",
    icon: Search,
  },
  {
    number: "02",
    title: "Choose dates",
    copy:
      "Select your rental window and quantity, then send a request. Stock is not reserved yet.",
    icon: CalendarDays,
  },
  {
    number: "03",
    title: "Wait for confirmation",
    copy:
      "The provider checks stock for your dates and confirms when the order is ready to pay.",
    icon: BadgeCheck,
  },
  {
    number: "04",
    title: "Pay and pick up",
    copy:
      "After confirmation, pay through Stripe Checkout and follow the order status through return.",
    icon: CreditCard,
  },
];

export function RentalFlow() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="rental-flow"
      aria-labelledby="flow-title"
      className="scroll-mt-20 overflow-hidden bg-mist py-20 text-ink sm:py-28"
    >
      <div className="mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-8 border-b border-ink/20 pb-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="section-kicker">How renting works</p>
            <h2
              id="flow-title"
              className="mt-4 font-display text-[clamp(3.5rem,7vw,7.2rem)] font-black uppercase leading-[0.82] tracking-[-0.05em]"
            >
              From browsing
              <br />
              to pickup.
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-ink/70 sm:text-base sm:leading-7 lg:col-span-4">
            Browse without an account. Sign in when you are ready to request,
            then pay only after the provider confirms your dates and quantity.
          </p>
        </div>

        <div className="relative mt-14 grid gap-8 md:grid-cols-4 md:gap-5">
          <div
            aria-hidden="true"
            className="absolute left-7 top-7 hidden h-px w-[calc(100%-3.5rem)] bg-ink/20 md:block"
          />
          <m.div
            aria-hidden="true"
            className="absolute left-7 top-7 hidden h-[3px] w-[calc(100%-3.5rem)] origin-left bg-orange md:block"
            initial={prefersReducedMotion ? false : { scaleX: 0 }}
            whileInView={prefersReducedMotion ? undefined : { scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
          <div
            aria-hidden="true"
            className="absolute bottom-7 left-7 top-7 w-px bg-ink/20 md:hidden"
          />
          <m.div
            aria-hidden="true"
            className="absolute bottom-7 left-7 top-7 w-[3px] origin-top bg-orange md:hidden"
            initial={prefersReducedMotion ? false : { scaleY: 0 }}
            whileInView={prefersReducedMotion ? undefined : { scaleY: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <m.article
                key={step.number}
                className="relative grid grid-cols-[3.5rem_1fr] gap-5 md:block"
                initial={
                  prefersReducedMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 20,
                      }
                }
                whileInView={
                  prefersReducedMotion
                    ? undefined
                    : {
                        opacity: 1,
                        y: 0,
                      }
                }
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
              >
                <div className="relative z-10 grid size-14 place-items-center border-4 border-mist bg-[var(--brand-ink)] text-lime">
                  <Icon aria-hidden="true" className="size-5" />
                </div>
                <div className="border-t border-ink/15 pt-4 md:mt-9">
                  <p className="font-mono text-[0.62rem] font-bold tracking-[0.18em] text-signal">
                    STEP {step.number}
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-black uppercase tracking-[-0.035em]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-ink/70">
                    {step.copy}
                  </p>
                </div>
              </m.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
