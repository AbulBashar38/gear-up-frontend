import { z } from "zod";
import {
  GEAR_IMAGE_MAX_BYTES,
  GEAR_IMAGE_MAX_FILES,
  GEAR_IMAGE_MIME_TYPES,
} from "@/lib/image-upload";

const PHONE_PATTERN = /^\+?[0-9\s-]{7,20}$/;

export const createAdminFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(255, "Name cannot exceed 255 characters."),
  email: z
    .email("Enter a valid email address.")
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .trim()
    .regex(PHONE_PATTERN, "Enter a valid phone number (7–20 digits)."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),
});

export const userStatusFormSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"], {
    error: "Choose active, inactive, or suspended.",
  }),
});

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters.")
    .max(255, "Category name cannot exceed 255 characters."),
});

export const adminOrderStatusFormSchema = z.object({
  status: z.enum(["CONFIRMED", "PICKED_UP", "RETURNED", "CANCELLED"], {
    error: "Choose a valid order transition. Paid status is webhook-only.",
  }),
});

const stockSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, "Stock must be a non-negative integer.")
  .transform(Number)
  .pipe(z.number().int().nonnegative());

const priceSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.length > 0 && Number.isFinite(Number(value)),
    "Enter a valid daily price.",
  )
  .transform(Number)
  .pipe(
    z
      .number()
      .positive("Enter a daily price greater than 0.")
      .max(99999999.99, "Price per day is too large."),
  );

const gearImagesSchema = z
  .array(
    z.custom<File>(
      (value) => typeof File !== "undefined" && value instanceof File,
    ),
  )
  .max(
    GEAR_IMAGE_MAX_FILES,
    `Choose no more than ${GEAR_IMAGE_MAX_FILES} images.`,
  )
  .superRefine((files, context) => {
    if (
      files.some(
        (file) =>
          !GEAR_IMAGE_MIME_TYPES.some((type) => type === file.type),
      )
    ) {
      context.addIssue({
        code: "custom",
        message: "Use only JPEG, PNG, WebP, or AVIF images.",
      });
    }
    if (
      files.some(
        (file) => file.size === 0 || file.size > GEAR_IMAGE_MAX_BYTES,
      )
    ) {
      context.addIssue({
        code: "custom",
        message: "Each image must be 5 MB or smaller.",
      });
    }
  });

const optionalBrandSchema = z
  .string()
  .trim()
  .max(255, "Brand cannot exceed 255 characters.")
  .transform((value) => value || null);

const gearFields = {
  categoryId: z.uuid("Choose a valid category."),
  name: z
    .string()
    .trim()
    .min(2, "Gear item name must be at least 2 characters.")
    .max(255, "Gear item name cannot exceed 255 characters."),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters."),
  stock: stockSchema,
  pricePerDay: priceSchema,
  brand: optionalBrandSchema,
  images: gearImagesSchema,
  isAvailable: z.boolean(),
};

export const createGearFormSchema = z.object({
  ...gearFields,
  providerId: z.uuid("Choose an active provider."),
});

export const updateGearFormSchema = z.object(gearFields);

export function idSchema(label: string) {
  return z.uuid(`${label} is not valid.`);
}
