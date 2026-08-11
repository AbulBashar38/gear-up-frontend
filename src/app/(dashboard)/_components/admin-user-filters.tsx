import Link from "next/link";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import type { Role, UserStatus } from "@/lib/types";

export type AdminUserFilterValues = {
  search: string;
  role: Role | "";
  status: UserStatus | "";
};

export function AdminUserFilters({
  values,
}: {
  values: AdminUserFilterValues;
}) {
  const hasFilters = Boolean(values.search || values.role || values.status);

  return (
    <form
      // Uncontrolled inputs keep their DOM value across client-side navigation,
      // so remount the form whenever the URL-derived values change to keep
      // "Clear" from leaving stale text in the search field.
      key={`${values.search}|${values.role}|${values.status}`}
      action="/dashboard/users"
      method="get"
      className="mt-6 grid gap-4 border border-ink/15 bg-card/55 p-5 md:grid-cols-[minmax(14rem,1fr)_minmax(10rem,0.35fr)_minmax(10rem,0.35fr)_auto] md:items-end"
    >
      <div className="space-y-2">
        <Label htmlFor="user-search">Search users</Label>
        <Input
          id="user-search"
          name="search"
          type="search"
          defaultValue={values.search}
          placeholder="Name, email, or phone"
          maxLength={100}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-role">Role</Label>
        <NativeSelect
          id="user-role"
          name="role"
          defaultValue={values.role}
          className="w-full"
        >
          <NativeSelectOption value="">All roles</NativeSelectOption>
          <NativeSelectOption value="CUSTOMER">Customer</NativeSelectOption>
          <NativeSelectOption value="PROVIDER">Provider</NativeSelectOption>
          <NativeSelectOption value="ADMIN">Admin</NativeSelectOption>
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-status">Status</Label>
        <NativeSelect
          id="user-status"
          name="status"
          defaultValue={values.status}
          className="w-full"
        >
          <NativeSelectOption value="">All statuses</NativeSelectOption>
          <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
          <NativeSelectOption value="INACTIVE">Inactive</NativeSelectOption>
          <NativeSelectOption value="SUSPENDED">Suspended</NativeSelectOption>
        </NativeSelect>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="compact">
          <Search aria-hidden="true" />
          Apply
        </Button>
        {hasFilters && (
          <Button asChild type="button" variant="ghost" size="compact">
            <Link href="/dashboard/users">
              <X aria-hidden="true" />
              Clear
            </Link>
          </Button>
        )}
      </div>
    </form>
  );
}
