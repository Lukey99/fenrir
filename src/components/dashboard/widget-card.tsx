"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WidgetCard({
  title,
  icon,
  color = "bg-brand/12 text-brand",
  index = 0,
  className,
  cardClassName,
  contentClassName,
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
  children: React.ReactNode;
}) {
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
          "group relative h-full gap-3 overflow-hidden py-5 transition-shadow duration-300 hover:shadow-lg hover:shadow-brand/10 hover:ring-brand/20 dark:hover:shadow-[0_8px_40px_rgba(157,92,255,0.25)]",
          cardClassName
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between px-5">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
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
        </CardHeader>
        <CardContent className={cn("px-5", contentClassName)}>{children}</CardContent>
      </Card>
    </motion.div>
  );
}
