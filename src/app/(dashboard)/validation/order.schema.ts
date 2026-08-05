import { z } from "zod";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isRealDateOnly(value: string) {
  if (!DATE_ONLY_PATTERN.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function todayUtcDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

const dateOnlySchema = z
  .string()
  .trim()
  .refine(isRealDateOnly, "Choose a valid date.");

export const createRentalOrderFormSchema = z
  .object({
    gearItemId: z.uuid("The selected gear item is not valid."),
    startDate: dateOnlySchema,
    endDate: dateOnlySchema,
    quantity: z
      .string()
      .trim()
      .regex(/^\d+$/, "Quantity must be a whole number.")
      .transform(Number)
      .pipe(z.number().int().min(1, "Quantity must be at least 1.")),
  })
  .superRefine((value, context) => {
    if (value.startDate < todayUtcDateOnly()) {
      context.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Start date cannot be in the past.",
      });
    }

    if (value.endDate < value.startDate) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be on or after the start date.",
      });
    }
  });

export const rentalOrderGearQuerySchema = z.uuid(
  "Choose a valid gear item before requesting a rental.",
);
