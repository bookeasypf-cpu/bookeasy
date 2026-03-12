"use client";

/**
 * SectorIcon — Professional SVG icons for each business sector.
 * Rendered as clean line-art style icons, designed to look great
 * on gradient card backgrounds at large sizes.
 */

interface SectorIconProps {
  sector: string;
  className?: string;
  size?: number;
}

export function SectorIcon({ sector, className = "", size = 64 }: SectorIconProps) {
  const normalized = sector.toLowerCase().trim();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {getIconPath(normalized)}
    </svg>
  );
}

function getIconPath(sector: string) {
  // ── Coach sportif / Sport ──
  if (sector.includes("coach") || sector.includes("sport") || sector.includes("gym") || sector.includes("fitness")) {
    return (
      <>
        {/* Dumbbell */}
        <line x1="16" y1="32" x2="48" y2="32" />
        <rect x="10" y="26" width="6" height="12" rx="1.5" />
        <rect x="48" y="26" width="6" height="12" rx="1.5" />
        <rect x="6" y="28" width="4" height="8" rx="1" />
        <rect x="54" y="28" width="4" height="8" rx="1" />
        {/* Pulse line */}
        <polyline points="18,48 24,48 28,42 32,54 36,44 40,48 46,48" strokeWidth="1.5" />
      </>
    );
  }

  // ── Coiffeur ──
  if (sector.includes("coiffeur") || sector.includes("coiffure")) {
    return (
      <>
        {/* Scissors */}
        <circle cx="22" cy="42" r="6" />
        <circle cx="42" cy="42" r="6" />
        <line x1="26.5" y1="37.5" x2="37.5" y2="37.5" />
        <line x1="26.5" y1="37.5" x2="40" y2="14" />
        <line x1="37.5" y1="37.5" x2="24" y2="14" />
        {/* Hair strand accent */}
        <path d="M 28,12 C 30,8 34,8 36,12" strokeWidth="1.5" />
      </>
    );
  }

  // ── Barber ──
  if (sector.includes("barber")) {
    return (
      <>
        {/* Barber pole */}
        <rect x="24" y="8" width="16" height="48" rx="8" />
        <line x1="24" y1="14" x2="40" y2="14" />
        <line x1="24" y1="50" x2="40" y2="50" />
        {/* Diagonal stripes */}
        <line x1="24" y1="22" x2="40" y2="30" strokeWidth="1.5" />
        <line x1="24" y1="30" x2="40" y2="38" strokeWidth="1.5" />
        <line x1="24" y1="38" x2="40" y2="46" strokeWidth="1.5" />
        {/* Small scissors */}
        <circle cx="50" cy="20" r="3" strokeWidth="1.3" />
        <circle cx="56" cy="26" r="3" strokeWidth="1.3" />
        <line x1="48" y1="22" x2="54" y2="28" strokeWidth="1.3" />
      </>
    );
  }

  // ── Esthéticienne / Institut de beauté ──
  if (sector.includes("esth") || sector.includes("beaut")) {
    return (
      <>
        {/* Face silhouette */}
        <path d="M 32,8 C 20,8 12,18 12,30 C 12,42 20,52 32,56 C 44,52 52,42 52,30 C 52,18 44,8 32,8" />
        {/* Eye */}
        <path d="M 22,28 C 24,26 28,26 30,28 C 28,30 24,30 22,28" strokeWidth="1.5" />
        <path d="M 34,28 C 36,26 40,26 42,28 C 40,30 36,30 34,28" strokeWidth="1.5" />
        {/* Lips */}
        <path d="M 26,38 C 28,36 32,35 32,35 C 32,35 36,36 38,38 C 36,41 28,41 26,38" strokeWidth="1.5" />
        {/* Sparkle */}
        <line x1="50" y1="12" x2="50" y2="18" strokeWidth="1.3" />
        <line x1="47" y1="15" x2="53" y2="15" strokeWidth="1.3" />
      </>
    );
  }

  // ── Spa & Bien-être ──
  if (sector.includes("spa") || sector.includes("bien")) {
    return (
      <>
        {/* Lotus flower */}
        <path d="M 32,50 C 32,38 24,28 18,24 C 22,30 22,40 32,50" />
        <path d="M 32,50 C 32,38 40,28 46,24 C 42,30 42,40 32,50" />
        <path d="M 32,50 C 32,36 28,22 32,14 C 36,22 32,36 32,50" />
        <path d="M 32,50 C 28,40 16,34 10,32 C 18,36 26,42 32,50" />
        <path d="M 32,50 C 36,40 48,34 54,32 C 46,36 38,42 32,50" />
        {/* Water drops */}
        <circle cx="14" cy="50" r="2" strokeWidth="1.3" />
        <circle cx="50" cy="50" r="2" strokeWidth="1.3" />
        <circle cx="32" cy="56" r="1.5" strokeWidth="1.3" />
      </>
    );
  }

  // ── Manucure & Onglerie ──
  if (sector.includes("manucure") || sector.includes("ongle") || sector.includes("nail")) {
    return (
      <>
        {/* Hand outline */}
        <path d="M 20,52 L 20,30 C 20,28 22,26 24,26 L 24,20 C 24,18 26,16 28,16 C 30,16 32,18 32,20 L 32,16 C 32,14 34,12 36,12 C 38,12 40,14 40,16 L 40,18 C 40,16 42,14 44,14 C 46,14 48,16 48,18 L 48,30 C 48,28 50,26 52,28 L 52,36 C 52,44 46,52 38,52 L 20,52 Z" />
        {/* Nail polish on middle finger */}
        <path d="M 34,14 L 34,20 C 34,20 36,20 38,18 L 38,14" strokeWidth="1.3" />
        {/* Polish bottle */}
        <rect x="8" y="38" width="8" height="14" rx="2" strokeWidth="1.3" />
        <line x1="10" y1="38" x2="10" y2="34" strokeWidth="1.3" />
        <line x1="14" y1="38" x2="14" y2="34" strokeWidth="1.3" />
        <line x1="10" y1="34" x2="14" y2="34" strokeWidth="1.3" />
      </>
    );
  }

  // ── Massage ──
  if (sector.includes("massage")) {
    return (
      <>
        {/* Person lying down on table */}
        <line x1="8" y1="40" x2="56" y2="40" strokeWidth="2" />
        {/* Table legs */}
        <line x1="12" y1="40" x2="10" y2="52" />
        <line x1="52" y1="40" x2="54" y2="52" />
        {/* Person body */}
        <path d="M 16,36 C 20,32 28,30 36,30 C 42,30 48,32 50,36" />
        {/* Head */}
        <circle cx="14" cy="32" r="5" />
        {/* Hands doing massage */}
        <path d="M 30,24 C 32,20 34,18 36,20 C 38,22 36,26 34,28" strokeWidth="1.5" />
        <path d="M 38,24 C 40,20 42,18 44,20 C 46,22 44,26 42,28" strokeWidth="1.5" />
        {/* Steam / relaxation waves */}
        <path d="M 22,18 C 23,14 25,16 26,12" strokeWidth="1.2" />
        <path d="M 28,16 C 29,12 31,14 32,10" strokeWidth="1.2" />
      </>
    );
  }

  // ── Dentiste ──
  if (sector.includes("dentiste") || sector.includes("dent")) {
    return (
      <>
        {/* Tooth shape */}
        <path d="M 22,14 C 18,14 14,18 14,24 C 14,32 18,36 20,44 C 22,50 24,54 26,54 C 28,54 30,48 32,42 C 34,48 36,54 38,54 C 40,54 42,50 44,44 C 46,36 50,32 50,24 C 50,18 46,14 42,14 C 38,14 36,18 32,18 C 28,18 26,14 22,14 Z" />
        {/* Sparkle clean */}
        <line x1="54" y1="14" x2="54" y2="22" strokeWidth="1.3" />
        <line x1="50" y1="18" x2="58" y2="18" strokeWidth="1.3" />
        <circle cx="10" cy="44" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="8" cy="38" r="1" fill="currentColor" stroke="none" />
      </>
    );
  }

  // ── Médecin ──
  if (sector.includes("medecin") || sector.includes("médecin") || sector.includes("doctor")) {
    return (
      <>
        {/* Stethoscope */}
        <path d="M 20,12 L 20,28 C 20,36 26,42 32,42 C 38,42 44,36 44,28 L 44,12" />
        <circle cx="20" cy="10" r="3" />
        <circle cx="44" cy="10" r="3" />
        <circle cx="32" cy="46" r="5" />
        <circle cx="32" cy="46" r="2" fill="currentColor" stroke="none" />
        {/* Cross */}
        <line x1="8" y1="50" x2="8" y2="58" strokeWidth="2" />
        <line x1="4" y1="54" x2="12" y2="54" strokeWidth="2" />
      </>
    );
  }

  // ── Tatoueur ──
  if (sector.includes("tatoueur") || sector.includes("tattoo")) {
    return (
      <>
        {/* Tattoo machine body */}
        <rect x="26" y="8" width="12" height="28" rx="3" />
        {/* Needle */}
        <line x1="32" y1="36" x2="32" y2="50" strokeWidth="1.5" />
        <circle cx="32" cy="52" r="2" />
        {/* Grip detail */}
        <line x1="26" y1="16" x2="38" y2="16" strokeWidth="1.3" />
        <line x1="26" y1="20" x2="38" y2="20" strokeWidth="1.3" />
        <line x1="26" y1="24" x2="38" y2="24" strokeWidth="1.3" />
        {/* Ink drops */}
        <circle cx="42" cy="48" r="2.5" strokeWidth="1.3" />
        <circle cx="22" cy="50" r="2" strokeWidth="1.3" />
        {/* Design accent - small star */}
        <path d="M 50,18 L 52,14 L 54,18 L 50,16 L 54,16 Z" strokeWidth="1" />
        <path d="M 10,22 L 12,18 L 14,22 L 10,20 L 14,20 Z" strokeWidth="1" />
      </>
    );
  }

  // ── Autre (default — grid/services icon) ──
  return (
    <>
      {/* Grid of dots representing various services */}
      <rect x="12" y="12" width="16" height="16" rx="4" />
      <rect x="36" y="12" width="16" height="16" rx="4" />
      <rect x="12" y="36" width="16" height="16" rx="4" />
      <rect x="36" y="36" width="16" height="16" rx="4" />
      {/* Center connection */}
      <circle cx="32" cy="32" r="3" fill="currentColor" stroke="none" />
    </>
  );
}
