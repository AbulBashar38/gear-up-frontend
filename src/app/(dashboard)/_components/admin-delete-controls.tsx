"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteGearAction,
  deleteReviewAction,
} from "../_actions/admin-actions";
import {
  AdminActionMessage,
  INITIAL_ADMIN_MUTATION_STATE,
  useAdminMutationToast,
} from "./admin-mutation-feedback";

function useDeleteConfirmation(label: string) {
  return (event: React.FormEvent<HTMLFormElement>) => {
    if (!window.confirm(`Delete ${label}? This action cannot be undone.`)) {
      event.preventDefault();
    }
  };
}

export function AdminDeleteReviewButton({
  reviewId,
  label,
}: {
  reviewId: string;
  label: string;
}) {
  const [state, action, pending] = useActionState(
    deleteReviewAction.bind(null, reviewId),
    INITIAL_ADMIN_MUTATION_STATE,
  );
  useAdminMutationToast(state);
  const confirmDelete = useDeleteConfirmation(`review by ${label}`);

  return (
    <form action={action} onSubmit={confirmDelete} className="space-y-2">
      <Button type="submit" variant="destructive" size="compact" disabled={pending}>
        <Trash2 aria-hidden="true" />
        {pending ? "Deleting…" : "Delete review"}
      </Button>
      <AdminActionMessage state={state} />
    </form>
  );
}

export function AdminDeleteGearButton({
  gearId,
  label,
}: {
  gearId: string;
  label: string;
}) {
  const [state, action, pending] = useActionState(
    deleteGearAction.bind(null, gearId),
    INITIAL_ADMIN_MUTATION_STATE,
  );
  useAdminMutationToast(state);
  const confirmDelete = useDeleteConfirmation(label);

  return (
    <form action={action} onSubmit={confirmDelete} className="space-y-2">
      <Button type="submit" variant="destructive" size="compact" disabled={pending}>
        <Trash2 aria-hidden="true" />
        {pending ? "Deleting…" : "Delete"}
      </Button>
      <AdminActionMessage state={state} />
    </form>
  );
}
