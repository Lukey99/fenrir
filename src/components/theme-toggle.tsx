"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun, Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const options = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Système", icon: Monitor },
] as const;

const emptySubscribe = () => () => {};

// Theme is only known client-side; this reports `false` during SSR/hydration
// and `true` right after, without the cascading-render effect+setState pattern.
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const current = options.find((o) => o.value === theme) ?? options[2];
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" aria-label="Changer le thème" />}
            >
              <span className="relative flex size-4 items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  {mounted ? (
                    <motion.span
                      key={current.value}
                      initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Icon className="size-4" />
                    </motion.span>
                  ) : (
                    <span className="size-4" />
                  )}
                </AnimatePresence>
              </span>
            </DropdownMenuTrigger>
          }
        />
        <TooltipContent>Apparence</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        {options.map(({ value, label, icon: OptionIcon }) => (
          <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
            <OptionIcon className="size-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
