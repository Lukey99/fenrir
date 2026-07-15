"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";
import { navItems } from "@/lib/nav";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const primaryItems = navItems.filter((item) => item.primary);
const moreItems = navItems.filter((item) => !item.primary);

/** Fixed thumb-reachable tab bar for mobile — replaces the hamburger sheet as
 * the primary way to move around the app. A hamburger is a website pattern;
 * a bottom bar is what a native training app actually feels like. */
export function BottomTabBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const isMoreActive = moreItems.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <>
      <nav
        className="fixed inset-x-4 z-40 rounded-2xl bg-sidebar shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)] md:hidden dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)]"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
        aria-label="Navigation principale"
      >
        <div className="flex items-stretch justify-around">
          {primaryItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium"
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-bar-active"
                    className="absolute top-1 size-1.5 rounded-full bg-brand"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "size-5 transition-transform duration-200",
                    isActive ? "scale-110 text-brand" : "text-muted-foreground"
                  )}
                />
                <span className={cn("whitespace-nowrap", isActive ? "text-brand" : "text-muted-foreground")}>
                  {item.mobileLabel ?? item.label}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="relative flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium"
          >
            {isMoreActive && (
              <motion.span
                layoutId="tab-bar-active"
                className="absolute top-1 size-1.5 rounded-full bg-brand"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Menu
              className={cn(
                "size-5 transition-transform duration-200",
                isMoreActive ? "scale-110 text-brand" : "text-muted-foreground"
              )}
            />
            <span className={isMoreActive ? "text-brand" : "text-muted-foreground"}>Plus</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl p-0">
          <SheetHeader className="border-b border-border px-6 py-4">
            <SheetTitle>Plus</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-3 py-3">
            {moreItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive ? "bg-brand/12 text-brand-ink" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="size-4.5" />
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="size-4.5" />
              Se déconnecter
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
