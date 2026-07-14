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
  /** Shown as its own slot in the mobile bottom tab bar — kept to 4 for
   * thumb reach; everything else lives behind the "Plus" tab. */
  primary?: boolean;
  /** Short override for the bottom tab bar, whose columns are too narrow for
   * some full labels (e.g. "Tableau de bord" wraps to two lines there while
   * every other tab fits on one, breaking the row's alignment). */
  mobileLabel?: string;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", mobileLabel: "Accueil", icon: LayoutDashboard, primary: true },
  { href: "/programs", label: "Programmes", icon: Dumbbell, primary: true },
  { href: "/progress", label: "Progression", icon: TrendingUp, primary: true },
  { href: "/records", label: "Records", icon: Trophy, primary: true },
  { href: "/exercises", label: "Exercices", icon: ListChecks },
  { href: "/bodyweight", label: "Poids de corps", icon: Scale },
  { href: "/settings", label: "Paramètres", icon: Settings },
];
