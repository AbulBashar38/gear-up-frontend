import { z } from "zod";

const PHONE_PATTERN = /^\+?[0-9\s-]{7,20}$/;

const emailSchema = z
  .email("Enter a valid email address.")
  .trim()
  .toLowerCase();

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters.");

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .regex(PHONE_PATTERN, "Enter a valid phone number (7–20 digits)."),
  password: passwordSchema,
  role: z.enum(["CUSTOMER", "PROVIDER"], {
    error: "Choose a customer or provider account.",
  }),
});
