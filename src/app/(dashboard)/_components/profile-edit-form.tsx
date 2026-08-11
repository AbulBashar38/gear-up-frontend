"use client";

import { useActionState, useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import type { AdminMutationState, CurrentUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "../_actions/profile-actions";
import {
  AdminActionMessage,
  AdminFieldError,
  INITIAL_ADMIN_MUTATION_STATE,
  useAdminMutationToast,
} from "./admin-mutation-feedback";
import { DetailRow } from "./detail-card";

export function ProfileEditForm({ user }: { user: CurrentUser }) {
  const [state, action, pending] = useActionState(
    updateProfileAction,
    INITIAL_ADMIN_MUTATION_STATE,
  );
  useAdminMutationToast(state);
  // Records the action state the editor opened against, so a later success
  // collapses it while an error keeps it open with its messages. Derived rather
  // than synchronised in an effect.
  const [openedWith, setOpenedWith] = useState<AdminMutationState | null>(null);
  const editing =
    openedWith !== null &&
    !(state !== openedWith && state.status === "success");

  if (!editing) {
    return (
      <div className="space-y-3">
        <dl className="space-y-2">
          <DetailRow label="Name" value={user.name} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Phone" value={user.phone} />
          <DetailRow label="Role" value={user.role} />
        </dl>
        <Button
          type="button"
          variant="outline"
          size="compact"
          onClick={() => setOpenedWith(state)}
        >
          <Pencil aria-hidden="true" />
          Edit name and phone
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="profile-name" className="font-bold">
          Name
        </Label>
        <Input
          id="profile-name"
          name="name"
          type="text"
          defaultValue={state.values?.name ?? user.name}
          autoComplete="name"
          required
          disabled={pending}
          aria-invalid={Boolean(state.fieldErrors?.name?.length)}
          aria-describedby={
            state.fieldErrors?.name?.length ? "profile-name-error" : undefined
          }
          className="mt-2 h-11 rounded-none bg-card"
        />
        <AdminFieldError
          id="profile-name-error"
          messages={state.fieldErrors?.name}
        />
      </div>

      <div>
        <Label htmlFor="profile-phone" className="font-bold">
          Phone
        </Label>
        <Input
          id="profile-phone"
          name="phone"
          type="tel"
          defaultValue={state.values?.phone ?? user.phone}
          autoComplete="tel"
          required
          disabled={pending}
          aria-invalid={Boolean(state.fieldErrors?.phone?.length)}
          aria-describedby={
            state.fieldErrors?.phone?.length ? "profile-phone-error" : undefined
          }
          className="mt-2 h-11 rounded-none bg-card"
        />
        <AdminFieldError
          id="profile-phone-error"
          messages={state.fieldErrors?.phone}
        />
      </div>

      <p className="text-xs leading-5 text-ink/55">
        Your phone number must be unique across GearUp. Your email is your login
        identity, and your role and account status are administrative, so those
        are changed by an admin.
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
