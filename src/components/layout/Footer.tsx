"use client";

import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0C1B2A] mt-auto">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-0.5 mb-4">
              <span className="text-xl font-bold text-white tracking-tight">
                Book
              </span>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#0066FF] to-[#00B4D8] bg-clip-text text-transparent">
                Easy
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              La plateforme de réservation en ligne n°1 en Polynésie française.
            </p>
          </div>

          {/* Column 2: Explorer */}
          <div>
            <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">
              Explorer
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/search"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Rechercher
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Carte
                </Link>
              </li>
              <li>
                <Link
                  href="/sectors"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Secteurs
                </Link>
              </li>
              <li>
                <Link
                  href="/gift-cards"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Cartes cadeaux
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Pro */}
          <div>
            <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">
              Pro
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/register?role=MERCHANT"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Devenir pro
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Tarifs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-white/30 shrink-0" />
                <span className="text-sm text-white/60">
                  contact@bookeasy.pf
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-white/30 shrink-0" />
                <span className="text-sm text-white/60">+689 40 00 00 00</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-white/30 shrink-0 mt-0.5" />
                <span className="text-sm text-white/60">
                  Papeete, Tahiti
                  <br />
                  Polynésie française
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal links bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/legal/mentions-legales" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            Mentions légales
          </Link>
          <Link href="/legal/cgu" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            Conditions générales
          </Link>
          <Link href="/legal/confidentialite" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            Politique de confidentialité
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} BookEasy. Tous droits
              réservés.
            </p>
            <p className="text-xs text-white/30">
              Made with ❤️ in Tahiti
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
