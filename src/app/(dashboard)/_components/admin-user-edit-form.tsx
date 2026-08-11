"use client";

import { useActionState, useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import type { AdminMutationState, AdminUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { updateUserAction } from "../_actions/admin-actions";
import {
  AdminActionMessage,
  AdminFieldError,
  INITIAL_ADMIN_MUTATION_STATE,
  useAdminMutationToast,
} from "./admin-mutation-feedback";

function Field({
  id,
  name,
  label,
  type,
  defaultValue,
  autoComplete,
  errors,
  disabled,
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  defaultValue: string;
  autoComplete: string;
  errors?: string[];
  disabled: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id} className="font-bold">
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        required
        disabled={disabled}
        aria-invalid={Boolean(errors?.length)}
        aria-describedby={errors?.length ? `${id}-error` : undefined}
        className="mt-2 h-11 rounded-none bg-card"
      />
      <AdminFieldError id={`${id}-error`} messages={errors} />
    </div>
  );
}

export function AdminUserEditForm({
  user,
  currentAdminId,
}: {
  user: AdminUser;
  currentAdminId: string;
}) {
  const isCurrentAdmin = user.id === currentAdminId;
  const [state, action, pending] = useActionState(
    updateUserAction.bind(null, user.id),
    INITIAL_ADMIN_MUTATION_STATE,
  );
  useAdminMutationToast(state);
  // Records the action state the editor was opened against. A later state that
  // reports success means the backend accepted this edit, so the editor
  // collapses back to the summary; an error keeps it open with its messages.
  // Derived rather than synchronised in an effect.
  const [openedWith, setOpenedWith] = useState<AdminMutationState | null>(null);
  const editing =
    openedWith !== null &&
    !(state !== openedWith && state.status === "success");

  if (!editing) {
    return (
      <div className="space-y-3">
        <dl className="space-y-2">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-xs text-ink/55">Name</dt>
            <dd className="text-right font-medium text-ink">{user.name}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-xs text-ink/55">Email</dt>
            <dd className="min-w-0 wrap-break-word text-right font-medium text-ink">
              {user.email}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-xs text-ink/55">Phone</dt>
            <dd className="text-right font-medium text-ink">{user.phone}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-xs text-ink/55">Role</dt>
            <dd className="text-right font-medium text-ink">{user.role}</dd>
          </div>
        </dl>
        <Button
          type="button"
          variant="outline"
          size="compact"
          onClick={() => setOpenedWith(state)}
        >
          <Pencil aria-hidden="true" />
          Edit details
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <Field
        id="user-name"
        name="name"
        label="Name"
        type="text"
        defaultValue={state.values?.name ?? user.name}
        autoComplete="name"
        errors={state.fieldErrors?.name}
        disabled={pending}
      />
      <Field
        id="user-email"
        name="email"
        label="Email"
        type="email"
        defaultValue={state.values?.email ?? user.email}
        autoComplete="email"
        errors={state.fieldErrors?.email}
        disabled={pending}
      />
      <Field
        id="user-phone"
        name="phone"
        label="Phone"
        type="tel"
        defaultValue={state.values?.phone ?? user.phone}
        autoComplete="tel"
        errors={state.fieldErrors?.phone}
        disabled={pending}
      />
      <div>
        <Label htmlFor="user-role" className="font-bold">
          Role
        </Label>
        <NativeSelect
          id="user-role"
          name="role"
          defaultValue={state.values?.role ?? user.role}
          required
          disabled={pending || isCurrentAdmin}
          aria-invalid={Boolean(state.fieldErrors?.role?.length)}
          aria-describedby={
            state.fieldErrors?.role?.length ? "user-role-error" : undefined
          }
          className="mt-2 w-full"
        >
          <NativeSelectOption value="CUSTOMER">Customer</NativeSelectOption>
          <NativeSelectOption value="PROVIDER">Provider</NativeSelectOption>
          <NativeSelectOption value="ADMIN">Admin</NativeSelectOption>
        </NativeSelect>
        {/* A disabled select submits nothing, so the admin's own role still
            travels with the request and the rest of the form stays editable. */}
        {isCurrentAdmin && (
          <input type="hidden" name="role" value={user.role} />
        )}
        <AdminFieldError
          id="user-role-error"
          messages={state.fieldErrors?.role}
        />
      </div>
      <p className="text-xs leading-5 text-ink/55">
        Email and phone are unique across the platform.{" "}
        {isCurrentAdmin
          ? "You cannot change your own role."
          : "A provider must have no gear listings, and a customer no rentals in progress, before their role can change."}{" "}
        Password and account status are changed elsewhere.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="compact" disabled={pending}>
          <Save aria-hidden="true" />
          {pending ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="compact"
          disabled={pending}
          onClick={() => setOpenedWith(null)}
        >
          <X aria-hidden="true" />
          Cancel
        </Button>
      </div>
      <AdminActionMessage state={state} />
    </form>
  );
}
