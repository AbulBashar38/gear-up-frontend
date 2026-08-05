import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="mx-auto flex h-20 w-full max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12">
        <BrandMark />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="hidden text-xs font-extrabold uppercase tracking-[0.18em] text-ink/70 hover:text-signal sm:inline"
          >
            Back to field access
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
