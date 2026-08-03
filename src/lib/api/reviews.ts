import "server-only";

import { gearUpFetch } from "./server-client";
import type { Review, ReviewListQuery } from "./types";

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
