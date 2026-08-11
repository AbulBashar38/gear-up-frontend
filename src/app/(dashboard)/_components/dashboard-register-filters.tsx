import Link from "next/link";
import { Search, X } from "lucide-react";
import type {
  Category,
  GearItem,
  PaymentStatus,
  RentalOrderStatus,
  Role,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

type FilterShellProps = {
  action: string;
  hasFilters: boolean;
  /**
   * Serialized active filter values. Uncontrolled inputs keep their DOM value
   * across client-side navigation, so remount the form whenever the URL-derived
   * values change to keep "Clear filters" from leaving stale text behind.
   */
  resetKey: string;
  children: React.ReactNode;
};

function FilterShell({
  action,
  hasFilters,
  resetKey,
  children,
}: FilterShellProps) {
  return (
    <form
      key={resetKey}
      action={action}
      method="get"
      className="mt-6 border border-ink/15 bg-card/55 p-5"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:items-end">
        {children}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-4">
        <Button type="submit" size="compact">
          <Search aria-hidden="true" />
          Apply filters
        </Button>
        {hasFilters && (
          <Button asChild type="button" variant="ghost" size="compact">
            <Link href={action}>
              <X aria-hidden="true" />
              Clear filters
            </Link>
          </Button>
        )}
      </div>
    </form>
  );
}

function SearchField({
  id,
  value,
  placeholder,
}: {
  id: string;
  value: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor={id}>Search</Label>
      <Input
        id={id}
        name="search"
        type="search"
        defaultValue={value}
        placeholder={placeholder}
        maxLength={100}
      />
    </div>
  );
}

function filterResetKey(values: Record<string, string>) {
  return Object.entries(values)
    .map(([field, value]) => `${field}=${value}`)
    .join("&");
}

const ORDER_STATUSES: RentalOrderStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PAID",
  "PICKED_UP",
  "RETURNED",
  "CANCELLED",
];
const PAYMENT_STATUSES: PaymentStatus[] = ["PENDING", "COMPLETED", "FAILED"];

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export type OrderFilterValues = {
  search: string;
  status: RentalOrderStatus | "";
  paymentStatus: PaymentStatus | "";
};

export function OrderRegisterFilters({
  values,
  role,
}: {
  values: OrderFilterValues;
  role: Role;
}) {
  const subjects =
    role === "CUSTOMER"
      ? "Gear, brand, provider, or full order ID"
      : role === "PROVIDER"
        ? "Gear, brand, customer, or full order ID"
        : "Gear, customer, provider, or full order ID";

  return (
    <FilterShell
      action="/dashboard/orders"
      hasFilters={Boolean(values.search || values.status || values.paymentStatus)}
      resetKey={filterResetKey(values)}
    >
      <SearchField id="order-search" value={values.search} placeholder={subjects} />
      <div className="space-y-2">
        <Label htmlFor="order-status">Order status</Label>
        <NativeSelect
          id="order-status"
          name="status"
          defaultValue={values.status}
          className="w-full"
        >
          <NativeSelectOption value="">All order statuses</NativeSelectOption>
          {ORDER_STATUSES.map((status) => (
            <NativeSelectOption key={status} value={status}>
              {statusLabel(status)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="order-payment-status">Payment status</Label>
        <NativeSelect
          id="order-payment-status"
          name="paymentStatus"
          defaultValue={values.paymentStatus}
          className="w-full"
        >
          <NativeSelectOption value="">All payment statuses</NativeSelectOption>
          {PAYMENT_STATUSES.map((status) => (
            <NativeSelectOption key={status} value={status}>
              {statusLabel(status)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    </FilterShell>
  );
}

export type GearFilterValues = {
  search: string;
  category: string;
  availability: "true" | "false" | "";
  stock: "true" | "false" | "";
};

export function GearRegisterFilters({
  values,
  categories,
}: {
  values: GearFilterValues;
  categories: Category[];
}) {
  return (
    <FilterShell
      action="/dashboard/gear"
      hasFilters={Boolean(
        values.search || values.category || values.availability || values.stock,
      )}
      resetKey={filterResetKey(values)}
    >
      <SearchField
        id="gear-search"
        value={values.search}
        placeholder="Name, description, brand, category, or provider"
      />
      <div className="space-y-2">
        <Label htmlFor="gear-category-filter">Category</Label>
        <NativeSelect
          id="gear-category-filter"
          name="category"
          defaultValue={values.category}
          className="w-full"
        >
          <NativeSelectOption value="">All categories</NativeSelectOption>
          {categories.map((category) => (
            <NativeSelectOption key={category.id} value={category.id}>
              {category.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="gear-availability-filter">Listing availability</Label>
        <NativeSelect
          id="gear-availability-filter"
          name="availability"
          defaultValue={values.availability}
          className="w-full"
        >
          <NativeSelectOption value="">Any availability</NativeSelectOption>
          <NativeSelectOption value="true">Available</NativeSelectOption>
          <NativeSelectOption value="false">Unavailable</NativeSelectOption>
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="gear-stock-filter">Stock</Label>
        <NativeSelect
          id="gear-stock-filter"
          name="stock"
          defaultValue={values.stock}
          className="w-full"
        >
          <NativeSelectOption value="">Any stock level</NativeSelectOption>
          <NativeSelectOption value="true">In stock</NativeSelectOption>
          <NativeSelectOption value="false">Out of stock</NativeSelectOption>
        </NativeSelect>
      </div>
    </FilterShell>
  );
}

export type PaymentFilterValues = {
  search: string;
  status: PaymentStatus | "";
  orderStatus: RentalOrderStatus | "";
};

export function PaymentRegisterFilters({
  values,
}: {
  values: PaymentFilterValues;
}) {
  return (
    <FilterShell
      action="/dashboard/payments"
      hasFilters={Boolean(values.search || values.status || values.orderStatus)}
      resetKey={filterResetKey(values)}
    >
      <SearchField
        id="payment-search"
        value={values.search}
        placeholder="Gear, customer, provider, Stripe reference, or full ID"
      />
      <div className="space-y-2">
        <Label htmlFor="payment-status-filter">Payment status</Label>
        <NativeSelect
          id="payment-status-filter"
          name="status"
          defaultValue={values.status}
          className="w-full"
        >
          <NativeSelectOption value="">All payment statuses</NativeSelectOption>
          {PAYMENT_STATUSES.map((status) => (
            <NativeSelectOption key={status} value={status}>
              {statusLabel(status)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="payment-order-status-filter">Order status</Label>
        <NativeSelect
          id="payment-order-status-filter"
          name="orderStatus"
          defaultValue={values.orderStatus}
          className="w-full"
        >
          <NativeSelectOption value="">All order statuses</NativeSelectOption>
          {ORDER_STATUSES.map((status) => (
            <NativeSelectOption key={status} value={status}>
              {statusLabel(status)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    </FilterShell>
  );
}

export type ReviewFilterValues = {
  search: string;
  rating: string;
};

export function ReviewRegisterFilters({
  values,
}: {
  values: ReviewFilterValues;
}) {
  return (
    <FilterShell
      action="/dashboard/reviews"
      hasFilters={Boolean(values.search || values.rating)}
      resetKey={filterResetKey(values)}
    >
      <SearchField
        id="review-search"
        value={values.search}
        placeholder="Gear, customer, comment, or full review/order ID"
      />
      <div className="space-y-2">
        <Label htmlFor="review-rating-filter">Exact rating</Label>
        <Input
          id="review-rating-filter"
          name="rating"
          type="number"
          inputMode="decimal"
          min="1"
          max="5"
          step="0.1"
          defaultValue={values.rating}
          placeholder="1.0–5.0"
        />
      </div>
    </FilterShell>
  );
}

export type ProviderReviewFilterValues = {
  gearItemId: string;
  search: string;
  rating: string;
};

/**
 * `GET /reviews` accepts `gearItemId` but has no provider filter, so a provider
 * reads their feedback one owned listing at a time instead of the frontend
 * pretending the public review list is provider-scoped.
 */
export function ProviderReviewFilters({
  values,
  gear,
}: {
  values: ProviderReviewFilterValues;
  gear: GearItem[];
}) {
  return (
    <FilterShell
      action="/dashboard/reviews"
      hasFilters={Boolean(values.gearItemId || values.search || values.rating)}
      resetKey={filterResetKey(values)}
    >
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="review-gear-filter">Your gear listing</Label>
        <NativeSelect
          id="review-gear-filter"
          name="gearItemId"
          defaultValue={values.gearItemId}
          className="w-full"
        >
          <NativeSelectOption value="">
            Select one of your listings
          </NativeSelectOption>
          {gear.map((item) => (
            <NativeSelectOption key={item.id} value={item.id}>
              {item.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <SearchField
        id="review-search"
        value={values.search}
        placeholder="Customer, comment, or full review/order ID"
      />
      <div className="space-y-2">
        <Label htmlFor="review-rating-filter">Exact rating</Label>
        <Input
          id="review-rating-filter"
          name="rating"
          type="number"
          inputMode="decimal"
          min="1"
          max="5"
          step="0.1"
          defaultValue={values.rating}
          placeholder="1.0–5.0"
        />
      </div>
    </FilterShell>
  );
}

export function CategoryRegisterFilters({ search }: { search: string }) {
  return (
    <FilterShell
      action="/dashboard/categories"
      hasFilters={Boolean(search)}
      resetKey={filterResetKey({ search })}
    >
      <SearchField
        id="category-search"
        value={search}
        placeholder="Category name"
      />
    </FilterShell>
  );
}
