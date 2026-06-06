import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cartes cadeaux BookEasy — Offrez un soin en Polynésie française",
  description:
    "Offrez une carte cadeau BookEasy à utiliser chez vos coiffeurs, spas, masseurs et professionnels du bien-être en Polynésie française. Montant libre, validité 1 an.",
  alternates: { canonical: "https://bookeasy.me/gift-cards" },
  openGraph: {
    title: "Cartes cadeaux BookEasy — Polynésie française",
    description:
      "Offrez une carte cadeau utilisable chez tous les professionnels BookEasy en Polynésie française.",
    url: "https://bookeasy.me/gift-cards",
    siteName: "BookEasy",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "/og-cover.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cartes cadeaux BookEasy",
    description:
      "Offrez une carte cadeau utilisable chez tous les professionnels BookEasy en Polynésie française.",
    images: ["/og-cover.jpg"],
  },
};

export default function GiftCardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
