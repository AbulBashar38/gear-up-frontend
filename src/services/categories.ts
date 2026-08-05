import "server-only";

import { gearUpFetch } from "./server-client";
import type { Category } from "@/lib/types";

export function listCategories() {
  return gearUpFetch<Category[]>("/categories", {
    next: {
      revalidate: 60,
      tags: ["categories"],
    },
    fallbackMessage: "Category routes are reconnecting. Try again shortly.",
  });
}

export function createCategory(name: string) {
  return gearUpFetch<Category>("/categories", {
    method: "POST",
    auth: true,
    cache: "no-store",
    json: { name },
    fallbackMessage: "The category couldn't be created. Try again shortly.",
  });
}

export function updateCategory(id: string, name: string) {
  return gearUpFetch<Category>(`/categories/${id}`, {
    method: "PATCH",
    auth: true,
    cache: "no-store",
    json: { name },
    fallbackMessage: "The category couldn't be renamed. Try again shortly.",
  });
}

export function deleteCategory(id: string) {
  return gearUpFetch<Category>(`/categories/${id}`, {
    method: "DELETE",
    auth: true,
    cache: "no-store",
    fallbackMessage: "The category couldn't be deleted. Try again shortly.",
  });
}
