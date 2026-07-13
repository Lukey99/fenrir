import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/app-shell/sidebar";
import { BottomTabBar } from "@/components/app-shell/bottom-tab-bar";
import { UserMenu } from "@/components/app-shell/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageTransition } from "@/components/page-transition";
import { AppGlow } from "@/components/app-shell/app-glow";
import { WolfMark } from "@/components/icons/wolf-mark";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppGlow />
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-foreground focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-background"
      >
        Aller au contenu
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-glass-border bg-glass px-4 backdrop-blur-xl md:border-b-0 md:bg-transparent md:px-6 md:backdrop-blur-none">
          <Link href="/dashboard" className="group flex items-center gap-2 font-heading font-semibold md:hidden">
            <span className="flex size-7 items-center justify-center rounded-md bg-(image:--brand-gradient) text-brand-foreground shadow-md shadow-brand/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              <WolfMark className="size-4" />
            </span>
            Fenrir
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu name={session.user.name} email={session.user.email} />
          </div>
        </header>
        <main
          id="main-content"
          className="flex-1 overflow-x-hidden overflow-y-auto px-4 pt-4 pb-24 md:p-8"
        >
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <BottomTabBar />
    </div>
  );
}
