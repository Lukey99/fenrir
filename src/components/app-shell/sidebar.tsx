import Link from "next/link";
import { WolfMark } from "@/components/icons/wolf-mark";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { MagneticButton } from "@/components/ui/magnetic-button";

export function Sidebar() {
  return (
    <aside className="hidden shrink-0 p-4 md:flex md:w-72 md:flex-col">
      <div className="flex h-full flex-col rounded-3xl bg-sidebar p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_20px_40px_-16px_rgba(0,0,0,0.18)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_20px_40px_-16px_rgba(0,0,0,0.6)]">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 px-2 py-2 font-heading font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-(image:--brand-gradient) text-brand-foreground shadow-md shadow-brand/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
            <WolfMark className="size-4.5" />
          </span>
          Fenrir
        </Link>

        <div className="mt-2 flex-1 overflow-y-auto">
          <SidebarNav />
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-(image:--brand-gradient) px-4 py-5 text-brand-foreground">
          <p className="text-sm font-semibold">Prêt à t&apos;entraîner ?</p>
          <p className="text-xs text-brand-foreground/75">
            Lance ta prochaine séance depuis tes programmes.
          </p>
          <MagneticButton
            size="sm"
            variant="secondary"
            className="w-fit"
            render={<Link href="/programs" />}
            nativeButton={false}
          >
            Voir mes programmes
          </MagneticButton>
        </div>
      </div>
    </aside>
  );
}
