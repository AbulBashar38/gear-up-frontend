import { z } from "zod";
import type { FieldErrors } from "@/lib/types";

export function getZodFieldErrors(error: z.ZodError): FieldErrors {
  const flattened = z.flattenError(error).fieldErrors as Record<
    string,
    string[] | undefined
  >;
  const fieldErrors: FieldErrors = {};

  for (const [field, messages] of Object.entries(flattened)) {
    if (messages?.length) fieldErrors[field] = messages;
  }

  return fieldErrors;
}
