import { z } from "zod";

export const createReviewFormSchema = z.object({
  orderId: z.uuid("This order reference is not valid."),
  rating: z.coerce
    .number<number>("Choose a rating between 1 and 5.")
    .min(1, "Rating must be at least 1.")
    .max(5, "Rating cannot exceed 5.")
    .multipleOf(0.1, "Rating can have at most one decimal place."),
  comment: z
    .string()
    .trim()
    .max(2000, "Comment cannot exceed 2,000 characters.")
    .refine(
      (value) => value.length === 0 || value.length >= 3,
      "Comment must be at least 3 characters when provided.",
    )
    .transform((value) => value || undefined),
});
