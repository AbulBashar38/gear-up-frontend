import { LandingMotionProvider } from "@/components/landing/motion-primitives";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LandingMotionProvider>
      <a
        href="#main-content"
        className="skip-link fixed left-4 top-3 z-[100] -translate-y-24 bg-lime px-4 py-3 font-bold text-ink focus-visible:translate-y-0"
      >
        Skip to main content
      </a>
      <SiteHeader />
      {children}
      <SiteFooter />
    </LandingMotionProvider>
  );
}
