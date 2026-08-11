"use client";

import { ArrowRight, Eye, EyeOff, KeyRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthFormState } from "@/lib/types";
import { DEMO_ACCOUNTS, type DemoAccount } from "@/lib/demo-credentials";
import { loginAction } from "../_actions/authActions";
import { FieldError } from "./field-error";

const INITIAL_STATE: AuthFormState = { status: "idle", message: "" };
const LABEL_CLASS =
  "text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-ink/70";

export function LoginForm() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "";
  const [state, action, pending] = useActionState(
    loginAction.bind(null, returnTo),
    INITIAL_STATE,
  );
  const [showPassword, setShowPassword] = useState(false);
  // Controlled so the demo-access panel can fill both fields in one click. The
  // client state also survives a failed submit, so nothing typed is lost.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailId = useId();
  const passwordId = useId();

  function fillDemoAccount(account: DemoAccount) {
    setEmail(account.email);
    setPassword(account.password);
    setShowPassword(true);
    toast.info(`${account.role} demo credentials filled. Select sign in.`);
  }

  useEffect(() => {
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={action} noValidate className="space-y-5">
      <section
        aria-labelledby="demo-access-heading"
        className="rounded-none border border-signal/30 bg-signal/5 p-4"
      >
        <div className="flex items-center gap-2">
          <KeyRound aria-hidden="true" className="size-4 text-signal" />
          <h2
            id="demo-access-heading"
            className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-ink/75"
          >
            Demo access
          </h2>
        </div>
        <p className="mt-2 text-xs leading-5 text-ink/65">
          Explore GearUp with a shared review account. Filling it replaces
          anything typed below.
        </p>
        {DEMO_ACCOUNTS.map((account) => (
          <div
            key={account.email}
            className="mt-3 border-t border-signal/20 pt-3"
          >
            <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-ink/70">
              {account.role}
            </p>
            <p className="mt-1 text-xs leading-5 text-ink/60">
              {account.description}
            </p>
            <dl className="mt-2 space-y-1 font-mono text-[0.7rem] text-ink/80">
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-ink/55">Email</dt>
                <dd className="select-all break-all">{account.email}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-ink/55">Password</dt>
                <dd className="select-all break-all">{account.password}</dd>
              </div>
            </dl>
            <Button
              type="button"
              variant="outline"
              size="compact"
              disabled={pending}
              onClick={() => fillDemoAccount(account)}
              className="mt-3"
            >
              Fill {account.role.toLowerCase()} credentials
            </Button>
          </div>
        ))}
      </section>

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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@trailhead.co"
          className="h-11"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? `${emailId}-error` : undefined}
        />
        <FieldError id={`${emailId}-error`} messages={fieldErrors.email} />
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
        {pending ? "Signing in…" : "Sign in"}
        {!pending && <ArrowRight aria-hidden="true" data-icon="inline-end" />}
      </Button>
    </form>
  );
}
