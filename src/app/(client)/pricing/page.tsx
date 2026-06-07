import { Check, Zap, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { QuickRegisterForm } from "@/components/ui/QuickRegisterForm";
import { FAQ } from "@/components/ui/FAQ";
import { FAQPageJsonLd } from "@/lib/jsonld";
import { ROICalculator } from "@/components/ui/ROICalculator";
import { PricingProCard } from "@/components/pricing/PricingProCard";
import { getFounderSlotsLeft } from "@/lib/pricing";

// Founder slots count + plan availability dépendent de la DB → revalider
// à chaque visite (impossible de cacher statiquement sans afficher des
// places fantômes après que le 10e slot soit pris).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tarifs professionnels — Gratuit & Pro | BookEasy Polynésie",
  description:
    "Tarifs BookEasy pour les professionnels en Polynésie française. Plan Gratuit pour démarrer, Plan Pro avec analytics, avis clients et mise en avant. Tarif fondateur disponible.",
  alternates: { canonical: "https://bookeasy.me/pricing" },
  openGraph: {
    title: "Tarifs Pro — BookEasy Polynésie",
    description:
      "Plan Gratuit & Plan Pro pour professionnels en Polynésie française. Tarif fondateur en cours.",
    url: "https://bookeasy.me/pricing",
    siteName: "BookEasy",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "/og-cover.jpg?v=4", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og-cover.jpg?v=4"] },
};

const proFeatures = [
  "Tout du plan Gratuit",
  "Services illimités",
  "Avis clients & notes étoiles affichés sur votre fiche",
  "Mise en avant prioritaire dans les recherches",
  "Badge « Pro vérifié » sur votre fiche",
  "Visuel personnalisé au partage social (WhatsApp, Facebook)",
  "Référencement enrichi Google & moteurs IA (ChatGPT, Perplexity)",
  "Dashboard analytics complet (revenus, top services, fréquentation)",
  "Rappels email automatiques aux clients (J-1)",
  "Programme fidélité XP personnalisable",
  "Multi-employés & agenda par collaborateur (bientôt)",
  "Support prioritaire",
];

const freeFeatures = [
  "Profil professionnel complet",
  "Jusqu'à 3 services",
  "Gestion des réservations",
  "Calendrier intégré",
  "Notifications email",
  "Visibilité sur la carte + Google",
  "Notifications push (PWA mobile)",
  "Réception de cartes cadeaux clients",
];

const faqs = [
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement prend effet immédiatement.",
  },
  {
    q: "Y a-t-il un engagement ?",
    a: "Non, aucun engagement. Vous pouvez annuler votre abonnement à tout moment sans frais.",
  },
  {
    q: "Le plan Gratuit est-il vraiment gratuit ?",
    a: "Oui ! Le plan Gratuit est 100% gratuit, sans carte bancaire requise. Vous pouvez l'utiliser aussi longtemps que vous le souhaitez.",
  },
  {
    q: "Comment fonctionne le paiement ?",
    a: "Les paiements sont prélevés mensuellement par carte bancaire via PayZen by OSB, notre partenaire de paiement sécurisé basé en Polynésie française.",
  },
];

export default async function PricingPage() {
  const founderSlotsLeft = await getFounderSlotsLeft();
  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0C1B2A] to-[#132D46] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Développez votre activité
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-lg">
            Commencez gratuitement, évoluez quand vous êtes
            prêt. Sans engagement.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto items-stretch">
          {/* Free plan — static card */}
          <div className="relative rounded-2xl bg-white dark:bg-gray-900 p-6 sm:p-8 flex flex-col border border-gray-200 dark:border-gray-800 shadow-md shadow-gray-200/40 dark:shadow-gray-900/50">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #0066FF15, #0066FF25)" }}
              >
                <Zap className="h-5 w-5 text-[#0066FF]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gratuit</h3>
            </div>
            <div className="mb-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">0</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1 text-sm">pour toujours</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Parfait pour démarrer et tester la plateforme.
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {freeFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300"
                >
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-[#0066FF]" />
                  {feature}
                </li>
              ))}
            </ul>
            {/* Native <a> for hash href — Next.js <Link> on Next 16 doesn't
                always trigger browser scroll when path is unchanged. */}
            <a
              href="#inscription-pro"
              className="w-full py-3 px-4 rounded-xl text-center font-semibold text-sm transition-all duration-200 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 block"
            >
              Commencer gratuitement
            </a>
          </div>

          {/* Pro plan — client component (toggle Mensuel/Annuel + founder) */}
          <PricingProCard
            founderSlotsLeft={founderSlotsLeft}
            features={proFeatures}
          />
        </div>
      </div>

      {/* ROI Calculator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="max-w-xl mx-auto">
          <ROICalculator />
        </div>
      </div>

      {/* Quick Registration */}
      <div id="inscription-pro" className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 scroll-mt-24">
        <div className="max-w-md mx-auto bg-gradient-to-br from-[#0C1B2A] to-[#132D46] rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Inscrivez-vous en 30 secondes
          </h2>
          <p className="text-white/60 text-sm mb-6">
            Créez votre compte professionnel et commencez à recevoir des réservations.
          </p>
          <QuickRegisterForm />
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <FAQPageJsonLd items={faqs.map((f) => ({ question: f.q, answer: f.a }))} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Questions fréquentes
          </h2>
          <FAQ
            items={faqs.map((faq) => ({
              question: faq.q,
              answer: faq.a,
            }))}
          />

          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Vous avez d&apos;autres questions ?
            </p>
            {/* Plain anchor — next/link doesn't reliably open mailto: */}
            <a
              href="mailto:bookeasy.pf@gmail.com"
              className="inline-flex items-center gap-2 text-[#0066FF] font-semibold hover:underline"
            >
              Contactez-nous <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
