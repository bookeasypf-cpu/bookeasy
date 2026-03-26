"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Scissors,
  Clock,
  CalendarDays,
  Calendar,
  Star,
  BarChart3,
  Gift,
  Headphones,
  Stethoscope,
  Users,
  ClipboardList,
  Activity,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Navigation items pour les secteurs classiques
const standardNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Vue d'ensemble" },
  { href: "/dashboard/profile", icon: Store, label: "Mon commerce" },
  { href: "/dashboard/services", icon: Scissors, label: "Services" },
  { href: "/dashboard/availability", icon: Clock, label: "Horaires" },
  { href: "/dashboard/bookings", icon: CalendarDays, label: "Rendez-vous" },
  { href: "/dashboard/calendar", icon: Calendar, label: "Calendrier" },
  { href: "/dashboard/reviews", icon: Star, label: "Avis" },
  { href: "/dashboard/loyalty", icon: Gift, label: "Fidélité XP" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Statistiques" },
  { href: "/dashboard/support", icon: Headphones, label: "Support" },
];

// Navigation items pour les secteurs médicaux
const medicalNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Vue d'ensemble" },
  { href: "/dashboard/profile", icon: Stethoscope, label: "Mon cabinet" },
  { href: "/dashboard/services", icon: ClipboardList, label: "Consultations" },
  { href: "/dashboard/availability", icon: Clock, label: "Horaires" },
  { href: "/dashboard/bookings", icon: CalendarDays, label: "Agenda" },
  { href: "/dashboard/calendar", icon: Calendar, label: "Calendrier" },
  { href: "/dashboard/patients", icon: Users, label: "Patients" },
  { href: "/dashboard/reviews", icon: Star, label: "Avis" },
  { href: "/dashboard/analytics", icon: Activity, label: "Statistiques" },
  { href: "/dashboard/support", icon: Heart, label: "Support" },
];

interface DashboardSidebarProps {
  isMedical?: boolean;
}

export function DashboardSidebar({ isMedical = false }: DashboardSidebarProps) {
  const pathname = usePathname();
  const navItems = isMedical ? medicalNavItems : standardNavItems;

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-[#0C1B2A] min-h-[calc(100vh-4rem)]">
      <div className="px-6 py-5">
        <span className="text-xl font-bold">
          <span className="text-white">Book</span>
          <span className="bg-gradient-to-r from-[#0066FF] to-[#00B4D8] bg-clip-text text-transparent">Easy</span>
        </span>
        {isMedical && (
          <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
            Santé
          </span>
        )}
      </div>
      <nav className="px-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? isMedical
                    ? "bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-400"
                    : "bg-white/10 text-white border-l-2 border-[#0066FF]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function DashboardMobileNav({ isMedical = false }: DashboardSidebarProps) {
  const pathname = usePathname();
  const navItems = isMedical ? medicalNavItems : standardNavItems;

  return (
    <div className="lg:hidden overflow-x-auto border-b border-gray-200 bg-white">
      <nav className="flex px-4 gap-1 min-w-max">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors",
                isActive
                  ? isMedical
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                    : "border-[#0066FF] text-[#0066FF] bg-[#0066FF]/5"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
