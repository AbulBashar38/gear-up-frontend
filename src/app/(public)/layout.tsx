import { SiteFooter } from "../../components/shared/site-footer";
import { SiteHeader } from "../../components/shared/site-header";
import { AuthSessionProvider } from "@/components/providers/auth-session-provider";
import type { AuthSessionSnapshot } from "@/lib/types";
import { getCurrentUser } from "@/services/auth";
import { LandingMotionProvider } from "./_components/landing/motion-primitives";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  const initialSession: AuthSessionSnapshot = currentUser.ok
    ? { status: "authenticated", user: currentUser.data }
    : currentUser.error.status === 401 || currentUser.error.status === 403
      ? { status: "anonymous", user: null }
      : {
          status: "unavailable",
          user: null,
          message: currentUser.error.message,
        };

  return (
    <AuthSessionProvider initialSession={initialSession}>
      <LandingMotionProvider>
        <a
          href="#main-content"
          className="surface-accent skip-link fixed left-4 top-3 z-[100] -translate-y-24 bg-lime px-4 py-3 font-bold text-ink focus-visible:translate-y-0"
        >
          Skip to main content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </LandingMotionProvider>
    </AuthSessionProvider>
  );
}
