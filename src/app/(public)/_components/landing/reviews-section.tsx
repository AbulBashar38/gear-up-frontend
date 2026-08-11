import { BadgeCheck, Quote, Star, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listReviews } from "@/services/reviews";
import { Reveal } from "./motion-primitives";

const formatName = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const formatRating = (value: string | number) => {
  const rating = Number(value);

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return null;
  }

  return rating.toFixed(1);
};

export async function ReviewsSection() {
  const reviews = await listReviews({ page: 1, limit: 3 });
  const returnedReviews = reviews.ok
    ? reviews.data.filter((review) => review.rentalOrder.status === "RETURNED")
    : [];
  const hasReviews = returnedReviews.length > 0;

  return (
    <section
      aria-labelledby="reviews-title"
      className="bg-paper py-20 text-ink sm:py-28"
    >
      <div className="mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <Reveal>
          <div className="grid gap-8 border-b border-ink/20 pb-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="section-kicker">Verified customer reviews</p>
              <h2
                id="reviews-title"
                className="mt-4 font-display text-[clamp(3.6rem,7vw,7.2rem)] font-black uppercase leading-[0.82] tracking-[-0.05em]"
              >
                Used hard.
                <br />
                Reviewed honestly.
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-ink/70 sm:text-base sm:leading-7 lg:col-span-4">
              Customers can review gear only after the related order is marked
              Returned, so every rating comes from a completed rental.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-12">
          {!reviews.ok ? (
            <Reveal className="lg:col-span-8">
              <Alert
                variant="destructive"
                className="min-h-80 content-center rounded-none p-8 text-left"
              >
                <TriangleAlert aria-hidden="true" className="size-6" />
                <AlertTitle className="font-display text-3xl font-black uppercase">
                  {reviews.error.retryable
                    ? "Field reports are temporarily offline."
                    : "Field reports could not be loaded."}
                </AlertTitle>
                <AlertDescription className="mt-2 max-w-xl leading-6">
                  {reviews.error.message}
                </AlertDescription>
              </Alert>
            </Reveal>
          ) : hasReviews ? (
            returnedReviews.map((review, index) => {
              const rating = formatRating(review.rating);
              const comment = review.comment?.trim();

              return (
                <Reveal
                  key={review.id}
                  delay={index * 0.08}
                  className={index === 0 ? "lg:col-span-8" : "lg:col-span-4"}
                >
                  <Card
                    asChild
                    className="surface-inverse relative h-full gap-0 rounded-none bg-ink py-0 text-paper ring-0 shadow-none"
                  >
                    <article>
                      <div
                        aria-hidden="true"
                        className="route-grid absolute inset-0 opacity-20"
                      />
                      <CardContent className="relative p-7 sm:p-10">
                        <div className="flex items-start justify-between gap-6">
                          {comment ? (
                            <Quote
                              aria-hidden="true"
                              className="size-10 fill-orange text-orange"
                            />
                          ) : (
                            <Star
                              aria-hidden="true"
                              className="size-10 fill-orange text-orange"
                            />
                          )}
                          <Badge className="flex min-h-10 rounded-none bg-lime px-3 py-2 text-ink hover:bg-lime">
                            {rating ? (
                              <>
                                <Star
                                  aria-hidden="true"
                                  className="size-4 fill-ink"
                                />
                                <span className="font-display text-xl font-black">
                                  {rating}
                                </span>
                                <span className="text-[0.58rem] font-bold uppercase tracking-[0.14em]">
                                  / 5
                                </span>
                              </>
                            ) : (
                              <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em]">
                                Rating unavailable
                              </span>
                            )}
                          </Badge>
                        </div>
                        {comment ? (
                          <blockquote className="mt-14 max-w-3xl font-display text-[clamp(2.2rem,4.5vw,4.8rem)] font-bold uppercase leading-[0.94] tracking-[-0.035em]">
                            “{comment}”
                          </blockquote>
                        ) : (
                          <div className="mt-14 max-w-2xl">
                            <p className="font-display text-[clamp(2.2rem,4.5vw,4.8rem)] font-bold uppercase leading-[0.94] tracking-[-0.035em]">
                              Rating submitted without a comment
                            </p>
                            <p className="mt-5 text-sm leading-6 text-paper/70">
                              This customer submitted a score without a written
                              comment.
                            </p>
                          </div>
                        )}
                        <footer className="mt-10 flex flex-col justify-between gap-4 border-t border-paper/15 pt-5 sm:flex-row sm:items-end">
                          <div>
                            <p className="font-bold">
                              {formatName(review.customer.name)}
                            </p>
                            <p className="mt-1 text-xs text-paper/60">
                              Rented {review.gearItem.name}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="h-auto rounded-none border-lime/40 bg-transparent px-2 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-lime"
                          >
                            <BadgeCheck aria-hidden="true" className="size-4" />
                            Completed rental
                          </Badge>
                        </footer>
                      </CardContent>
                    </article>
                  </Card>
                </Reveal>
              );
            })
          ) : (
            <Reveal className="lg:col-span-8">
              <Card className="grid min-h-80 place-items-center gap-0 rounded-none border border-dashed border-ink/25 bg-white/30 p-8 py-8 text-center ring-0 shadow-none">
                <div>
                  <Quote aria-hidden="true" className="mx-auto size-10 text-signal" />
                  <h3 className="mt-4 font-display text-4xl font-black uppercase">
                    The first review is on its way.
                  </h3>
                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-ink/70">
                    Once a rental is returned, the customer can leave one
                    verified review.
                  </p>
                </div>
              </Card>
            </Reveal>
          )}

          <Reveal className="lg:col-span-4">
            <Card
              asChild
              className="surface-accent gear-tag h-full min-h-80 gap-0 rounded-none bg-lime py-0 text-ink ring-0 shadow-none"
            >
              <aside>
                <CardContent className="flex h-full flex-col justify-between p-7 sm:p-9">
                  <div>
                    <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em] text-ink/70">
                      Why reviews are reliable
                    </p>
                    <h3 className="mt-8 font-display text-5xl font-black uppercase leading-[0.86] tracking-[-0.04em]">
                      One order.
                      <br />
                      One review.
                      <br />
                      After return.
                    </h3>
                  </div>
                  <p className="mt-8 border-t border-ink/20 pt-5 text-xs font-bold leading-5 text-ink/70">
                    Each returned order can be reviewed once, helping future
                    renters choose gear with more confidence.
                  </p>
                </CardContent>
              </aside>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function ReviewsSkeleton() {
  return (
    <section
      aria-label="Loading customer reviews"
      className="bg-paper py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <Skeleton className="h-4 w-48 rounded-none bg-ink/10" />
        <Skeleton className="mt-6 h-28 max-w-3xl rounded-none bg-ink/10" />
        <div className="mt-10 grid gap-5 lg:grid-cols-12">
          <Skeleton className="h-96 rounded-none bg-ink/10 lg:col-span-8" />
          <Skeleton className="h-96 rounded-none bg-ink/10 lg:col-span-4" />
        </div>
      </div>
    </section>
  );
}
