"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LogOut, Menu } from "lucide-react";
import type { CurrentUser } from "@/lib/types";
import { BrandMark } from "@/components/shared/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { DASHBOARD_NAVIGATION } from "../_config/dashboard-navigation";
import { logoutAction } from "../_actions/logout-action";

type DashboardShellProps = {
  user: CurrentUser;
  children: React.ReactNode;
};

function isItemActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationLinks({
  user,
  mobile = false,
}: {
  user: CurrentUser;
  mobile?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={`${user.role.toLowerCase()} dashboard navigation`}>
      <ul className="space-y-1.5">
        {DASHBOARD_NAVIGATION[user.role].map((item, index) => {
          const active = isItemActive(pathname, item.href, item.exact);
          const link = (
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex min-h-12 items-center gap-3 border-l-2 px-4 text-sm font-bold transition-colors",
                active
                  ? "border-lime bg-paper/10 text-lime"
                  : "border-transparent text-paper/65 hover:border-orange hover:bg-paper/[0.06] hover:text-paper",
              )}
            >
              <span className="w-6 font-mono text-[0.6rem] text-current/55">
                {String(index + 1).padStart(2, "0")}
              </span>
              <item.icon aria-hidden="true" className="size-4" />
              <span>{item.label}</span>
              {item.href === "/dashboard/gear" && user.role === "CUSTOMER" && (
                <ArrowUpRight aria-hidden="true" className="ml-auto size-3.5" />
              )}
            </Link>
          );

          return (
            <li key={item.href}>
              {mobile ? <SheetClose asChild>{link}</SheetClose> : link}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function UserSummary({ user }: { user: CurrentUser }) {
  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center bg-orange font-mono text-xs font-bold text-ink"
      >
        {initials || "GU"}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold text-paper">{user.name}</p>
        <p className="truncate text-[0.62rem] font-bold uppercase tracking-[0.16em] text-paper/55">
          {user.role.toLowerCase()} account
        </p>
      </div>
    </div>
  );
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <a
        href="#dashboard-content"
        className="skip-link fixed left-4 top-3 z-[100] -translate-y-24 bg-lime px-4 py-3 font-bold text-ink focus-visible:translate-y-0"
      >
        Skip to dashboard content
      </a>

      <header className="surface-inverse sticky top-0 z-40 border-b border-paper/12 bg-background text-foreground">
        <div className="flex min-h-18 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-lg"
                  className="lg:hidden"
                  aria-label="Open dashboard navigation"
                >
                  <Menu aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="surface-inverse w-[min(88vw,22rem)] border-paper/15 bg-background p-0 text-foreground"
              >
                <SheetHeader className="border-b border-paper/12 px-6 py-6 text-left">
                  <SheetTitle className="font-display text-3xl font-black uppercase text-paper">
                    Field console
                  </SheetTitle>
                  <SheetDescription className="text-paper/60">
                    Role-scoped GearUp operations.
                  </SheetDescription>
                </SheetHeader>
                <div className="px-3 py-5">
                  <NavigationLinks user={user} mobile />
                </div>
                <div className="mt-auto border-t border-paper/12 p-5">
                  <UserSummary user={user} />
                </div>
              </SheetContent>
            </Sheet>
            <BrandMark inverse compact />
            <span className="hidden h-7 w-px bg-paper/15 sm:block" />
            <Badge variant="outline" className="hidden uppercase sm:inline-flex">
              {user.role} console
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <UserSummary user={user} />
            </div>
            <form action={logoutAction}>
              <Button variant="outline" size="compact" type="submit">
                <LogOut aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[110rem]">
        <aside className="surface-inverse sticky top-18 hidden h-[calc(100dvh-4.5rem)] w-72 shrink-0 flex-col border-r border-paper/12 bg-background text-foreground lg:flex">
          <div className="border-b border-paper/12 px-6 py-7">
            <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.2em] text-orange">
              Operations // {user.role.slice(0, 3)}
            </p>
            <p className="mt-3 font-display text-3xl font-black uppercase leading-none text-paper">
              Field console
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-5">
            <NavigationLinks user={user} />
          </div>
          <div className="border-t border-paper/12 p-5">
            <p className="text-xs leading-5 text-paper/55">
              Backend permissions remain authoritative for every action.
            </p>
          </div>
        </aside>

        <main id="dashboard-content" tabIndex={-1} className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
