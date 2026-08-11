import "server-only";

import { gearUpFetch } from "./server-client";
import type {
  CreateGearInput,
  GearCatalogQuery,
  GearDetail,
  GearItem,
  UpdateGearInput,
} from "@/lib/types";

export function listGear(query: GearCatalogQuery = {}) {
  return gearUpFetch<GearItem[]>("/gear", {
    query: {
      providerId: query.providerId,
      search: query.search,
      category: query.category,
      brand: query.brand,
      price: query.price,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      isAvailable: query.isAvailable,
      inStock: query.inStock,
      startDate: query.startDate,
      endDate: query.endDate,
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

export function getGearItem(id: string) {
  return gearUpFetch<GearDetail>(`/gear/${id}`, {
    next: {
      revalidate: 60,
      tags: ["gear", `gear:${id}`],
    },
    fallbackMessage: "The gear listing couldn't be loaded. Try again shortly.",
  });
}

export function createGearItem(input: CreateGearInput) {
  return gearUpFetch<GearItem>("/gear", {
    method: "POST",
    auth: true,
    cache: "no-store",
    json: input,
    fallbackMessage: "The gear listing couldn't be created. Try again shortly.",
  });
}

export function updateGearItem(id: string, input: UpdateGearInput) {
  return gearUpFetch<GearItem>(`/gear/${id}`, {
    method: "PATCH",
    auth: true,
    cache: "no-store",
    json: input,
    fallbackMessage: "The gear listing couldn't be updated. Try again shortly.",
  });
}

export function deleteGearItem(id: string) {
  return gearUpFetch<GearItem>(`/gear/${id}`, {
    method: "DELETE",
    auth: true,
    cache: "no-store",
    fallbackMessage: "The gear listing couldn't be deleted. Try again shortly.",
  });
}
