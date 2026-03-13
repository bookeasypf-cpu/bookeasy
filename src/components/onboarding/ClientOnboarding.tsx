"use client";

import {
  Search,
  CalendarCheck,
  Star,
  Gift,
  MapPin,
} from "lucide-react";
import OnboardingTutorial from "./OnboardingTutorial";
import type { OnboardingStep } from "./OnboardingTutorial";

const clientSteps: OnboardingStep[] = [
  {
    icon: <Search className="h-7 w-7" />,
    title: "Trouvez un professionnel",
    description:
      "Recherchez par nom, secteur d'activité ou ville. Parcourez les catégories ou utilisez la barre de recherche pour trouver le pro qu'il vous faut.",
    tips: [
      "Utilisez les filtres par secteur : coiffure, spa, tatouage, dentiste...",
      "Consultez les avis et notes des autres clients avant de choisir",
      "Comparez les prix et services de chaque professionnel",
    ],
  },
  {
    icon: <MapPin className="h-7 w-7" />,
    title: "Explorez la carte",
    description:
      "Visualisez tous les professionnels autour de vous sur la carte interactive. Filtrez par secteur pour trouver ce que vous cherchez.",
    tips: [
      "Cliquez sur un marqueur pour voir les détails du professionnel",
      "Filtrez par catégorie grâce aux boutons en haut",
      "Basculez entre la vue carte et la vue liste sur mobile",
    ],
  },
  {
    icon: <CalendarCheck className="h-7 w-7" />,
    title: "Réservez en 3 étapes",
    description:
      "Choisissez une prestation, sélectionnez un créneau libre, puis confirmez votre rendez-vous. C'est rapide et simple !",
    tips: [
      "Étape 1 : Choisissez la prestation souhaitée",
      "Étape 2 : Sélectionnez la date et l'heure qui vous convient",
      "Étape 3 : Vérifiez le récap et confirmez votre réservation",
    ],
  },
  {
    icon: <Star className="h-7 w-7" />,
    title: "Gagnez des XP",
    description:
      "À chaque réservation, vous gagnez automatiquement des points XP chez le professionnel ! Plus vous réservez, plus vous accumulez.",
    tips: [
      "Les XP sont affichés à côté de chaque prestation lors de la réservation",
      "Chaque professionnel a son propre compteur XP",
      "Si vous annulez un RDV, les XP sont automatiquement retirés",
    ],
  },
  {
    icon: <Gift className="h-7 w-7" />,
    title: "Échangez vos récompenses",
    description:
      "Quand vous avez assez de XP, échangez-les contre des récompenses : réductions, prestations gratuites, cadeaux... Chaque pro définit ses propres récompenses.",
    tips: [
      "Allez dans « Mes XP » pour voir vos points par professionnel",
      "Cliquez sur « Échanger » quand vous avez assez de XP",
      "Vous recevrez un code unique à présenter lors de votre visite",
    ],
  },
];

export default function ClientOnboarding() {
  return (
    <OnboardingTutorial
      storageKey="bookeasy-client-onboarding-seen"
      steps={clientSteps}
      welcomeTitle="Bienvenue sur BookEasy ! 🌴"
      welcomeSubtitle="Découvrez comment réserver facilement vos rendez-vous chez les meilleurs professionnels de Polynésie française."
    />
  );
}
