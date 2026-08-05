import "server-only";

import { gearUpFetch } from "./server-client";
import type { Review, ReviewListQuery } from "@/lib/types";

export function listReviews(query: ReviewListQuery = {}) {
  return gearUpFetch<Review[]>("/reviews", {
    query: {
      gearItemId: query.gearItemId,
      rating: query.rating,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    },
    next: {
      revalidate: 60,
      tags: ["reviews"],
    },
    fallbackMessage: "Field reports are reconnecting. Try again shortly.",
  });
}

export function deleteReview(id: string) {
  return gearUpFetch<Review>(`/reviews/${id}`, {
    method: "DELETE",
    auth: true,
    cache: "no-store",
    fallbackMessage: "The review couldn't be deleted. Try again shortly.",
  });
}
