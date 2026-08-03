"use client";

import { ArrowRight, Eye, EyeOff, Package, Tent } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AuthFormState, RegistrableRole } from "@/lib/types";
import { registerAction } from "../_actions/authActions";
import { FieldError } from "./field-error";

const INITIAL_STATE: AuthFormState = { status: "idle", message: "" };
const LABEL_CLASS =
  "text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-ink/70";

const ROLE_OPTIONS: {
  value: RegistrableRole;
  title: string;
  blurb: string;
  icon: typeof Tent;
}[] = [
  {
    value: "CUSTOMER",
    title: "Rent gear",
    blurb: "Discover kit and request rentals by the day.",
    icon: Tent,
  },
  {
    value: "PROVIDER",
    title: "List gear",
    blurb: "Manage inventory and fulfil rental orders.",
    icon: Package,
  },
];

export function RegisterForm() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "";
  const [state, action, pending] = useActionState(
    registerAction.bind(null, returnTo),
    INITIAL_STATE,
  );
  const [showPassword, setShowPassword] = useState(false);
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const passwordId = useId();

  useEffect(() => {
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const fieldErrors = state.fieldErrors ?? {};
  const defaultRole = (state.values?.role as RegistrableRole) ?? "CUSTOMER";

  return (
    <form action={action} noValidate className="space-y-5">
      <fieldset className="space-y-2">
        <legend className={cn(LABEL_CLASS, "mb-2")}>I want to</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLE_OPTIONS.map((option, index) => {
            const Icon = option.icon;
            return (
              <label
                key={option.value}
                className="group relative flex cursor-pointer flex-col gap-1 rounded-lg border border-ink/15 bg-paper p-4 transition-colors has-[:checked]:border-signal has-[:checked]:bg-signal/5 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  defaultChecked={
                    defaultRole
                      ? defaultRole === option.value
                      : index === 0
                  }
                  className="sr-only"
                />
                <span className="flex items-center gap-2 font-display text-lg font-black uppercase tracking-tight">
                  <Icon aria-hidden="true" className="size-4 text-signal" />
                  {option.title}
                </span>
                <span className="text-xs leading-5 text-ink/70">
                  {option.blurb}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor={nameId} className={LABEL_CLASS}>
          Full name
        </Label>
        <Input
          id={nameId}
          name="name"
          type="text"
          autoComplete="name"
          required
          defaultValue={state.values?.name}
          placeholder="Alex Rivera"
          className="h-11"
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? `${nameId}-error` : undefined}
        />
        <FieldError id={`${nameId}-error`} messages={fieldErrors.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={emailId} className={LABEL_CLASS}>
          Email
        </Label>
        <Input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          placeholder="you@trailhead.co"
          className="h-11"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? `${emailId}-error` : undefined}
        />
        <FieldError id={`${emailId}-error`} messages={fieldErrors.email} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={phoneId} className={LABEL_CLASS}>
          Phone
        </Label>
        <Input
          id={phoneId}
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          defaultValue={state.values?.phone}
          placeholder="+1 555 018 2246"
          className="h-11"
          aria-invalid={Boolean(fieldErrors.phone)}
          aria-describedby={fieldErrors.phone ? `${phoneId}-error` : undefined}
        />
        <FieldError id={`${phoneId}-error`} messages={fieldErrors.phone} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={passwordId} className={LABEL_CLASS}>
          Password
        </Label>
        <div className="relative">
          <Input
            id={passwordId}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="At least 6 characters"
            className="h-11 pr-11"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? `${passwordId}-error` : undefined
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink/50 transition-colors hover:text-ink"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
        <FieldError id={`${passwordId}-error`} messages={fieldErrors.password} />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
        {!pending && <ArrowRight aria-hidden="true" data-icon="inline-end" />}
      </Button>
    </form>
  );
}
