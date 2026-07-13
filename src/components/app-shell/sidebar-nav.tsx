"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { navItems, type NavItem } from "@/lib/nav";

function NavSection({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 pt-4 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
              isActive
                ? "bg-brand/10 text-brand"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="sidebar-active-bar"
                className="absolute inset-y-1 left-0 w-1 rounded-full bg-brand"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon className="size-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const primaryItems = navItems.filter((item) => item.primary);
  const secondaryItems = navItems.filter((item) => !item.primary);

  return (
    <nav className="flex flex-col">
      <NavSection label="Menu" items={primaryItems} onNavigate={onNavigate} />
      <NavSection label="Général" items={secondaryItems} onNavigate={onNavigate} />
    </nav>
  );
}
