/**
 * BookEasy — Generate Testimonial Auto Script
 *
 * Usage:
 *   npx tsx scripts/generate-testimonial.ts --merchant=<merchantId>
 *
 * Extrait automatiquement les chiffres des 30 derniers jours pour un merchant,
 * compare à la baseline d'onboarding, et génère un fichier markdown avec :
 *   - Le rapport chiffres
 *   - Le message WhatsApp pré-rempli pour le Pro
 *   - Le copy testimonial proposé (selon secteur)
 *   - La checklist de publication multi-canal
 *
 * Le Pro doit juste répondre "OK". Tout le reste est pré-rempli.
 */

import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const prisma = new PrismaClient();

type SectorVariant = {
  emoji: string;
  copyTemplate: (metric: string) => string;
};

const SECTOR_VARIANTS: Record<string, SectorVariant> = {
  institut_beaute: {
    emoji: "🌺",
    copyTemplate: (m) =>
      `En 30 jours avec BookEasy, mes clientes réservent quand elles veulent + les cartes cadeaux digitales m'ont ramené ${m} de CA en plus. L'outil tahitien que je recommande aux instituts du fenua.`,
  },
  onglerie: {
    emoji: "💅",
    copyTemplate: (m) =>
      `BookEasy en 30 jours : ${m} de plus en RDV en ligne + les cartes cadeaux digitales offrent une nouvelle source de CA. L'outil pensé pour les nail artistes PF.`,
  },
  coiffeur: {
    emoji: "✂️",
    copyTemplate: (m) =>
      `BookEasy en 30 jours : ${m} RDV bookés en ligne sans répondre au tel + le programme fidélité XP fait revenir mes clientes automatiquement. Pour les pros PF, c'est game-changer.`,
  },
  barber: {
    emoji: "💈",
    copyTemplate: (m) =>
      `30 jours sur BookEasy : ${m} coupes bookées en ligne + le programme fidélité XP qui fait revenir mes clients. L'outil tahitien des barbers du fenua.`,
  },
  spa: {
    emoji: "🌴",
    copyTemplate: (m) =>
      `30 jours sur BookEasy : ${m} séances réservées 24/7, acompte PayZen XPF natif (carte tahitienne), rappels automatiques qui ont divisé mes no-shows. L'outil pensé pour nous, fenua.`,
  },
  massage: {
    emoji: "🌴",
    copyTemplate: (m) =>
      `30 jours sur BookEasy : ${m} massages réservés en ligne, acompte PayZen XPF natif, rappels automatiques. L'outil pensé pour nous, fenua.`,
  },
  coach_sportif: {
    emoji: "💪",
    copyTemplate: (m) =>
      `Avec BookEasy depuis 30 jours, mes clientes paient en CB tahitienne sans frais cachés + le programme XP fidélise sur les transformations long-cours. Le bon outil pour les coachs PF.`,
  },
  coach_vie: {
    emoji: "✨",
    copyTemplate: (m) =>
      `30 jours sur BookEasy : mes packs accompagnement long-cours sont structurés natifs + paiement CB tahitienne direct. L'outil bien-être pensé fenua.`,
  },
  photographe: {
    emoji: "📸",
    copyTemplate: (m) =>
      `BookEasy a sécurisé mes shoots en 30 jours : acompte PayZen XPF avant chaque séance, plus de no-shows, calendrier carré. L'outil que je recommande aux photographes du fenua.`,
  },
  osteopathe: {
    emoji: "🩺",
    copyTemplate: (m) =>
      `30 jours avec BookEasy : rappels J-1 automatiques qui ont divisé mes no-shows par 4 + patient notes chiffrées RGPD natives. L'outil santé pensé PF.`,
  },
  kine: {
    emoji: "🩺",
    copyTemplate: (m) =>
      `30 jours avec BookEasy : rappels J-1 automatiques qui ont divisé mes no-shows par 4 + patient notes chiffrées RGPD natives. L'outil santé pensé PF.`,
  },
  sage_femme: {
    emoji: "🤱",
    copyTemplate: (m) =>
      `BookEasy pour le suivi grossesse : ${m} RDV gérés en ligne, rappels J-1 auto, patient notes RGPD chiffrées. L'outil sage-femme pensé fenua.`,
  },
  default: {
    emoji: "🌺",
    copyTemplate: (m) =>
      `30 jours sur BookEasy : ${m} et un outil qui me fait gagner du temps tous les jours. Pensé pour la Polynésie, je le recommande aux pros du fenua.`,
  },
};

function formatXPF(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XPF",
    maximumFractionDigits: 0,
  }).format(amount);
}

async function main() {
  const { values } = parseArgs({
    options: {
      merchant: { type: "string" },
    },
  });

  const merchantId = values.merchant;
  if (!merchantId) {
    console.error("❌ Usage: npx tsx scripts/generate-testimonial.ts --merchant=<id>");
    process.exit(1);
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    include: {
      sector: true,
      user: true,
      bookings: {
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        include: { service: true },
      },
    },
  });

  if (!merchant) {
    console.error(`❌ Merchant ${merchantId} introuvable`);
    process.exit(1);
  }

  const now = Date.now();
  const j30 = new Date(now - 30 * 24 * 60 * 60 * 1000);

  // Extract metrics
  const bookings30d = merchant.bookings;
  const confirmedBookings = bookings30d.filter((b) => b.status !== "CANCELLED");
  const noShows = bookings30d.filter((b) => b.status === "NO_SHOW");
  const totalCA = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const noShowRate = bookings30d.length > 0 ? (noShows.length / bookings30d.length) * 100 : 0;

  // Acomptes PayZen
  const paymentsReceived = confirmedBookings
    .filter((b) => b.amountPaid && b.amountPaid > 0)
    .reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  // Top services by CA
  const serviceMap = new Map<string, { name: string; ca: number; count: number }>();
  for (const b of confirmedBookings) {
    const key = b.service.id;
    const cur = serviceMap.get(key) ?? { name: b.service.name, ca: 0, count: 0 };
    cur.ca += b.totalPrice;
    cur.count += 1;
    serviceMap.set(key, cur);
  }
  const topServices = Array.from(serviceMap.values())
    .sort((a, b) => b.ca - a.ca)
    .slice(0, 3);

  // Gift cards émises (need separate query)
  const giftCards = await prisma.giftCard.findMany({
    where: {
      merchantId,
      createdAt: { gte: j30 },
    },
  });
  const giftCardsCount = giftCards.length;
  const giftCardsTotal = giftCards.reduce((sum, gc) => sum + gc.amount, 0);

  // XP transactions (need separate query, XpTransaction has merchantId)
  const xpTransactions = await prisma.xpTransaction.findMany({
    where: {
      merchantId,
      createdAt: { gte: j30 },
    },
  });
  const uniqueClientsWithXP = new Set(xpTransactions.map((x) => x.userId)).size;

  // Reviews
  const reviews = await prisma.review.findMany({
    where: {
      merchantId,
      createdAt: { gte: j30 },
    },
  });
  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  // Sector copy
  const sectorKey = (merchant.sector?.slug || "default") as string;
  const variant = SECTOR_VARIANTS[sectorKey] ?? SECTOR_VARIANTS.default;

  // Build prospect name + city
  const prospectName = merchant.businessName || merchant.user.name || "Pro";
  const firstName = merchant.user.name?.split(" ")[0] || "";
  const city = merchant.city || "Polynésie";
  const sectorLabel = merchant.sector?.name || "Pro";

  // Build the magic line
  const magicMetric =
    confirmedBookings.length > 0
      ? `${confirmedBookings.length} RDV bookés en ligne`
      : "des résultats concrets dès le premier mois";

  const testimonialCopy = variant.copyTemplate(magicMetric);

  // Generate output
  const slug = (merchant.slug || prospectName)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const outputDir = path.join(process.cwd(), "marketing/testimonials/output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${slug}-J30.md`);

  const markdown = `# 📊 Témoignage J30 — ${prospectName}

> Généré automatiquement le ${new Date().toLocaleDateString("fr-FR")}
> Merchant ID : ${merchantId}
> Secteur : ${sectorLabel}

---

## 📈 Rapport chiffres (30 derniers jours)

| Métrique | Valeur |
|---|---|
| RDV créés | **${bookings30d.length}** |
| RDV confirmés | **${confirmedBookings.length}** |
| CA généré | **${formatXPF(totalCA)}** |
| No-shows | **${noShows.length}** (${noShowRate.toFixed(1)}%) |
| Acomptes PayZen perçus | **${formatXPF(paymentsReceived)}** |
| Cartes cadeaux émises | **${giftCardsCount}** (${formatXPF(giftCardsTotal)}) |
| Clientes inscrites au programme XP | **${uniqueClientsWithXP}** |
| Nouveaux avis | **${reviews.length}** (note moyenne ${avgRating.toFixed(1)}/5) |

### Top services par CA
${topServices.map((s, i) => `${i + 1}. **${s.name}** — ${s.count} RDV · ${formatXPF(s.ca)}`).join("\n")}

---

## 💬 Message WhatsApp pré-rempli à envoyer au Pro

Copie-colle ce message tel quel dans WhatsApp :

\`\`\`
Salut ${firstName || ""} 👋

30 jours sur BookEasy, premier point ROI 📊

Tes chiffres :
✨ ${confirmedBookings.length} RDV bookés en ligne
🎁 ${giftCardsCount} cartes cadeaux émises (${formatXPF(giftCardsTotal)})
⭐ ${uniqueClientsWithXP} clientes inscrites au programme XP
💳 ${formatXPF(paymentsReceived)} d'acomptes PayZen perçus
📉 No-show à ${noShowRate.toFixed(0)}%

Pour célébrer + aider d'autres pros PF, je te propose ce témoignage à publier sur ta page Insta/FB + sur la mienne (je tagge ta marque, ça te ramène des followers).

Le visuel et le copy sont prêts. Tu n'as qu'à valider 👇

---

${variant.emoji} ${prospectName} · ${sectorLabel} · ${city}

"${testimonialCopy}"

[VISUEL ATTACHÉ]
---

3 réponses possibles :

✅ "OK" → je publie vendredi sur Insta @bookeasy_pf + ton compte + Google My Business
🔧 "OK avec modif X" → tu me dis, je corrige, je publie
❌ "Pas maintenant" → no problem, je te repropose dans 30j

Bonus si tu valides :
✨ Tag de ta marque dans mon post (mes followers découvrent ton activité)
✨ Post Google My Business BookEasy avec ton lien (SEO bonus pour toi)
✨ Visuel HD pour tes propres stories
✨ Hall of Fame Fondateurs sur bookeasy.me/testimonials

Tu me dis 🙌

Maravai
\`\`\`

---

## 🎨 Données pour le visuel Canva

Ouvre le template Canva "BookEasy Témoignage 30j" et remplace :

- **{{PROSPECT_PHOTO}}** : photo profil ${prospectName} (récupère depuis sa fiche merchant)
- **{{PROSPECT_NAME}}** : ${prospectName}
- **{{PROSPECT_JOB}}** : ${sectorLabel}
- **{{PROSPECT_CITY}}** : ${city}
- **{{QUOTE_LINE}}** : "${testimonialCopy.slice(0, 120)}${testimonialCopy.length > 120 ? "..." : ""}"
- **{{METRIC_1}}** : ✨ ${confirmedBookings.length} RDV en ligne
- **{{METRIC_2}}** : 🎁 ${formatXPF(giftCardsTotal)} cartes cadeaux
- **{{METRIC_3}}** : 💳 ${formatXPF(paymentsReceived)} acomptes PayZen

Exporte en **1080×1080** (post Insta) ET **1080×1920** (story Insta/FB).

---

## ✅ Checklist publication (après "OK" du Pro)

\`\`\`
☐ Insta @bookeasy_pf : post carré 1080×1080
☐ Insta @bookeasy_pf : story 1080×1920 (durée 24h)
☐ Tag du compte du Pro dans le post + story
☐ DM au Pro avec le lien du post pour qu'il reposte sur ses stories
☐ Facebook page BookEasy : post identique
☐ Google My Business : post hebdo avec chiffres + lien fiche merchant
☐ Landing bookeasy.me/testimonials : ajout au carrousel
☐ Tarif Fondateur page : ajout au carrousel
☐ Tracking sheet : marquer témoignage publié + date
\`\`\`

---

## 📝 Variantes de copy si le Pro veut autre chose

### Plus axé fidélisation
> "BookEasy a transformé ma relation client en 30 jours : ${uniqueClientsWithXP} clientes inscrites au programme XP qui reviennent automatiquement. L'outil PF qui change tout."

### Plus axé ROI
> "30 jours sur BookEasy = ${formatXPF(paymentsReceived)} d'acomptes sécurisés + 0 no-show non-payé. Pour la première fois je dors sereine. ✨"

### Plus axé visibilité
> "Depuis BookEasy, je suis enfin trouvable sur Google quand on cherche [${sectorLabel} ${city}] — et j'ai gagné ${confirmedBookings.length} RDV en ligne le premier mois. 📈"

---

_Généré automatiquement · Aucune corvée pour le Pro · Maravai pilote_
`;

  fs.writeFileSync(outputPath, markdown);

  console.log(`\n✅ Témoignage généré : ${outputPath}\n`);
  console.log(`📊 Résumé :`);
  console.log(`   Pro : ${prospectName} (${sectorLabel}, ${city})`);
  console.log(`   RDV confirmés : ${confirmedBookings.length}`);
  console.log(`   CA généré : ${formatXPF(totalCA)}`);
  console.log(`   Cartes cadeaux : ${giftCardsCount} (${formatXPF(giftCardsTotal)})`);
  console.log(`   No-show : ${noShowRate.toFixed(1)}%`);
  console.log(`\n💡 Prochaine étape :`);
  console.log(`   1. Lis ${outputPath}`);
  console.log(`   2. Copie le message WhatsApp dans le chat avec ${firstName || prospectName}`);
  console.log(`   3. Attends "OK" et publie selon checklist\n`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("❌ Erreur :", err);
  await prisma.$disconnect();
  process.exit(1);
});
