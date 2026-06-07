/**
 * Jours fériés en Polynésie française pour une année donnée.
 *
 * Inclut les 13 jours fériés officiels reconnus en PF :
 *   - 11 jours fériés communs avec la métropole
 *   - 2 spécifiques PF : 5 mars (arrivée de l'Évangile)
 *     et 29 juin (autonomie interne)
 *
 * Pâques est calculée via l'algorithme du computus (Meeus/Jones/Butcher),
 * d'où dérivent Mardi Gras (-47j), Lundi de Pâques (+1j), Ascension (+39j)
 * et Lundi de Pentecôte (+50j).
 */

export interface HolidayPF {
  /** Date au format "YYYY-MM-DD" (Pacific/Tahiti — pas de timezone shift). */
  date: string;
  /** Nom affiché dans l'UI. */
  name: string;
  /** Spécifique à la Polynésie française (affichage badge éventuel). */
  isPfSpecific: boolean;
}

/**
 * Algorithme du Computus (Meeus/Jones/Butcher) pour le dimanche de Pâques.
 * Retourne la date au format YYYY-MM-DD pour l'année donnée.
 */
function computeEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = mars, 4 = avril
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(d: Date): string {
  // Format YYYY-MM-DD — on travaille en UTC pour éviter les shifts
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/**
 * Retourne tous les jours fériés PF pour une année donnée, triés par date.
 */
export function getHolidaysPF(year: number): HolidayPF[] {
  const easter = computeEaster(year);

  const list: HolidayPF[] = [
    { date: `${year}-01-01`, name: "Jour de l'An", isPfSpecific: false },
    { date: toIsoDate(addDays(easter, -47)), name: "Mardi Gras", isPfSpecific: false },
    { date: `${year}-03-05`, name: "Arrivée de l'Évangile", isPfSpecific: true },
    { date: toIsoDate(addDays(easter, 1)), name: "Lundi de Pâques", isPfSpecific: false },
    { date: `${year}-05-01`, name: "Fête du Travail", isPfSpecific: false },
    { date: `${year}-05-08`, name: "Victoire 1945", isPfSpecific: false },
    { date: toIsoDate(addDays(easter, 39)), name: "Ascension", isPfSpecific: false },
    { date: toIsoDate(addDays(easter, 50)), name: "Lundi de Pentecôte", isPfSpecific: false },
    { date: `${year}-06-29`, name: "Fête de l'autonomie", isPfSpecific: true },
    { date: `${year}-07-14`, name: "Fête nationale", isPfSpecific: false },
    { date: `${year}-08-15`, name: "Assomption", isPfSpecific: false },
    { date: `${year}-11-01`, name: "Toussaint", isPfSpecific: false },
    { date: `${year}-11-11`, name: "Armistice 1918", isPfSpecific: false },
    { date: `${year}-12-25`, name: "Noël", isPfSpecific: false },
  ];

  return list.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Liste des jours fériés à venir (jusqu'à `monthsAhead` mois plus tard).
 * Couvre automatiquement le changement d'année si la fenêtre déborde.
 */
export function getUpcomingHolidaysPF(monthsAhead = 12): HolidayPF[] {
  // Calcule "today" en zone Pacific/Tahiti pour ne pas filtrer un jour
  // férié déjà passé en UTC mais encore en cours côté Tahiti.
  const todayPf = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Pacific/Tahiti" })
  );
  const today = toIsoDate(
    new Date(Date.UTC(todayPf.getFullYear(), todayPf.getMonth(), todayPf.getDate()))
  );
  const horizon = new Date(todayPf);
  horizon.setMonth(horizon.getMonth() + monthsAhead);
  const horizonStr = toIsoDate(
    new Date(Date.UTC(horizon.getFullYear(), horizon.getMonth(), horizon.getDate()))
  );

  const years = new Set<number>([
    todayPf.getFullYear(),
    horizon.getFullYear(),
  ]);
  const all: HolidayPF[] = [];
  for (const y of years) {
    all.push(...getHolidaysPF(y));
  }
  return all
    .filter((h) => h.date >= today && h.date <= horizonStr)
    .sort((a, b) => a.date.localeCompare(b.date));
}
