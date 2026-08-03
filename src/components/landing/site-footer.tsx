import { ArrowUp } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { Button } from "@/components/ui/button";

const footerLinks = [
  { label: "Gear locker", href: "/gear" },
  { label: "Rental route", href: "/#rental-flow" },
  { label: "Providers", href: "/#providers" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-paper/10 bg-ink py-10 text-paper">
      <div className="mx-auto grid w-full max-w-[90rem] gap-10 px-5 sm:px-8 md:grid-cols-3 md:items-end lg:px-12">
        <div>
          <BrandMark inverse />
          <p className="mt-5 max-w-xs text-xs leading-5 text-paper/60">
            Sports and outdoor gear, requested by the day and paid securely after
            provider confirmation.
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-col gap-3 text-sm font-bold md:items-center"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-paper/58 transition-colors hover:text-lime"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-end justify-between gap-4 md:justify-end">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-paper/60">
            GearUp // Built for the next outing
          </p>
          <Button
            asChild
            variant="ghost"
            size="icon-lg"
            className="size-11 shrink-0 rounded-none border border-paper/20 text-paper hover:border-lime hover:bg-lime hover:text-ink"
          >
            <a href="#main-content" aria-label="Back to top">
              <ArrowUp aria-hidden="true" className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}
