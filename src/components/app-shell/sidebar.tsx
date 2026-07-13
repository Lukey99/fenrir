import Link from "next/link";
import { WolfMark } from "@/components/icons/wolf-mark";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-glass-border bg-sidebar md:flex md:flex-col dark:bg-glass dark:backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-6">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 font-heading font-semibold"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-(image:--brand-gradient) text-brand-foreground shadow-md shadow-brand/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
            <WolfMark className="size-4" />
          </span>
          Fenrir
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNav />
      </div>
    </aside>
  );
}
