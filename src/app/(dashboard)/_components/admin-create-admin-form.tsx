"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAdminAction } from "../_actions/admin-actions";
import {
  AdminActionMessage,
  AdminFieldError,
  INITIAL_ADMIN_MUTATION_STATE,
  useAdminMutationToast,
} from "./admin-mutation-feedback";

export function AdminCreateAdminForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    createAdminAction,
    INITIAL_ADMIN_MUTATION_STATE,
  );
  useAdminMutationToast(state);

  useEffect(() => {
    if (state.status === "success") {
      router.push("/dashboard/users");
      router.refresh();
    }
  }, [router, state.status]);

  const fields = state.fieldErrors ?? {};
  const labelClass = "font-bold";

  return (
    <form action={action} noValidate className="border border-ink/15 bg-card p-6 sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="admin-name" className={labelClass}>Full name</Label>
          <Input id="admin-name" name="name" autoComplete="name" required minLength={2} maxLength={255} disabled={pending} defaultValue={state.values?.name} aria-invalid={Boolean(fields.name)} aria-describedby={fields.name ? "admin-name-error" : undefined} className="mt-2 h-11 rounded-none" />
          <AdminFieldError id="admin-name-error" messages={fields.name} />
        </div>
        <div>
          <Label htmlFor="admin-email" className={labelClass}>Email</Label>
          <Input id="admin-email" name="email" type="email" autoComplete="email" required disabled={pending} defaultValue={state.values?.email} aria-invalid={Boolean(fields.email)} aria-describedby={fields.email ? "admin-email-error" : undefined} className="mt-2 h-11 rounded-none" />
          <AdminFieldError id="admin-email-error" messages={fields.email} />
        </div>
        <div>
          <Label htmlFor="admin-phone" className={labelClass}>Phone</Label>
          <Input id="admin-phone" name="phone" type="tel" autoComplete="tel" required disabled={pending} defaultValue={state.values?.phone} aria-invalid={Boolean(fields.phone)} aria-describedby={fields.phone ? "admin-phone-error" : undefined} className="mt-2 h-11 rounded-none" />
          <AdminFieldError id="admin-phone-error" messages={fields.phone} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="admin-password" className={labelClass}>Temporary password</Label>
          <Input id="admin-password" name="password" type="password" autoComplete="new-password" required minLength={6} disabled={pending} aria-invalid={Boolean(fields.password)} aria-describedby={fields.password ? "admin-password-error" : "admin-password-help"} className="mt-2 h-11 rounded-none" />
          <p id="admin-password-help" className="mt-2 text-xs text-ink/60">Use at least six characters and share it securely with the new administrator.</p>
          <AdminFieldError id="admin-password-error" messages={fields.password} />
        </div>
      </div>

      <AdminActionMessage state={state} className="mt-6" />
      <div className="mt-7 flex flex-wrap gap-3 border-t border-ink/12 pt-6">
        <Button type="submit" size="lg" disabled={pending}>
          <ShieldPlus aria-hidden="true" />
          {pending ? "Creating admin…" : "Create admin account"}
        </Button>
        <Button type="button" variant="outline" size="lg" disabled={pending} onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
