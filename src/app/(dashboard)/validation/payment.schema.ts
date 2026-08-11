import { z } from "zod";

/** Mirrors the backend `paymentIdValidationSchema` UUID param check. */
export const paymentIdSchema = z.uuid("This payment reference is not valid.");
