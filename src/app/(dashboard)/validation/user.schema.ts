import { z } from "zod";

/** Mirrors the backend `userIdValidationSchema` UUID param check. */
export const userIdSchema = z.uuid("This account reference is not valid.");
