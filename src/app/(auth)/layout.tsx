import Link from "next/link";
import { BrandMark } from "@/components/landing/brand-mark";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="mx-auto flex h-20 w-full max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12">
        <BrandMark />
        <Link
          href="/"
          className="text-xs font-extrabold uppercase tracking-[0.18em] text-ink/70 hover:text-signal"
        >
          Back to field access
        </Link>
      </header>
      {children}
    </div>
  );
}
