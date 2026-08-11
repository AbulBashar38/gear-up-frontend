import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

type AuthShellProps = {
  kicker: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  aside: {
    heading: string;
    points: string[];
  };
};

export function AuthShell({
  kicker,
  title,
  subtitle,
  children,
  footer,
  aside,
}: AuthShellProps) {
  return (
    <main className="mx-auto grid w-full max-w-[90rem] gap-10 px-5 pb-16 pt-6 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-12 lg:pt-10">
      {/* Marketing panel — decorative, hidden on small screens. */}
      <section
        aria-hidden="true"
        className="surface-inverse hidden flex-col justify-between overflow-hidden rounded-2xl bg-ink p-10 text-paper lg:flex"
      >
        <div>
          <p className="section-kicker text-lime">Why use GearUp</p>
          <p className="mt-6 font-display text-5xl font-black uppercase leading-[0.95] tracking-tight">
            {aside.heading}
          </p>
        </div>
        <ul className="mt-10 space-y-4">
          {aside.points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-paper/80">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-lime" />
              {point}
            </li>
          ))}
        </ul>
      </section>

      {/* Form column. */}
      <section className="flex flex-col justify-center">
        <div className="w-full max-w-md">
          <p className="section-kicker">{kicker}</p>
          <h1 className="mt-3 font-display text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-ink/70">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-sm text-ink/70">{footer}</p>
        </div>
      </section>
    </main>
  );
}
