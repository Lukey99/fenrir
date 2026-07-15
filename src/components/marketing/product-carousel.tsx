"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Dumbbell, PlayCircle, TrendingUp, Trophy, Scale, LayoutDashboard } from "lucide-react";

import { cn } from "@/lib/utils";
import { Screenshot } from "@/components/marketing/screenshot";

const slides = [
  {
    icon: LayoutDashboard,
    title: "Tableau de bord",
    description: "Activité des 14 derniers jours, séance suggérée et derniers records, en un coup d'œil.",
    screenshot: "dashboard",
  },
  {
    icon: Dumbbell,
    title: "Programmes sur mesure",
    description:
      "Construis tes programmes jour par jour : séries, répétitions et poids cibles pour chaque exercice.",
    screenshot: "programs",
  },
  {
    icon: PlayCircle,
    title: "Séances en direct",
    description:
      "Enregistre chaque série pendant ta séance. Remplace, saute ou ajoute un exercice à la volée.",
    screenshot: "workout",
  },
  {
    icon: TrendingUp,
    title: "Progression détaillée",
    description: "1RM estimé et historique complet, semaine après semaine, exercice par exercice.",
    screenshot: "progress",
  },
  {
    icon: Trophy,
    title: "Records personnels",
    description: "Garde une trace de tes meilleures performances, organisées par groupe musculaire.",
    screenshot: "records",
  },
  {
    icon: Scale,
    title: "Suivi du poids",
    description: "Suis ton poids, ton IMC, et ta progression vers l'objectif que tu t'es fixé.",
    screenshot: "bodyweight",
  },
] as const;

const AUTOPLAY_MS = 5500;

const variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -48 : 48, opacity: 0 }),
};

export function ProductCarousel() {
  const [[index, direction], setSlide] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function go(next: number) {
    setSlide(([current]) => {
      const wrapped = (next + slides.length) % slides.length;
      return [wrapped, wrapped > current || (current === slides.length - 1 && wrapped === 0) ? 1 : -1];
    });
  }

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => go(index + 1), AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index, paused]);

  const active = slides[index];

  return (
    <div
      className="mx-auto w-full max-w-4xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative">
        <div className="overflow-hidden rounded-3xl">
          <AnimatePresence custom={direction} mode="wait" initial={false}>
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeOut" }}
              drag="x"
              dragElastic={0.2}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(index + 1);
                else if (info.offset.x > 60) go(index - 1);
              }}
            >
              <Screenshot name={active.screenshot} alt={active.title} />
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          aria-label="Précédent"
          onClick={() => go(index - 1)}
          className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md ring-1 ring-border transition-transform hover:scale-105 sm:-left-4"
        >
          <ChevronLeft className="size-4.5" />
        </button>
        <button
          type="button"
          aria-label="Suivant"
          onClick={() => go(index + 1)}
          className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md ring-1 ring-border transition-transform hover:scale-105 sm:-right-4"
        >
          <ChevronRight className="size-4.5" />
        </button>
      </div>

      <div className="mt-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="font-heading text-xl font-semibold">{active.title}</h3>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">{active.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {slides.map((slide, i) => {
          const isActive = i === index;
          return (
            <button
              key={slide.title}
              type="button"
              onClick={() => go(i)}
              aria-current={isActive}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-brand/12 text-brand-ink"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <slide.icon className="size-3.5" />
              <span className="hidden sm:inline">{slide.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
