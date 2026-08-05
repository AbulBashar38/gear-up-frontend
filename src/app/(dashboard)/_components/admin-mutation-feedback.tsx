"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { AdminMutationState } from "@/lib/types";
import { cn } from "@/lib/utils";

export const INITIAL_ADMIN_MUTATION_STATE: AdminMutationState = {
  status: "idle",
  message: "",
};

export function useAdminMutationToast(state: AdminMutationState) {
  useEffect(() => {
    if (!state.message || state.status === "idle") return;
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);
}

export function AdminFieldError({
  id,
  messages,
}: {
  id: string;
  messages?: string[];
}) {
  if (!messages?.length) return null;

  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-signal">
      <AlertCircle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
      {messages[0]}
    </p>
  );
}

export function AdminActionMessage({
  state,
  className,
}: {
  state: AdminMutationState;
  className?: string;
}) {
  if (!state.message || state.status === "idle") return null;

  const Icon = state.status === "success" ? CheckCircle2 : AlertCircle;
  return (
    <p
      aria-live="polite"
      className={cn(
        "flex items-start gap-1.5 text-xs font-medium",
        state.status === "success" ? "text-success" : "text-signal",
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
      {state.message}
    </p>
  );
}
