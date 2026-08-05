"use client";

import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";
import type { AdminUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
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
  const isCurrentAdmin = user.id === currentAdminId;

  if (isCurrentAdmin) {
    return (
      <div className="flex items-center gap-2 text-xs font-bold text-ink/60">
        <ShieldCheck aria-hidden="true" className="size-4 text-success" />
        Current admin
      </div>
    );
  }

  return (
    <form action={action} className="min-w-44 space-y-2">
      <div className="flex gap-2">
        <NativeSelect
          name="status"
          defaultValue={user.status}
          disabled={pending}
          className="w-full"
          aria-label={`Status for ${user.name}`}
        >
          <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
          <NativeSelectOption value="INACTIVE">Inactive</NativeSelectOption>
          <NativeSelectOption value="SUSPENDED">Suspended</NativeSelectOption>
        </NativeSelect>
        <Button type="submit" variant="outline" size="compact" disabled={pending}>
          {pending ? "Saving…" : "Update"}
        </Button>
      </div>
      <AdminActionMessage state={state} />
    </form>
  );
}
