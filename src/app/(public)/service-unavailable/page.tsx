import type { Metadata } from "next";
import Link from "next/link";
import { House, RefreshCw, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Service temporarily unavailable",
  description: "GearUp could not reach its rental API.",
  robots: { index: false },
};

type SearchParamValue = string | string[] | undefined;

function safeDashboardReturnTo(value: SearchParamValue) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || raw.startsWith("//")) return "/dashboard";

  try {
    const url = new URL(raw, "http://gearup.local");
    const dashboardPath =
      url.pathname === "/dashboard" || url.pathname.startsWith("/dashboard/");
    return dashboardPath ? `${url.pathname}${url.search}` : "/dashboard";
  } catch {
    return "/dashboard";
  }
}

export default async function ServiceUnavailablePage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: SearchParamValue }>;
}) {
  const { returnTo } = await searchParams;
  const retryHref = safeDashboardReturnTo(returnTo);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative overflow-hidden bg-paper px-5 py-16 text-ink sm:py-24"
    >
      <div aria-hidden="true" className="route-grid absolute inset-0 opacity-20" />
      <section className="relative mx-auto w-full max-w-3xl border border-ink/15 bg-card p-7 sm:p-12">
        <span className="grid size-14 place-items-center bg-ink text-lime">
          <WifiOff aria-hidden="true" className="size-6" />
        </span>
        <p className="mt-8 font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em] text-signal">
          Dashboard connection // temporarily unavailable
        </p>
        <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.88] sm:text-7xl">
          The gear desk is offline.
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-6 text-ink/68 sm:text-base">
          GearUp could not reach the rental service to verify your account. Your
          session has been preserved—retry when the service is available.
        </p>

        <Alert className="mt-7 rounded-none border-ink/15 bg-mist/55 p-4">
          <WifiOff aria-hidden="true" />
          <AlertTitle>Running GearUp locally?</AlertTitle>
          <AlertDescription>
            Start the backend on port 8080, then retry your dashboard.
          </AlertDescription>
        </Alert>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={retryHref}>
              <RefreshCw aria-hidden="true" />
              Retry dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <House aria-hidden="true" />
              Return home
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
