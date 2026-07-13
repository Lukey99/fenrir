"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function WidgetCard({
  title,
  icon,
  color = "bg-brand/12 text-brand",
  index = 0,
  className,
  cardClassName,
  contentClassName,
  plain = false,
  children,
}: {
  title: string;
  /** A rendered icon element (e.g. `<Activity className="size-3.5" />`), not a
   * component reference — this file is a client component, but its parent
   * (dashboard-overview.tsx) is a server component, and passing a bare
   * component reference across that boundary isn't serializable. */
  icon?: React.ReactNode;
  /** Literal Tailwind classes, e.g. "bg-muscle-chest/12 text-muscle-chest" */
  color?: string;
  index?: number;
  /** Applied to the outer motion wrapper — grid spanning (e.g. "lg:col-span-2"). */
  className?: string;
  /** Applied to the inner Card itself — e.g. rounding overrides. */
  cardClassName?: string;
  contentClassName?: string;
  /** Render the title/icon header and content directly on the page canvas
   * instead of inside a boxed Card — for widgets that shouldn't read as a
   * distinct panel among the others. */
  plain?: boolean;
  children: React.ReactNode;
}) {
  const header = (
    <div className={cn("flex flex-row items-center justify-between", !plain && "px-5")}>
      <span className="font-heading text-sm leading-snug font-medium text-muted-foreground">
        {title}
      </span>
      {icon && (
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6",
            color
          )}
        >
          {icon}
        </span>
      )}
    </div>
  );

  if (plain) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
        className={cn("group flex h-full flex-col gap-3", className)}
      >
        {header}
        <div className={contentClassName}>{children}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className={cn("h-full", className)}
    >
      <Card
        className={cn(
          "group relative h-full gap-3 overflow-hidden py-5 transition-shadow duration-300 hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_24px_48px_-16px_rgba(0,0,0,0.22)] dark:hover:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_24px_48px_-16px_rgba(0,0,0,0.7)]",
          cardClassName
        )}
      >
        {header}
        <CardContent className={cn("px-5", contentClassName)}>{children}</CardContent>
      </Card>
    </motion.div>
  );
}
