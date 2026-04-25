"use client";

import Link from "next/link";
import { MapPin, Mail } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function Footer() {
  return (
    <footer className="bg-[#0C1B2A] mt-auto">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Brand */}
          <ScrollReveal delay={0}>
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-0.5 mb-4 group">
                <span className="text-xl font-bold text-white tracking-tight">
                  Book
                </span>
                <span className="text-xl font-bold tracking-tight text-shimmer">
                  Easy
                </span>
              </Link>
              <p className="text-sm text-white/50 leading-relaxed max-w-xs">
                La plateforme de réservation en ligne n°1 en Polynésie française.
              </p>
            </div>
          </ScrollReveal>

          {/* Column 2: Explorer */}
          <ScrollReveal delay={100}>
            <div>
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">
                Explorer
              </h3>
              <ul className="space-y-3">
                {[
                  { href: "/search", label: "Rechercher" },
                  { href: "/map", label: "Carte" },
                  { href: "/sectors", label: "Secteurs" },
                  { href: "/gift-cards", label: "Cartes cadeaux" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group/link relative text-sm text-white/60 hover:text-white transition-colors inline-block"
                    >
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-gradient-to-r from-[#0066FF] to-[#00B4D8] transition-all duration-300 group-hover/link:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Column 3: Pro */}
          <ScrollReveal delay={200}>
            <div>
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">
                Pro
              </h3>
              <ul className="space-y-3">
                {[
                  { href: "/register?role=MERCHANT", label: "Devenir pro" },
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/pricing", label: "Tarifs" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group/link relative text-sm text-white/60 hover:text-white transition-colors inline-block"
                    >
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-gradient-to-r from-[#0066FF] to-[#00B4D8] transition-all duration-300 group-hover/link:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Column 4: Contact */}
          <ScrollReveal delay={300}>
            <div>
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">
                Contact
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-white/30 shrink-0" />
                  <a
                    href="mailto:bookeasy.pf@gmail.com"
                    className="group/link relative text-sm text-white/60 hover:text-white transition-colors inline-block"
                  >
                    bookeasy.pf@gmail.com
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-gradient-to-r from-[#0066FF] to-[#00B4D8] transition-all duration-300 group-hover/link:w-full" />
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-white/30 shrink-0 mt-0.5" />
                  <span className="text-sm text-white/60">
                    Punaauia, Tahiti
                    <br />
                    Polynésie française
                  </span>
                </li>
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Legal links bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-x-6 gap-y-2">
          {[
            { href: "/legal/mentions-legales", label: "Mentions légales" },
            { href: "/legal/cgu", label: "Conditions générales" },
            { href: "/legal/confidentialite", label: "Politique de confidentialité" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group/link relative text-xs text-white/30 hover:text-white/60 transition-colors inline-block"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-white/20 transition-all duration-300 group-hover/link:w-full" />
            </Link>
          ))}
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
              Made with <span className="inline-block animate-pulse-soft text-red-400">❤️</span> in Tahiti
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
