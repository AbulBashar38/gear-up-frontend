import "server-only";

import { gearUpFetch } from "./server-client";
import type {
  ApiResult,
  CreateReviewInput,
  Review,
  ReviewListQuery,
} from "@/lib/types";

export function listReviews(query: ReviewListQuery = {}) {
  return gearUpFetch<Review[]>("/reviews", {
    query: {
      search: query.search,
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

export function createReview(input: CreateReviewInput) {
  return gearUpFetch<Review>("/reviews", {
    method: "POST",
    auth: true,
    cache: "no-store",
    json: input,
    fallbackMessage:
      "Your review couldn't be submitted. Check the rating and try again.",
  });
}

/**
 * The backend exposes review filtering by gear item, but not by order. Walk the
 * gear item's paginated reviews until the exact rental order is found so a
 * refreshed order page can distinguish a submitted review from an eligible
 * returned order without inventing client-side review state.
 */
export async function findReviewForOrder(
  gearItemId: string,
  orderId: string,
): Promise<ApiResult<Review | null>> {
  const limit = 100;
  let page = 1;

  while (true) {
    const result = await listReviews({ gearItemId, page, limit });
    if (!result.ok) return result;

    const review = result.data.find(
      (candidate) => candidate.rentalOrder.id === orderId,
    );
    if (review) {
      return {
        ok: true,
        status: result.status,
        message: "Review retrieved successfully",
        data: review,
      };
    }

    const total = result.meta?.total ?? result.data.length;
    if (page * limit >= total) {
      return {
        ok: true,
        status: result.status,
        message: "No review has been submitted for this order",
        data: null,
      };
    }

    page += 1;
  }
}
