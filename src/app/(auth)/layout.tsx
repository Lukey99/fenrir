import Link from "next/link";
import { WolfMark } from "@/components/icons/wolf-mark";
import { AuthGlow } from "@/components/auth/auth-glow";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-4">
      <AuthGlow />
      <div className="relative w-full max-w-sm">
        <Link
          href="/"
          className="group mb-8 flex items-center justify-center gap-2 font-heading text-lg font-semibold"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-(image:--brand-gradient) text-brand-foreground shadow-md shadow-brand/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
            <WolfMark className="size-5" />
          </span>
          Fenrir
        </Link>
        {children}
      </div>
    </div>
  );
}
