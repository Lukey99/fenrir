import {
  LayoutDashboard,
  Dumbbell,
  ListChecks,
  TrendingUp,
  Trophy,
  Scale,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/programs", label: "Programmes", icon: Dumbbell },
  { href: "/exercises", label: "Exercices", icon: ListChecks },
  { href: "/progress", label: "Progression", icon: TrendingUp },
  { href: "/records", label: "Records", icon: Trophy },
  { href: "/bodyweight", label: "Poids de corps", icon: Scale },
  { href: "/settings", label: "Paramètres", icon: Settings },
];
