import Link from "next/link";
import { Check, Star, Zap, Crown, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs - BookEasy",
  description:
    "Découvrez les tarifs BookEasy pour les professionnels. Commencez gratuitement et évoluez selon vos besoins.",
};

const plans = [
  {
    name: "Gratuit",
    price: "0",
    period: "pour toujours",
    description: "Parfait pour d\u00e9marrer et tester la plateforme.",
    icon: Zap,
    color: "#0066FF",
    features: [
      "Profil professionnel complet",
      "Jusqu'\u00e0 5 services",
      "Gestion des r\u00e9servations",
      "Calendrier int\u00e9gr\u00e9",
      "Notifications email",
      "Avis clients",
      "Visibilit\u00e9 sur la carte",
    ],
    cta: "Commencer gratuitement",
    href: "/register?role=MERCHANT",
    popular: false,
  },
  {
    name: "Pro",
    price: "4 900",
    period: "F CFP / mois",
    description: "Pour les professionnels qui veulent se d\u00e9marquer.",
    icon: Star,
    color: "#0066FF",
    features: [
      "Tout du plan Gratuit",
      "Services illimit\u00e9s",
      "Mise en avant dans les recherches",
      "Badge \u00ab Pro v\u00e9rifi\u00e9 \u00bb",
      "Statistiques avanc\u00e9es",
      "Rappels SMS aux clients",
      "Support prioritaire",
    ],
    cta: "Choisir Pro",
    href: "/register?role=MERCHANT&plan=pro",
    popular: true,
  },
  {
    name: "Premium",
    price: "9 900",
    period: "F CFP / mois",
    description: "Pour les \u00e9tablissements ambitieux.",
    icon: Crown,
    color: "#8B5CF6",
    features: [
      "Tout du plan Pro",
      "Multi-employ\u00e9s",
      "Agenda par collaborateur",
      "Page personnalis\u00e9e",
      "Domaine personnalis\u00e9",
      "API & int\u00e9grations",
      "Account manager d\u00e9di\u00e9",
    ],
    cta: "Choisir Premium",
    href: "/register?role=MERCHANT&plan=premium",
    popular: false,
  },
];

const faqs = [
  {
    q: "Puis-je changer de plan \u00e0 tout moment ?",
    a: "Oui, vous pouvez upgrader ou downgrader votre plan \u00e0 tout moment. Le changement prend effet imm\u00e9diatement.",
  },
  {
    q: "Y a-t-il un engagement ?",
    a: "Non, aucun engagement. Vous pouvez annuler votre abonnement \u00e0 tout moment sans frais.",
  },
  {
    q: "Le plan Gratuit est-il vraiment gratuit ?",
    a: "Oui ! Le plan Gratuit est 100% gratuit, sans carte bancaire requise. Vous pouvez l'utiliser aussi longtemps que vous le souhaitez.",
  },
  {
    q: "Comment fonctionne le paiement ?",
    a: "Les paiements sont pr\u00e9lev\u00e9s mensuellement. Nous acceptons les cartes bancaires et les virements.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0C1B2A] to-[#132D46] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Des tarifs simples et transparents
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-lg">
            Commencez gratuitement, &eacute;voluez quand vous &ecirc;tes
            pr&ecirc;t. Sans engagement.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl bg-white p-6 sm:p-8 flex flex-col ${
                  plan.popular
                    ? "border-2 border-[#0066FF] shadow-xl shadow-[#0066FF]/10 scale-[1.02] md:scale-105"
                    : "border border-gray-200 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#0066FF] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                      Populaire
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${plan.color}15, ${plan.color}25)`,
                    }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: plan.color }}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {plan.name}
                  </h3>
                </div>

                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 ml-1 text-sm">
                    {plan.period}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-gray-600"
                    >
                      <Check
                        className="h-4 w-4 shrink-0 mt-0.5"
                        style={{ color: plan.color }}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`w-full py-3 px-4 rounded-xl text-center font-semibold text-sm transition-all duration-200 ${
                    plan.popular
                      ? "bg-[#0066FF] text-white hover:bg-[#0052CC] shadow-lg shadow-[#0066FF]/25"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Questions fr&eacute;quentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-white rounded-xl p-5 border border-gray-100"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-4">
              Vous avez d&apos;autres questions ?
            </p>
            <Link
              href="mailto:contact@bookeasy.pf"
              className="inline-flex items-center gap-2 text-[#0066FF] font-semibold hover:underline"
            >
              Contactez-nous <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
