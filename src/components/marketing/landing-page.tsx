"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { WolfMark } from "@/components/icons/wolf-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { AuthGlow } from "@/components/auth/auth-glow";
import { HeroShowcase } from "@/components/marketing/hero-showcase";
import { ProductCarousel } from "@/components/marketing/product-carousel";

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

      <main className="relative z-10 flex-1 px-4 pt-14 pb-28 sm:pt-20">
        <div className="flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-3xl text-balance font-heading text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl"
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
            className="mt-5 max-w-xl text-balance text-muted-foreground sm:text-lg"
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

        <HeroShowcase />

        <div className="mx-auto mt-8 max-w-2xl text-center sm:mt-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Fais le tour de l&apos;application
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.36, ease: "easeOut" }}
            className="mt-2 text-muted-foreground"
          >
            Chaque écran ci-dessous est une vraie capture de l&apos;application, pas une maquette.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42, ease: "easeOut" }}
          className="mt-10"
        >
          <ProductCarousel />
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-border px-4 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Fenrir
      </footer>
    </div>
  );
}
