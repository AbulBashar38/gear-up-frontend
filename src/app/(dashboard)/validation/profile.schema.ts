import { z } from "zod";

const PHONE_PATTERN = /^\+?[0-9\s-]{7,20}$/;

/**
 * Mirrors the backend `updateAuthUserValidationSchema`. Email, role, and status
 * are not self-editable, so they are absent here rather than ignored later.
 */
export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(255, "Name cannot exceed 255 characters."),
  phone: z
    .string()
    .trim()
    .regex(PHONE_PATTERN, "Enter a valid phone number (7–20 digits)."),
});
