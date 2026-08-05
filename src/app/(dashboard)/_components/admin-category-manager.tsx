"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "../_actions/admin-actions";
import {
  AdminActionMessage,
  AdminFieldError,
  INITIAL_ADMIN_MUTATION_STATE,
  useAdminMutationToast,
} from "./admin-mutation-feedback";
import { DashboardEmptyState } from "./dashboard-feedback";
import { formatDashboardDate } from "../_utils/dashboard-format";

function CreateCategoryForm() {
  const [state, action, pending] = useActionState(
    createCategoryAction,
    INITIAL_ADMIN_MUTATION_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);
  useAdminMutationToast(state);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={action}
      className="grid gap-4 border border-ink/15 bg-mist/55 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
    >
      <div>
        <Label htmlFor="new-category-name" className="font-bold">
          New category name
        </Label>
        <Input
          id="new-category-name"
          name="name"
          defaultValue={state.values?.name}
          minLength={2}
          maxLength={255}
          required
          disabled={pending}
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={state.fieldErrors?.name ? "new-category-error" : undefined}
          className="mt-2 h-11 rounded-none bg-card"
          placeholder="e.g. Water sports"
        />
        <AdminFieldError id="new-category-error" messages={state.fieldErrors?.name} />
      </div>
      <Button type="submit" size="lg" disabled={pending}>
        <Plus aria-hidden="true" />
        {pending ? "Creating…" : "Create category"}
      </Button>
      <AdminActionMessage state={state} className="sm:col-span-2" />
    </form>
  );
}

function CategoryRow({ category, index }: { category: Category; index: number }) {
  const [updateState, updateAction, updating] = useActionState(
    updateCategoryAction.bind(null, category.id),
    INITIAL_ADMIN_MUTATION_STATE,
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteCategoryAction.bind(null, category.id),
    INITIAL_ADMIN_MUTATION_STATE,
  );
  useAdminMutationToast(updateState);
  useAdminMutationToast(deleteState);

  return (
    <article className="bg-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-signal">
          CAT—{String(index + 1).padStart(2, "0")}
        </p>
        <p className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-ink/50">
          {formatDashboardDate(category.updatedAt)}
        </p>
      </div>

      <form action={updateAction} className="mt-7 space-y-3">
        <Label htmlFor={`category-${category.id}`} className="sr-only">
          Category name
        </Label>
        <Input
          id={`category-${category.id}`}
          name="name"
          defaultValue={category.name}
          minLength={2}
          maxLength={255}
          required
          disabled={updating || deleting}
          aria-invalid={Boolean(updateState.fieldErrors?.name)}
          aria-describedby={
            updateState.fieldErrors?.name
              ? `category-${category.id}-error`
              : undefined
          }
          className="h-12 rounded-none font-display text-xl font-black uppercase"
        />
        <AdminFieldError
          id={`category-${category.id}-error`}
          messages={updateState.fieldErrors?.name}
        />
        <Button type="submit" variant="outline" size="compact" disabled={updating || deleting}>
          <Save aria-hidden="true" />
          {updating ? "Saving…" : "Save name"}
        </Button>
        <AdminActionMessage state={updateState} />
      </form>

      <form
        action={deleteAction}
        className="mt-5 border-t border-ink/12 pt-4"
        onSubmit={(event) => {
          if (!window.confirm(`Delete the “${category.name}” category?`)) {
            event.preventDefault();
          }
        }}
      >
        <Button type="submit" variant="destructive" size="compact" disabled={updating || deleting}>
          <Trash2 aria-hidden="true" />
          {deleting ? "Deleting…" : "Delete category"}
        </Button>
        <AdminActionMessage state={deleteState} className="mt-2" />
      </form>
    </article>
  );
}

export function AdminCategoryManager({ categories }: { categories: Category[] }) {
  return (
    <div className="space-y-6">
      <CreateCategoryForm />
      {categories.length === 0 ? (
        <DashboardEmptyState
          title="No categories"
          description="Create the first category so providers can publish gear."
        />
      ) : (
        <div className="grid gap-px border border-ink/15 bg-ink/15 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, index) => (
            <CategoryRow key={category.id} category={category} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
