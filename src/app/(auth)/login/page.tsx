import type { Metadata } from "next";
import Link from "next/link";
import { ClockAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthShell } from "../_components/auth-shell";
import { LoginForm } from "../_components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to request gear, manage inventory, or run the platform.",
};

function returnToSuffix(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")) {
    return `?returnTo=${encodeURIComponent(raw)}`;
  }
  return "";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    returnTo?: string | string[];
    reason?: string | string[];
  }>;
}) {
  const { returnTo, reason } = await searchParams;
  const suffix = returnToSuffix(returnTo);
  const sessionExpired =
    (Array.isArray(reason) ? reason[0] : reason) === "session-expired";

  return (
    <AuthShell
      kicker="Account sign in"
      title="Welcome back"
      subtitle="Enter your credentials to pick up where you left off."
      aside={{
        heading: "Own the weekend, not the gear.",
        points: [
          "Track rental requests from placed to returned.",
          "Providers confirm availability before any payment.",
          "Stripe handles checkout — we never touch card data.",
        ],
      }}
      footer={
        <>
          New to GearUp?{" "}
          <Link
            href={`/register${suffix}`}
            className="font-extrabold text-signal underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      {sessionExpired && (
        <Alert className="mb-5 rounded-none border-signal/30 bg-signal/5">
          <ClockAlert aria-hidden="true" />
          <AlertTitle>Your session ended</AlertTitle>
          <AlertDescription>
            Sign in again to continue to your GearUp dashboard.
          </AlertDescription>
        </Alert>
      )}
      <LoginForm />
    </AuthShell>
  );
}
