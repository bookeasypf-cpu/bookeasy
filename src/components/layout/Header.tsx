"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  MapPin,
  Search,
  Calendar,
  User,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Star,
  Bell,
  Gift,
  Heart,
  Users,
} from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navLinkClass = (path: string) =>
    `relative flex items-center gap-1.5 text-sm font-medium transition-colors px-1 py-1 ${
      isActive(path)
        ? "text-[#0066FF]"
        : "text-[#0C1B2A]/70 hover:text-[#0066FF]"
    }`;

  const activeIndicator = (path: string) =>
    isActive(path) ? (
      <span className="absolute -bottom-[19px] left-0 right-0 h-[2px] bg-[#0066FF] rounded-full" />
    ) : null;

  return (
    <header className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logo-icon.svg"
              alt="BookEasy"
              width={32}
              height={32}
              className="shrink-0"
              priority
            />
            <span className="hidden sm:flex items-center gap-0.5">
              <span className="text-xl font-bold text-[#0C1B2A] tracking-tight">
                Book
              </span>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#0066FF] to-[#00B4D8] bg-clip-text text-transparent">
                Easy
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-3">
            <Link href="/map" className={navLinkClass("/map")}>
              <MapPin className="h-4 w-4" />
              <span className="hidden xl:inline">Explorer la</span> carte
              {activeIndicator("/map")}
            </Link>

            <Link href="/search" className={navLinkClass("/search")}>
              <Search className="h-4 w-4" />
              Rechercher
              {activeIndicator("/search")}
            </Link>

            <Link href="/gift-cards" className={navLinkClass("/gift-cards")}>
              <Gift className="h-4 w-4" />
              <span className="hidden xl:inline">Cartes</span> Cadeaux
              {activeIndicator("/gift-cards")}
            </Link>

            {session?.user?.role === "MERCHANT" && (
              <Link href="/dashboard" className={navLinkClass("/dashboard")}>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
                {activeIndicator("/dashboard")}
              </Link>
            )}

            {session?.user?.role === "CLIENT" && (
              <>
                <Link href="/my-bookings" className={navLinkClass("/my-bookings")}>
                  <Calendar className="h-4 w-4" />
                  RDV
                  {activeIndicator("/my-bookings")}
                </Link>
                <Link href="/my-rewards" className={navLinkClass("/my-rewards")}>
                  <Star className="h-4 w-4" />
                  XP
                  {activeIndicator("/my-rewards")}
                </Link>
                <Link href="/favorites" className={navLinkClass("/favorites")}>
                  <Heart className="h-4 w-4" />
                  Favoris
                  {activeIndicator("/favorites")}
                </Link>
                <Link href="/referrals" className={navLinkClass("/referrals")}>
                  <Users className="h-4 w-4" />
                  Parrainage
                  {activeIndicator("/referrals")}
                </Link>
              </>
            )}

            {/* Notifications bell */}
            {session?.user && (
              <Link
                href={session.user.role === "MERCHANT" ? "/dashboard/bookings" : "/my-bookings"}
                className="relative p-2 text-[#0C1B2A]/50 hover:text-[#0066FF] transition-colors rounded-lg hover:bg-[#0066FF]/5"
                title="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
              </Link>
            )}

            {/* Separator + Auth section */}
            <div className="h-6 w-px bg-[#0C1B2A]/10 mx-1" />

            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-[#0C1B2A]/70 hover:text-[#0066FF] transition-colors rounded-full py-1 pl-1 pr-2"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00B4D8] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                    {session.user.name
                      ? session.user.name.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <span className="max-w-[100px] truncate hidden lg:inline">
                    {session.user.name || "Profil"}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-scale-in origin-top-right">
                      <div className="px-3.5 py-2.5 border-b border-gray-100">
                        <p className="text-sm font-semibold text-[#0C1B2A] truncate">
                          {session.user.name || "Utilisateur"}
                        </p>
                        <p className="text-xs text-[#0C1B2A]/50 truncate">
                          {session.user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[#0C1B2A]/70 hover:text-[#0066FF] hover:bg-[#0066FF]/5 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Mon profil
                      </Link>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="text-sm font-medium text-[#0C1B2A]/70 hover:text-[#0066FF] transition-colors px-3 py-1.5"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold text-white bg-[#0066FF] hover:bg-[#0052CC] px-4 py-2 rounded-lg transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-[#0C1B2A]/70 hover:text-[#0066FF] transition-colors rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#0C1B2A]/5 animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/map"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive("/map")
                  ? "text-[#0066FF] bg-[#0066FF]/5"
                  : "text-[#0C1B2A]/70 hover:bg-gray-50"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              <MapPin className="h-4.5 w-4.5" />
              Explorer la carte
            </Link>

            <Link
              href="/search"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive("/search")
                  ? "text-[#0066FF] bg-[#0066FF]/5"
                  : "text-[#0C1B2A]/70 hover:bg-gray-50"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              <Search className="h-4.5 w-4.5" />
              Rechercher
            </Link>

            <Link
              href="/gift-cards"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive("/gift-cards")
                  ? "text-[#0066FF] bg-[#0066FF]/5"
                  : "text-[#0C1B2A]/70 hover:bg-gray-50"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              <Gift className="h-4.5 w-4.5" />
              Cartes cadeaux
            </Link>

            {session?.user ? (
              <>
                {session.user.role === "MERCHANT" && (
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/dashboard")
                        ? "text-[#0066FF] bg-[#0066FF]/5"
                        : "text-[#0C1B2A]/70 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard className="h-4.5 w-4.5" />
                    Dashboard
                  </Link>
                )}

                {session.user.role === "CLIENT" && (
                  <>
                    <Link
                      href="/my-bookings"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive("/my-bookings")
                          ? "text-[#0066FF] bg-[#0066FF]/5"
                          : "text-[#0C1B2A]/70 hover:bg-gray-50"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Calendar className="h-4.5 w-4.5" />
                      Mes RDV
                    </Link>
                    <Link
                      href="/my-rewards"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive("/my-rewards")
                          ? "text-[#0066FF] bg-[#0066FF]/5"
                          : "text-[#0C1B2A]/70 hover:bg-gray-50"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Star className="h-4.5 w-4.5" />
                      Mes XP
                    </Link>
                    <Link
                      href="/favorites"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive("/favorites")
                          ? "text-[#0066FF] bg-[#0066FF]/5"
                          : "text-[#0C1B2A]/70 hover:bg-gray-50"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Heart className="h-4.5 w-4.5" />
                      Mes favoris
                    </Link>
                    <Link
                      href="/referrals"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive("/referrals")
                          ? "text-[#0066FF] bg-[#0066FF]/5"
                          : "text-[#0C1B2A]/70 hover:bg-gray-50"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Users className="h-4.5 w-4.5" />
                      Parrainage
                    </Link>
                  </>
                )}

                <div className="border-t border-[#0C1B2A]/5 my-1.5" />

                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#0C1B2A]/70 hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00B4D8] flex items-center justify-center text-white text-[10px] font-semibold">
                    {session.user.name
                      ? session.user.name.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  {session.user.name || "Mon profil"}
                </Link>

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-[#0C1B2A]/5 my-1.5" />
                <div className="flex gap-2 px-3 pt-1 pb-2">
                  <Link
                    href="/login"
                    className="flex-1 text-center text-sm font-medium text-[#0C1B2A]/70 border border-[#0C1B2A]/10 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 text-center text-sm font-semibold text-white bg-[#0066FF] hover:bg-[#0052CC] py-2.5 rounded-lg transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Inscription
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
