import type { PaymentStatus, RentalOrderStatus, UserStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatStatusLabel } from "../_utils/dashboard-format";

const orderVariants: Record<
  RentalOrderStatus,
  "default" | "secondary" | "outline" | "success" | "destructive"
> = {
  PLACED: "secondary",
  CONFIRMED: "outline",
  PAID: "default",
  PICKED_UP: "success",
  RETURNED: "success",
  CANCELLED: "destructive",
};

const paymentVariants: Record<
  PaymentStatus,
  "secondary" | "success" | "destructive"
> = {
  PENDING: "secondary",
  COMPLETED: "success",
  FAILED: "destructive",
};

const userVariants: Record<
  UserStatus,
  "success" | "secondary" | "destructive"
> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  SUSPENDED: "destructive",
};

const sharedClassName =
  "h-auto rounded-none px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em]";

export function OrderStatusBadge({ status }: { status: RentalOrderStatus }) {
  return (
    <Badge variant={orderVariants[status]} className={sharedClassName}>
      {formatStatusLabel(status)}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant={paymentVariants[status]} className={sharedClassName}>
      {formatStatusLabel(status)}
    </Badge>
  );
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <Badge variant={userVariants[status]} className={sharedClassName}>
      {formatStatusLabel(status)}
    </Badge>
  );
}
