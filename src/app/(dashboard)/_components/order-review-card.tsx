"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Star } from "lucide-react";
import { toast } from "sonner";
import type { Review, ReviewMutationState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createReviewAction } from "../_actions/review-actions";
import {
  formatDashboardDate,
  formatDashboardRating,
} from "../_utils/dashboard-format";

const INITIAL_STATE: ReviewMutationState = {
  status: "idle",
  message: "",
};

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null;

  return (
    <p
      id={id}
      className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-signal"
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
      {messages[0]}
    </p>
  );
}

export function OrderReviewCard({
  orderId,
  gearItemId,
  gearName,
  existingReview,
  lookupMessage,
}: {
  orderId: string;
  gearItemId: string;
  gearName: string;
  existingReview?: Review | null;
  lookupMessage?: string;
}) {
  const [state, action, pending] = useActionState(
    createReviewAction.bind(null, orderId),
    INITIAL_STATE,
  );
  const submittedReview = state.data ?? existingReview;
  const fields = state.fieldErrors ?? {};
  const values = state.values ?? {};
  const preservedRating = Number(values.rating);
  const [rating, setRating] = useState(
    Number.isInteger(preservedRating * 2) &&
      preservedRating >= 1 &&
      preservedRating <= 5
      ? preservedRating
      : 0,
  );

  useEffect(() => {
    if (state.status === "success" && state.message) {
      toast.success(state.message);
    }
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  if (submittedReview) {
    return (
      <section className="border border-success/35 bg-success/5 p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-success">
              <CheckCircle2 aria-hidden="true" className="size-4" />
              Review submitted
            </p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase">
              Your field report
            </h2>
          </div>
          <div className="border border-success/30 bg-card px-4 py-2 text-right">
            <p className="font-display text-2xl font-black">
              {formatDashboardRating(submittedReview.rating)} / 5
            </p>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-ink/55">
              {formatDashboardDate(submittedReview.createdAt)}
            </p>
          </div>
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-ink/75">
          {submittedReview.comment || "You submitted a rating without a written comment."}
        </p>
        <Button asChild variant="outline" size="compact" className="mt-5">
          <Link href={`/gear/${gearItemId}`}>View {gearName}</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="border border-primary/30 bg-primary/5 p-5 sm:p-7">
      <p className="flex items-center gap-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-signal">
        <Star aria-hidden="true" className="size-4" />
        Returned order // customer review
      </p>
      <h2 className="mt-3 font-display text-3xl font-black uppercase">
        How did {gearName} perform?
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
        Your rating is attached to this returned order and published on the
        gear listing. Each order can be reviewed once.
      </p>

      {lookupMessage && (
        <p className="mt-4 flex items-start gap-2 border border-signal/25 bg-card p-3 text-xs leading-5 text-ink/70">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-signal" />
          {lookupMessage} You can still submit here; the backend will verify
          whether this order already has a review.
        </p>
      )}

      <form action={action} noValidate className="mt-6 grid gap-5">
        <fieldset disabled={pending} className="max-w-sm">
          <legend className="text-sm font-bold">Rating out of 5</legend>
          <div
            className="mt-2 flex w-fit items-center gap-1 border border-ink/15 bg-card p-2"
            aria-invalid={Boolean(fields.rating)}
            aria-describedby={
              fields.rating ? `review-rating-${orderId}-error` : undefined
            }
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const fillPercentage =
                rating >= star ? 100 : rating === star - 0.5 ? 50 : 0;
              const choices =
                star === 1
                  ? [{ value: 1, side: "full" as const }]
                  : [
                      { value: star - 0.5, side: "left" as const },
                      { value: star, side: "right" as const },
                    ];

              return (
                <div key={star} className="relative size-10 shrink-0">
                  <Star
                    aria-hidden="true"
                    className="absolute inset-0 size-10 text-ink/25"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden text-signal transition-[width] duration-150"
                    style={{ width: `${fillPercentage}%` }}
                  >
                    <Star className="size-10 min-w-10 fill-current" />
                  </span>

                  {choices.map((choice) => (
                    <label
                      key={choice.value}
                      title={`${choice.value} star${choice.value === 1 ? "" : "s"}`}
                      className={
                        choice.side === "full"
                          ? "absolute inset-0 z-10 cursor-pointer rounded-sm hover:bg-signal/10 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
                          : choice.side === "left"
                            ? "absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer rounded-l-sm hover:bg-signal/10 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
                            : "absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer rounded-r-sm hover:bg-signal/10 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
                      }
                    >
                      <input
                        type="radio"
                        name="rating"
                        value={choice.value}
                        checked={rating === choice.value}
                        onChange={() => setRating(choice.value)}
                        className="sr-only"
                      />
                      <span className="sr-only">
                        {choice.value} star{choice.value === 1 ? "" : "s"}
                      </span>
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs font-medium text-ink/60" aria-live="polite">
            {rating
              ? `${rating} of 5 stars selected`
              : "Select a star rating to continue. Half stars are supported."}
          </p>
          <FieldError
            id={`review-rating-${orderId}-error`}
            messages={fields.rating}
          />
        </fieldset>

        <div>
          <Label htmlFor={`review-comment-${orderId}`} className="font-bold">
            Field notes <span className="font-normal text-ink/50">(optional)</span>
          </Label>
          <Textarea
            id={`review-comment-${orderId}`}
            name="comment"
            minLength={3}
            maxLength={2000}
            disabled={pending}
            defaultValue={values.comment ?? ""}
            aria-invalid={Boolean(fields.comment)}
            aria-describedby={
              fields.comment
                ? `review-comment-${orderId}-error`
                : `review-comment-${orderId}-hint`
            }
            className="mt-2 min-h-32 bg-card"
            placeholder="What worked well? What should another renter know?"
          />
          <p
            id={`review-comment-${orderId}-hint`}
            className="mt-1.5 text-xs text-ink/55"
          >
            If provided, write 3–2,000 characters.
          </p>
          <FieldError
            id={`review-comment-${orderId}-error`}
            messages={fields.comment}
          />
        </div>

        {state.status === "error" && state.message && (
          <p
            aria-live="polite"
            className="flex items-start gap-2 text-sm font-semibold text-signal"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {state.message}
          </p>
        )}

        <div className="border-t border-ink/12 pt-5">
          <Button type="submit" size="lg" disabled={pending || rating === 0}>
            <Star aria-hidden="true" />
            {pending ? "Publishing review…" : "Publish review"}
          </Button>
        </div>
      </form>
    </section>
  );
}
