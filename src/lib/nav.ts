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
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, primary: true },
  { href: "/programs", label: "Programmes", icon: Dumbbell, primary: true },
  { href: "/progress", label: "Progression", icon: TrendingUp, primary: true },
  { href: "/records", label: "Records", icon: Trophy, primary: true },
  { href: "/exercises", label: "Exercices", icon: ListChecks },
  { href: "/bodyweight", label: "Poids de corps", icon: Scale },
  { href: "/settings", label: "Paramètres", icon: Settings },
];
