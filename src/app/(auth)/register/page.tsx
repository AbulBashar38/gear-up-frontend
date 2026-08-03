import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../_components/auth-shell";
import { RegisterForm } from "../_components/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create a GearUp account as a customer to rent gear or a provider to list it.",
};

function returnToSuffix(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")) {
    return `?returnTo=${encodeURIComponent(raw)}`;
  }
  return "";
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const { returnTo } = await searchParams;
  const suffix = returnToSuffix(returnTo);

  return (
    <AuthShell
      kicker="Field access // new crew"
      title="Join GearUp"
      subtitle="Pick how you'll use GearUp, then set up your account in one step."
      aside={{
        heading: "Gear up. Head out. Give it back.",
        points: [
          "Customers request rentals and pay securely via Stripe.",
          "Providers list gear and manage every order in one place.",
          "Your session stays in secure, HttpOnly cookies.",
        ],
      }}
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`/login${suffix}`}
            className="font-extrabold text-signal underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
