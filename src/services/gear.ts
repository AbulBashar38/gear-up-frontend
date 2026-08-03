import "server-only";

import { gearUpFetch } from "./server-client";
import type { GearCatalogQuery, GearItem } from "@/lib/types";

export function listGear(query: GearCatalogQuery = {}) {
  return gearUpFetch<GearItem[]>("/gear", {
    query: {
      providerId: query.providerId,
      category: query.category,
      brand: query.brand,
      price: query.price,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      page: query.page ?? 1,
      limit: query.limit ?? 12,
    },
    next: {
      revalidate: 60,
      tags: ["gear"],
    },
    fallbackMessage: "The gear catalog is reconnecting. Try again shortly.",
  });
}
