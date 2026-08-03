import type { Metadata } from "next";
import Link from "next/link";
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
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const { returnTo } = await searchParams;
  const suffix = returnToSuffix(returnTo);

  return (
    <AuthShell
      kicker="Field access // returning"
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
      <LoginForm />
    </AuthShell>
  );
}
