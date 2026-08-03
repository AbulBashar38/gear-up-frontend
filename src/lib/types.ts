export type DecimalValue = string | number;

export type ApiMeta = {
  page: number;
  limit: number;
  total: number;
};

export type ApiValidationIssue = {
  path: string;
  message: string;
};

export type ApiSuccess<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: ApiMeta;
};

export type ApiFailure = {
  success: false;
  statusCode: number;
  name?: string;
  message: string;
  errorDetails?: unknown;
  path?: string;
  date?: string;
};

export type FieldErrors = Record<string, string[]>;

export type ApiProblem = {
  status: number | null;
  code: "configuration" | "network" | "http" | "invalid-response";
  message: string;
  fieldErrors?: FieldErrors;
  retryable: boolean;
};

export type ApiResult<T> =
  | {
      ok: true;
      status: number;
      message: string;
      data: T;
      meta?: ApiMeta;
    }
  | {
      ok: false;
      error: ApiProblem;
    };

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
  pricePerDay: DecimalValue;
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
  rating: DecimalValue;
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

export type ReviewListQuery = {
  gearItemId?: string;
  rating?: number;
  page?: number;
  limit?: number;
};

export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";

// Public registration is limited to these two; ADMIN is created by an
// existing admin through a separate protected endpoint.
export type RegistrableRole = "CUSTOMER" | "PROVIDER";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: RegistrableRole;
};

// Discriminated result the auth Server Actions return to `useActionState`.
// Success is signalled by a redirect, so the returned state is only ever
// "idle" (no submission yet) or "error".
export type AuthFormState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: FieldErrors;
  values?: Record<string, string>;
};
