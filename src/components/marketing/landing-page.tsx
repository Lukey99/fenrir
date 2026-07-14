"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Dumbbell, PlayCircle, TrendingUp, Trophy, Scale } from "lucide-react";

import { cn } from "@/lib/utils";
import { WolfMark } from "@/components/icons/wolf-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { AuthGlow } from "@/components/auth/auth-glow";

const featureSections = [
  {
    icon: Dumbbell,
    title: "Programmes sur mesure",
    description:
      "Construis tes programmes jour par jour : séries, répétitions et poids cibles pour chaque exercice, avec ta propre base d'exercices personnalisés.",
    screenshot: "programs",
  },
  {
    icon: PlayCircle,
    title: "Séances en direct",
    description:
      "Enregistre chaque série pendant ta séance. Remplace, saute ou ajoute un exercice à la volée, le poids se pré-remplit depuis ta dernière séance.",
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
];

function Screenshot({ name, alt, className }: { name: string; alt: string; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.06),0_32px_64px_-24px_rgba(0,0,0,0.28)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_32px_64px_-24px_rgba(0,0,0,0.7)]",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/screenshots/${name}-light.png`} alt={alt} className="block w-full dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/screenshots/${name}-dark.png`} alt={alt} className="hidden w-full dark:block" />
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <AuthGlow />

      <header className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" className="group flex items-center gap-2 font-heading font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-(image:--brand-gradient) text-brand-foreground shadow-md shadow-brand/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
            <WolfMark className="size-4.5" />
          </span>
          Fenrir
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="sm" render={<Link href="/login" />} nativeButton={false}>
            Se connecter
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 pt-16 pb-24 sm:pt-24">
        <div className="flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl text-balance font-heading text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Ton suivi de musculation,{" "}
            <span className="bg-[linear-gradient(100deg,var(--brand)_20%,var(--brand-2)_55%,var(--ember)_85%)] bg-clip-text text-transparent">
              sans friction
            </span>
            .
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
            className="mt-4 max-w-xl text-balance text-muted-foreground sm:text-lg"
          >
            Programmes, séances en direct, progression et objectifs de poids — tout au même endroit.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: "easeOut" }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button size="lg" render={<Link href="/register" />} nativeButton={false}>
              Créer un compte gratuitement
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/login" />} nativeButton={false}>
              Se connecter
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24, ease: "easeOut" }}
          className="mx-auto mt-16 max-w-5xl sm:mt-20"
        >
          <Screenshot name="dashboard" alt="Tableau de bord Fenrir" />
        </motion.div>

        <div className="mx-auto mt-28 flex max-w-5xl flex-col gap-24 sm:mt-36 sm:gap-32">
          {featureSections.map(({ icon: Icon, title, description, screenshot }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.08, ease: "easeOut" }}
              className={cn(
                "flex flex-col items-center gap-10 sm:gap-14 lg:flex-row",
                index % 2 === 1 && "lg:flex-row-reverse"
              )}
            >
              <div className="w-full lg:w-[46%]">
                <span className="flex size-11 items-center justify-center rounded-full bg-brand/12 text-brand">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight">{title}</h2>
                <p className="mt-3 text-muted-foreground">{description}</p>
              </div>
              <div className="w-full lg:w-[54%]">
                <Screenshot name={screenshot} alt={title} />
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 border-t border-border px-4 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Fenrir
      </footer>
    </div>
  );
}
