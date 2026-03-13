"use client";

import {
  UserCircle,
  Scissors,
  CalendarClock,
  Star,
  BarChart3,
  Gift,
} from "lucide-react";
import OnboardingTutorial from "./OnboardingTutorial";
import type { OnboardingStep } from "./OnboardingTutorial";

const merchantSteps: OnboardingStep[] = [
  {
    icon: <UserCircle className="h-7 w-7" />,
    title: "Créez votre profil",
    description:
      "Commencez par remplir les informations de votre établissement : nom, adresse, téléphone, secteur d'activité et description.",
    tips: [
      "Ajoutez une description complète pour attirer plus de clients",
      "Indiquez votre adresse exacte pour apparaître sur la carte",
      "Choisissez bien votre secteur d'activité (coiffure, spa, tatouage...)",
    ],
  },
  {
    icon: <Scissors className="h-7 w-7" />,
    title: "Ajoutez vos prestations",
    description:
      "Listez toutes les prestations que vous proposez avec leur prix, leur durée et le nombre de XP que le client gagnera.",
    tips: [
      "Définissez un prix et une durée précise pour chaque service",
      "Les XP sont personnalisables par prestation (plus c'est cher, plus de XP)",
      "Si vous ne mettez pas de XP, le défaut global s'appliquera",
    ],
  },
  {
    icon: <CalendarClock className="h-7 w-7" />,
    title: "Configurez vos disponibilités",
    description:
      "Définissez vos horaires d'ouverture jour par jour. Vos clients ne pourront réserver que sur les créneaux disponibles.",
    tips: [
      "Activez/désactivez chaque jour de la semaine",
      "Définissez des plages horaires précises (ex: 8h-12h, 13h-17h)",
      "Vos créneaux sont automatiquement découpés selon la durée de chaque prestation",
    ],
  },
  {
    icon: <Gift className="h-7 w-7" />,
    title: "Programme fidélité XP",
    description:
      "Créez des récompenses pour fidéliser vos clients. Ils accumulent des XP à chaque réservation et les échangent contre des avantages.",
    tips: [
      "Définissez le nombre d'XP gagnés par défaut (ex: 10 XP par réservation)",
      "Créez des récompenses : réductions, prestations gratuites, cadeaux...",
      "Quand un client échange ses XP, il reçoit un code à vous présenter",
    ],
  },
  {
    icon: <BarChart3 className="h-7 w-7" />,
    title: "Gérez vos réservations",
    description:
      "Suivez vos rendez-vous en temps réel depuis votre tableau de bord. Confirmez, gérez et analysez votre activité.",
    tips: [
      "Les nouveaux RDV arrivent en statut « En attente » → confirmez-les",
      "Consultez votre calendrier pour une vue d'ensemble",
      "L'onglet Analytiques vous montre vos revenus et services populaires",
    ],
  },
  {
    icon: <Star className="h-7 w-7" />,
    title: "Recevez des avis",
    description:
      "Après chaque prestation, vos clients peuvent laisser un avis et une note. De bons avis vous mettent en avant sur la plateforme !",
    tips: [
      "Répondez aux avis pour montrer votre professionnalisme",
      "Une bonne note moyenne vous fait apparaître dans les « Populaires »",
      "Les avis sont visibles par tous sur votre page publique",
    ],
  },
];

export default function MerchantOnboarding() {
  return (
    <OnboardingTutorial
      storageKey="bookeasy-merchant-onboarding-seen"
      steps={merchantSteps}
      welcomeTitle="Bienvenue sur BookEasy Pro ! 🎉"
      welcomeSubtitle="En quelques étapes, configurez votre espace professionnel et commencez à recevoir des réservations en ligne."
    />
  );
}
