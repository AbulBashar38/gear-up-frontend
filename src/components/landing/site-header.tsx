"use client";

import { ArrowUpRight, Menu } from "lucide-react";
import { m, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "./brand-mark";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Gear locker", href: "/gear" },
  { label: "How it works", href: "/#rental-flow" },
  { label: "For providers", href: "/#providers" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  const hasSolidBackground = pathname !== "/" || scrolled || menuOpen;

  return (
    <m.header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        hasSolidBackground
          ? "border-paper/10 bg-ink/95 shadow-[0_14px_35px_rgba(4,20,14,0.2)] backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12">
        <BrandMark inverse />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-8 lg:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-underline py-3 text-sm font-bold text-paper/75 transition-colors hover:text-paper"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-paper/65">
            Adventure, on request
          </span>
          <Button
            asChild
            className="notch-button min-h-12 rounded-none bg-lime px-5 text-sm font-extrabold text-ink hover:bg-lime/90"
          >
            <Link href="/gear">
              Browse gear
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label="Open navigation menu"
              className="size-11 rounded-none border border-paper/25 text-paper hover:bg-paper/10 hover:text-paper lg:hidden"
            >
              <Menu aria-hidden="true" className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[min(90vw,26rem)] border-paper/10 bg-ink p-0 text-paper sm:max-w-[26rem]"
          >
            <SheetHeader className="border-b border-paper/10 px-6 pb-5 pt-6 text-left">
              <SheetTitle className="font-display text-3xl font-black uppercase tracking-tight text-paper">
                Field navigation
              </SheetTitle>
              <SheetDescription className="text-paper/60">
                Find equipment, understand the rental route, or list your own
                gear.
              </SheetDescription>
            </SheetHeader>

            <nav aria-label="Mobile navigation" className="flex flex-col px-6">
              {navigation.map((item, index) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-16 items-center justify-between border-b border-paper/10 font-display text-2xl font-bold uppercase tracking-tight text-paper hover:text-lime"
                  >
                    {item.label}
                    <span className="font-mono text-xs text-orange">
                      0{index + 1}
                    </span>
                  </Link>
                </SheetClose>
              ))}

              <SheetClose asChild>
                <Link
                  href="/gear"
                  className={cn(
                    buttonVariants(),
                    "notch-button mt-6 min-h-14 rounded-none bg-lime px-5 font-extrabold text-ink hover:bg-lime/90",
                  )}
                >
                  Browse the locker
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </m.header>
  );
}
