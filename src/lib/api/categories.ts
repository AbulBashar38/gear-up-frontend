import "server-only";

import { gearUpFetch } from "./server-client";
import type { Category } from "./types";

export function listCategories() {
  return gearUpFetch<Category[]>("/categories", {
    next: {
      revalidate: 60,
      tags: ["categories"],
    },
    fallbackMessage: "Category routes are reconnecting. Try again shortly.",
  });
}
