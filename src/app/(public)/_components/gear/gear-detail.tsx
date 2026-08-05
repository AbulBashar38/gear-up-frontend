import {
  ArrowLeft,
  BadgeCheck,
  Boxes,
  Clock3,
  PackageCheck,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { GearDetail as GearDetailType } from "@/lib/types";
import { getTrustedGearImageUrl } from "../../_utils/gear-image";
import { Reveal } from "../landing/motion-primitives";
import { formatGearPrice, GearIcon } from "./gear-card";
import { RentalRequestCard } from "./rental-request-card";

function formatReviewDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getRating(value: string | number) {
  const rating = Number(value);
  return Number.isFinite(rating) && rating >= 1 && rating <= 5 ? rating : null;
}

export function GearDetail({ gear }: { gear: GearDetailType }) {
  const canRequest = gear.isAvailable && gear.stock > 0;
  const imageUrl = getTrustedGearImageUrl(gear.imageUrl);
  const ratings = gear.reviews
    .map((review) => getRating(review.rating))
    .filter((rating): rating is number => rating !== null);
  const averageRating = ratings.length
    ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length
    : null;

  return (
    <main id="main-content" tabIndex={-1} className="bg-paper text-ink">
      <section className="surface-inverse relative overflow-hidden bg-background pb-14 pt-32 text-foreground sm:pb-20 sm:pt-36">
        <div aria-hidden="true" className="route-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12">
          <Button asChild variant="outline" size="compact">
            <Link href="/gear">
              <ArrowLeft aria-hidden="true" />
              Back to gear locker
            </Link>
          </Button>

          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-stretch">
            <Reveal className="lg:col-span-7">
              <div className="relative min-h-[25rem] overflow-hidden border border-paper/15 bg-orange text-ink sm:min-h-[34rem]">
                <div aria-hidden="true" className="route-grid absolute inset-0 opacity-35" />
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={gear.name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <GearIcon gear={gear} className="size-44 sm:size-64" />
                  </div>
                )}
                <Badge
                  variant="outline"
                  className="absolute bottom-5 left-5 h-auto rounded-none border-current/35 bg-paper/90 px-3 py-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-ink"
                >
                  {imageUrl ? "Provider photo" : "Catalog field visual"}
                </Badge>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="flex lg:col-span-5">
              <div className="flex w-full flex-col border border-paper/15 bg-pine p-6 sm:p-9">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={canRequest ? "success" : "destructive"}
                    className="h-auto rounded-none px-3 py-1.5 text-[0.62rem] font-extrabold uppercase tracking-[0.14em]"
                  >
                    {canRequest ? "Open for requests" : "Currently paused"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="h-auto rounded-none border-paper/30 px-3 py-1.5 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-paper"
                  >
                    {gear.category.name}
                  </Badge>
                </div>

                <p className="mt-8 font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em] text-lime">
                  {gear.brand || "Independent gear"}
                  <span aria-hidden="true"> / </span>
                  {gear.provider.name}
                </p>
                <h1 className="mt-4 font-display text-[clamp(4rem,7vw,7.5rem)] font-black uppercase leading-[0.78] tracking-[-0.055em]">
                  {gear.name}
                </h1>

                <div className="mt-auto grid gap-5 border-t border-paper/15 pt-7 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div>
                    <p className="font-display text-5xl font-black tracking-[-0.04em] text-lime">
                      {formatGearPrice(gear.pricePerDay)}
                    </p>
                    <p className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-paper/60">
                      Per rental day
                    </p>
                  </div>
                  <div className="border-l-2 border-orange pl-4">
                    <p className="font-display text-3xl font-black uppercase">
                      {gear.stock} {gear.stock === 1 ? "unit" : "units"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-paper/60">
                      Listed stock. Date-specific availability is confirmed after
                      a request.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto grid w-full max-w-[90rem] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="section-kicker">Field notes // listing brief</p>
              <h2 className="mt-4 font-display text-[clamp(3.5rem,7vw,6.5rem)] font-black uppercase leading-[0.82] tracking-[-0.05em]">
                Know the kit
                <br />
                before the trip.
              </h2>
              <p className="mt-8 max-w-3xl whitespace-pre-line text-base leading-8 text-ink/75 sm:text-lg">
                {gear.description}
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <dl className="mt-12 grid border-l border-t border-ink/20 sm:grid-cols-2">
                <div className="border-b border-r border-ink/20 p-5 sm:p-6">
                  <dt className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-signal">
                    Category
                  </dt>
                  <dd className="mt-2 font-display text-3xl font-black uppercase">
                    {gear.category.name}
                  </dd>
                </div>
                <div className="border-b border-r border-ink/20 p-5 sm:p-6">
                  <dt className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-signal">
                    Brand
                  </dt>
                  <dd className="mt-2 font-display text-3xl font-black uppercase">
                    {gear.brand || "Not specified"}
                  </dd>
                </div>
                <div className="border-b border-r border-ink/20 p-5 sm:p-6">
                  <dt className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-signal">
                    Provider
                  </dt>
                  <dd className="mt-2 flex items-center gap-2 font-display text-3xl font-black uppercase">
                    <UserRound aria-hidden="true" className="size-5" />
                    {gear.provider.name}
                  </dd>
                </div>
                <div className="border-b border-r border-ink/20 p-5 sm:p-6">
                  <dt className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-signal">
                    Request status
                  </dt>
                  <dd className="mt-2 font-display text-3xl font-black uppercase">
                    {canRequest ? "Accepting requests" : "Not available"}
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>

          <aside className="lg:col-span-5">
            <Reveal className="lg:sticky lg:top-28">
              <RentalRequestCard gearId={gear.id} canRequest={canRequest} />
            </Reveal>
          </aside>
        </div>
      </section>

      <section className="surface-inverse bg-background py-16 text-foreground sm:py-24" aria-labelledby="rental-flow-title">
        <div className="mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.24em] text-lime">
              Rental protocol // three checkpoints
            </p>
            <h2 id="rental-flow-title" className="mt-4 font-display text-[clamp(3.5rem,7vw,6.5rem)] font-black uppercase leading-[0.82] tracking-[-0.05em]">
              Request. Confirm. Go.
            </h2>
          </Reveal>
          <div className="mt-10 grid border-l border-t border-paper/15 md:grid-cols-3">
            {[
              { code: "01", title: "Send dates", copy: "Choose your rental dates and quantity. The request begins in PLACED status.", icon: Clock3 },
              { code: "02", title: "Provider checks", copy: "The provider verifies date-aware stock, then confirms or cancels the request.", icon: PackageCheck },
              { code: "03", title: "Pay securely", copy: "After confirmation, Stripe Checkout handles payment before pickup.", icon: ShieldCheck },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.code} delay={index * 0.07}>
                  <article className="min-h-64 border-b border-r border-paper/15 p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-5">
                      <span className="font-mono text-xs font-bold text-orange">GU—{step.code}</span>
                      <Icon aria-hidden="true" className="size-7 text-lime" />
                    </div>
                    <h3 className="mt-16 font-display text-4xl font-black uppercase">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-paper/65">{step.copy}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-mist py-16 sm:py-24" aria-labelledby="gear-reviews-title">
        <div className="mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <div className="grid gap-6 border-b border-ink/20 pb-7 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="section-kicker">Field reports // completed rentals</p>
                <h2 id="gear-reviews-title" className="mt-4 font-display text-[clamp(3.5rem,7vw,6.5rem)] font-black uppercase leading-[0.82] tracking-[-0.05em]">
                  What renters report.
                </h2>
              </div>
              <div className="lg:col-span-4 lg:text-right">
                <p className="font-display text-5xl font-black">
                  {averageRating === null ? "—" : averageRating.toFixed(1)}
                  <span className="text-xl text-ink/55"> / 5</span>
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-ink/60">
                  {gear.reviews.length} {gear.reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          </Reveal>

          {gear.reviews.length > 0 ? (
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {gear.reviews.map((review, index) => {
                const rating = getRating(review.rating);
                return (
                  <Reveal key={review.id} delay={Math.min(index, 4) * 0.06}>
                    <Card asChild className="h-full gap-0 rounded-none bg-paper py-0 text-ink ring-1 ring-ink/10 shadow-none">
                      <article>
                        <CardContent className="flex h-full flex-col p-6 sm:p-8">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex gap-1 text-orange" aria-label={rating === null ? "Rating unavailable" : `${rating} out of 5 stars`}>
                              {Array.from({ length: 5 }, (_, star) => (
                                <Star key={star} aria-hidden="true" className={star < Math.round(rating ?? 0) ? "size-4 fill-current" : "size-4 text-ink/20"} />
                              ))}
                            </div>
                            <Badge variant="outline" className="h-auto rounded-none border-success/30 px-2 py-1 text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-success">
                              <BadgeCheck aria-hidden="true" />
                              Returned rental
                            </Badge>
                          </div>
                          <blockquote className="mt-8 font-display text-3xl font-bold uppercase leading-[1.02] sm:text-4xl">
                            {review.comment?.trim() ? `“${review.comment.trim()}”` : "Rating-only field report"}
                          </blockquote>
                          <footer className="mt-auto flex items-end justify-between gap-4 border-t border-ink/15 pt-6 text-xs">
                            <div>
                              <p className="font-extrabold text-ink">{review.customer.name}</p>
                              <p className="mt-1 text-ink/55">Verified GearUp customer</p>
                            </div>
                            <time dateTime={review.createdAt} className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] text-ink/55">
                              {formatReviewDate(review.createdAt)}
                            </time>
                          </footer>
                        </CardContent>
                      </article>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <Reveal>
              <Card className="mt-8 grid min-h-72 place-items-center gap-0 rounded-none border border-dashed border-ink/25 bg-paper/60 p-8 py-8 text-center ring-0 shadow-none">
                <div>
                  <Boxes aria-hidden="true" className="mx-auto size-10 text-signal" />
                  <h3 className="mt-4 font-display text-4xl font-black uppercase">No field reports yet.</h3>
                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-ink/70">
                    A customer can review this item after their rental reaches RETURNED.
                  </p>
                </div>
              </Card>
            </Reveal>
          )}
        </div>
      </section>
    </main>
  );
}
