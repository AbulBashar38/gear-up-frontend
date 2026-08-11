import Link from "next/link";
import { ArrowRight, Pencil, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AdminUser,
  Category,
  GearItem,
  Payment,
  RentalOrder,
  Review,
} from "@/lib/types";
import {
  formatDashboardDate,
  formatDashboardMoney,
  formatDashboardRating,
} from "../_utils/dashboard-format";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  UserStatusBadge,
} from "./dashboard-status-badge";
import { DashboardEmptyState } from "./dashboard-feedback";
import { AdminUserStatusForm } from "./admin-user-status-form";
import { AdminOrderAction } from "./admin-order-action";
import { OrderStatusActions } from "./order-status-actions";
import {
  AdminDeleteGearButton,
  AdminDeleteReviewButton,
} from "./admin-delete-controls";

function ListFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden border border-ink/15 bg-card/55">
      {children}
    </div>
  );
}

export function OrderList({
  orders,
  adminActions = false,
  providerActions = false,
  customerActions = false,
}: {
  orders: RentalOrder[];
  adminActions?: boolean;
  providerActions?: boolean;
  customerActions?: boolean;
}) {
  if (orders.length === 0) {
    return (
      <DashboardEmptyState
        title="No rental orders"
        description="Orders that match this role-scoped view will appear here."
      />
    );
  }

  return (
    <ListFrame>
      <ol className="divide-y divide-ink/12">
        {orders.map((order) => (
          <li
            key={order.id}
            className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(11rem,0.7fr)_auto] lg:items-center"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <OrderStatusBadge status={order.status} />
                {order.payment && (
                  <PaymentStatusBadge status={order.payment.status} />
                )}
              </div>
              <h3 className="mt-4 truncate font-display text-2xl font-black uppercase">
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="underline-offset-4 hover:underline"
                >
                  {order.gearItem.name}
                </Link>
              </h3>
              <p className="mt-1 truncate text-xs text-ink/60">
                Customer: {order.customer.name} · Provider: {order.gearItem.provider.name}
              </p>
            </div>
            <div className="text-xs leading-5 text-ink/68">
              <p>
                {formatDashboardDate(order.startDate)} —{" "}
                {formatDashboardDate(order.endDate)}
              </p>
              <p className="mt-1">Quantity: {order.quantity}</p>
            </div>
            <div className="lg:text-right">
              <p className="font-display text-2xl font-black">
                {formatDashboardMoney(order.totalPrice)}
              </p>
              <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.13em] text-ink/55">
                #{order.id.slice(0, 8)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 lg:justify-end">
                <Button asChild variant="ghost" size="compact">
                  <Link href={`/dashboard/orders/${order.id}`}>
                    View order
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                {customerActions && order.status === "RETURNED" && (
                  <Button asChild variant="outline" size="compact">
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Star aria-hidden="true" />
                      Write review
                    </Link>
                  </Button>
                )}
              </div>
              {adminActions && (
                <div className="mt-4">
                  <AdminOrderAction order={order} />
                </div>
              )}
              {providerActions && (
                <div className="mt-4 lg:[&_form]:justify-end">
                  <OrderStatusActions order={order} role="PROVIDER" />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </ListFrame>
  );
}

export function PaymentList({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <DashboardEmptyState
        title="No payments"
        description="Stripe-backed payment records for this role will appear here."
      />
    );
  }

  return (
    <ListFrame>
      <ol className="divide-y divide-ink/12">
        {payments.map((payment) => (
          <li
            key={payment.id}
            className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center"
          >
            <div className="min-w-0">
              <PaymentStatusBadge status={payment.status} />
              <h3 className="mt-4 truncate font-display text-2xl font-black uppercase">
                {payment.rentalOrder.gearItem.name}
              </h3>
              <p className="mt-1 text-xs text-ink/60">
                Order #{payment.rentalOrderId.slice(0, 8)} ·{" "}
                {formatDashboardDate(payment.createdAt)}
              </p>
            </div>
            <OrderStatusBadge status={payment.rentalOrder.status} />
            <p className="font-display text-2xl font-black lg:text-right">
              {formatDashboardMoney(payment.amount)}
            </p>
          </li>
        ))}
      </ol>
    </ListFrame>
  );
}

export function GearList({
  gear,
  adminActions = false,
}: {
  gear: GearItem[];
  adminActions?: boolean;
}) {
  if (gear.length === 0) {
    return (
      <DashboardEmptyState
        title="No gear listings"
        description="Inventory published through the GearUp API will appear here."
      />
    );
  }

  return (
    <ListFrame>
      <ol className="divide-y divide-ink/12">
        {gear.map((item) => (
          <li
            key={item.id}
            className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-none uppercase">
                  {item.category.name}
                </Badge>
                <Badge
                  variant={item.isAvailable && item.stock > 0 ? "success" : "destructive"}
                  className="rounded-none uppercase"
                >
                  {item.isAvailable && item.stock > 0 ? "Available" : "Unavailable"}
                </Badge>
              </div>
              <h3 className="mt-4 truncate font-display text-2xl font-black uppercase">
                {item.name}
              </h3>
              <p className="mt-1 truncate text-xs text-ink/60">
                {item.brand || "Unbranded"} · Provider: {item.provider.name}
              </p>
            </div>
            <div className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-ink/65">
              Stock {item.stock}
            </div>
            <div className="lg:text-right">
              <p className="font-display text-2xl font-black">
                {formatDashboardMoney(item.pricePerDay)}
                <span className="ml-1 text-xs font-bold uppercase text-ink/55">/ day</span>
              </p>
              {adminActions && (
                <div className="mt-4 flex flex-wrap gap-2 lg:justify-end">
                  <Button asChild variant="outline" size="compact">
                    <Link href={`/dashboard/gear/${item.id}/edit`}>
                      <Pencil aria-hidden="true" />
                      Edit
                    </Link>
                  </Button>
                  <AdminDeleteGearButton gearId={item.id} label={item.name} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </ListFrame>
  );
}

export function UserList({
  users,
  currentAdminId,
}: {
  users: AdminUser[];
  currentAdminId?: string;
}) {
  if (users.length === 0) {
    return (
      <DashboardEmptyState
        title="No users found"
        description="No platform accounts match the current view."
      />
    );
  }

  return (
    <ListFrame>
      <ol className="divide-y divide-ink/12">
        {users.map((user) => (
          <li
            key={user.id}
            className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-none uppercase">
                  {user.role}
                </Badge>
                <UserStatusBadge status={user.status} />
              </div>
              <h3 className="mt-4 truncate font-display text-2xl font-black uppercase">
                {user.name}
              </h3>
              <p className="mt-1 truncate text-xs text-ink/60">
                {user.email} · {user.phone}
              </p>
            </div>
            <div className="text-xs leading-5 text-ink/65">
              <p>{user._count.gearItems} gear listings</p>
              <p>{user._count.rentalOrders} rental orders</p>
            </div>
            <div className="space-y-3 lg:text-right">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-ink/55">
                Joined {formatDashboardDate(user.createdAt)}
              </p>
              {currentAdminId && (
                <AdminUserStatusForm
                  key={`${user.id}:${user.status}`}
                  user={user}
                  currentAdminId={currentAdminId}
                />
              )}
            </div>
          </li>
        ))}
      </ol>
    </ListFrame>
  );
}

export function CategoryList({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return (
      <DashboardEmptyState
        title="No categories"
        description="Create categories before providers publish gear listings."
      />
    );
  }

  return (
    <div className="grid gap-px border border-ink/15 bg-ink/15 sm:grid-cols-2 xl:grid-cols-3">
      {categories.map((category, index) => (
        <article key={category.id} className="bg-card p-6">
          <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-signal">
            CAT—{String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-8 font-display text-3xl font-black uppercase">
            {category.name}
          </h3>
          <p className="mt-5 border-t border-ink/12 pt-4 text-xs text-ink/60">
            Updated {formatDashboardDate(category.updatedAt)}
          </p>
        </article>
      ))}
    </div>
  );
}

export function ReviewList({
  reviews,
  adminActions = false,
}: {
  reviews: Review[];
  adminActions?: boolean;
}) {
  if (reviews.length === 0) {
    return (
      <DashboardEmptyState
        title="No reviews"
        description="Returned-order reviews will appear here for moderation."
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {reviews.map((review) => (
        <article key={review.id} className="border border-ink/15 bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <Badge variant="default" className="rounded-none">
              {formatDashboardRating(review.rating)} / 5
            </Badge>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.13em] text-ink/55">
              {formatDashboardDate(review.createdAt)}
            </p>
          </div>
          <blockquote className="mt-7 line-clamp-5 font-display text-2xl font-bold uppercase leading-tight">
            “{review.comment || "Rating submitted without a written comment."}”
          </blockquote>
          <footer className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-ink/12 pt-4 text-xs text-ink/65">
            <span>{review.customer.name} · {review.gearItem.name}</span>
            {adminActions && (
              <AdminDeleteReviewButton
                reviewId={review.id}
                label={review.customer.name}
              />
            )}
          </footer>
        </article>
      ))}
    </div>
  );
}
