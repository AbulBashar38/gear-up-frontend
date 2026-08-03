import "server-only";

export type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type GearItem = {
  id: string;
  categoryId: string;
  providerId: string;
  name: string;
  description: string;
  stock: number;
  isAvailable: boolean;
  pricePerDay: string | number;
  imageUrl: string | null;
  brand: string | null;
  createdAt: string;
  updatedAt: string;
  category: Category;
  provider: {
    id: string;
    name: string;
  };
};

export type Review = {
  id: string;
  rentalOrderId: string;
  gearItemId: string;
  customerId: string;
  rating: string | number;
  comment: string | null;
  createdAt: string;
  gearItem: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
  customer: {
    id: string;
    name: string;
  };
  rentalOrder: {
    id: string;
    status: "RETURNED";
    startDate: string;
    endDate: string;
  };
};

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
};

export type LandingResult<T> =
  | {
      ok: true;
      data: T;
      meta?: ApiEnvelope<T>["meta"];
    }
  | {
      ok: false;
      message: string;
    };

export type GearCatalogQuery = {
  providerId?: string;
  category?: string;
  brand?: string;
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
};

const getApiBaseUrl = () => {
  const apiUrl = process.env.GEARUP_API_URL?.trim();

  if (!apiUrl) {
    return null;
  }

  return apiUrl.replace(/\/+$/, "");
};

async function publicFetch<T>(
  path: string,
  tags: string[],
): Promise<LandingResult<T>> {
  const apiUrl = getApiBaseUrl();

  if (!apiUrl) {
    return {
      ok: false,
      message: "The gear desk is not connected yet.",
    };
  }

  try {
    const response = await fetch(`${apiUrl}${path}`, {
      next: {
        revalidate: 60,
        tags,
      },
    });

    const rawBody = await response.text();
    let payload: ApiEnvelope<T> | null = null;

    try {
      payload = rawBody ? (JSON.parse(rawBody) as ApiEnvelope<T>) : null;
    } catch {
      payload = null;
    }

    if (!response.ok || !payload?.success) {
      return {
        ok: false,
        message: "The gear desk is taking a trail break. Try again shortly.",
      };
    }

    return {
      ok: true,
      data: payload.data,
      meta: payload.meta,
    };
  } catch {
    return {
      ok: false,
      message: "The gear desk is taking a trail break. Try again shortly.",
    };
  }
}

export const getLandingCategories = () =>
  publicFetch<Category[]>("/categories", ["categories"]);

export const getRecentGear = () =>
  publicFetch<GearItem[]>("/gear?page=1&limit=6", ["gear"]);

export const getGearCatalog = (query: GearCatalogQuery = {}) => {
  const params = new URLSearchParams();

  if (query.providerId) params.set("providerId", query.providerId);
  if (query.category) params.set("category", query.category);
  if (query.brand) params.set("brand", query.brand);
  if (query.price !== undefined) params.set("price", String(query.price));
  if (query.minPrice !== undefined) {
    params.set("minPrice", String(query.minPrice));
  }
  if (query.maxPrice !== undefined) {
    params.set("maxPrice", String(query.maxPrice));
  }
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 12));

  return publicFetch<GearItem[]>(`/gear?${params.toString()}`, ["gear"]);
};

export const getRecentReviews = () =>
  publicFetch<Review[]>("/reviews?page=1&limit=3", ["reviews"]);
