"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

/** The dashboard's welcome line, relocated into the shared header — only
 * shown on /dashboard itself. */
export function HeaderGreeting({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  if (pathname !== "/dashboard") return null;

  return (
    <motion.p
      key={pathname}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="hidden min-w-0 truncate text-sm font-medium md:block"
    >
      Bienvenue
      {userName && (
        <>
          {", "}
          <span className="bg-[linear-gradient(100deg,var(--brand)_20%,var(--brand-2)_55%,var(--ember)_85%)] bg-clip-text text-transparent">
            {userName}
          </span>
        </>
      )}{" "}
      👋
    </motion.p>
  );
}
