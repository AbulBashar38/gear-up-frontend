"use client";

import { useActionState, useRef, useState } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import type { AdminUser, UserStatus } from "@/lib/types";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { updateUserStatusAction } from "../_actions/admin-actions";
import {
  AdminActionMessage,
  INITIAL_ADMIN_MUTATION_STATE,
  useAdminMutationToast,
} from "./admin-mutation-feedback";

export function AdminUserStatusForm({
  user,
  currentAdminId,
}: {
  user: AdminUser;
  currentAdminId: string;
}) {
  const [state, action, pending] = useActionState(
    updateUserStatusAction.bind(null, user.id),
    INITIAL_ADMIN_MUTATION_STATE,
  );
  useAdminMutationToast(state);
  const formRef = useRef<HTMLFormElement>(null);
  const [choice, setChoice] = useState<UserStatus | null>(null);
  const isCurrentAdmin = user.id === currentAdminId;

  // A rejected change (backend `409` on self-suspension, a stale record, or a
  // network failure) must not leave the control showing a status the backend
  // never accepted, so a settled error falls back to the canonical record. The
  // chosen value stays visible while the request is in flight and after it
  // succeeds, where the refreshed record then remounts this form.
  const status =
    !pending && state.status === "error" ? user.status : choice ?? user.status;

  if (isCurrentAdmin) {
    return (
      <div className="flex items-center gap-2 text-xs font-bold text-ink/60">
        <ShieldCheck aria-hidden="true" className="size-4 text-success" />
        Current admin
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className="min-w-44 space-y-2">
      <NativeSelect
        name="status"
        value={status}
        disabled={pending}
        className="w-full"
        aria-label={`Status for ${user.name}`}
        onChange={(event) => {
          setChoice(event.target.value as UserStatus);
          // Submitting from the change handler replaces the removed Update
          // button; the action still revalidates the admin role server-side.
          formRef.current?.requestSubmit();
        }}
      >
        <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
        <NativeSelectOption value="INACTIVE">Inactive</NativeSelectOption>
        <NativeSelectOption value="SUSPENDED">Suspended</NativeSelectOption>
      </NativeSelect>
      <p
        aria-live="polite"
        className="flex items-center gap-1.5 text-xs text-ink/60"
      >
        {pending && (
          <>
            <LoaderCircle aria-hidden="true" className="size-3 animate-spin" />
            Saving status…
          </>
        )}
      </p>
      <AdminActionMessage state={state} />
    </form>
  );
}
