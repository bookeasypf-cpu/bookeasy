"use client";

import {
  UserCircle,
  Scissors,
  CalendarClock,
  Star,
  BarChart3,
  Gift,
  Stethoscope,
  ClipboardList,
  Users,
  Activity,
  Bell,
} from "lucide-react";
import OnboardingTutorial from "./OnboardingTutorial";
import type { OnboardingStep } from "./OnboardingTutorial";

// ─────────────────────────────────────────
// ONBOARDING STANDARD (commerce classique)
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
// ONBOARDING MÉDICAL (professionnels santé)
// ─────────────────────────────────────────
const medicalSteps: OnboardingStep[] = [
  {
    icon: <Stethoscope className="h-7 w-7" />,
    title: "Configurez votre cabinet",
    description:
      "Renseignez les informations de votre cabinet : nom, spécialité, adresse et coordonnées. Ces informations seront visibles par vos patients.",
    tips: [
      "Indiquez votre adresse exacte pour apparaître sur la carte",
      "Ajoutez une description de votre pratique et vos spécialités",
      "Votre numéro de téléphone sera visible pour les urgences",
    ],
  },
  {
    icon: <ClipboardList className="h-7 w-7" />,
    title: "Ajoutez vos consultations",
    description:
      "Listez les types de consultations que vous proposez avec leur tarif et durée. Vos patients pourront réserver directement en ligne.",
    tips: [
      "Consultation générale, suivi, certificat médical, bilan...",
      "Définissez une durée précise pour chaque type de consultation",
      "Les tarifs affichés aident les patients à se préparer",
    ],
  },
  {
    icon: <CalendarClock className="h-7 w-7" />,
    title: "Définissez vos horaires",
    description:
      "Configurez vos jours et heures de consultation. Les patients ne pourront réserver que sur les créneaux que vous avez ouverts.",
    tips: [
      "Définissez des plages matin/après-midi (ex: 8h-12h, 13h-17h)",
      "Bloquez des créneaux pour les urgences ou réunions",
      "Les créneaux sont découpés automatiquement selon la durée de consultation",
    ],
  },
  {
    icon: <Users className="h-7 w-7" />,
    title: "Suivi de vos patients",
    description:
      "Votre dashboard est adapté au secteur médical. Pas de système de réductions ou cartes cadeaux — à la place, vous avez un suivi patient complet.",
    tips: [
      "L'onglet « Patients » affiche l'historique de chaque patient",
      "Voyez les patients réguliers, les nouveaux et les annulations",
      "Le taux d'honoration vous aide à optimiser votre planning",
    ],
  },
  {
    icon: <Activity className="h-7 w-7" />,
    title: "Statistiques de votre cabinet",
    description:
      "Suivez l'activité de votre cabinet : nombre de consultations, nouveaux patients, taux d'honoration et évolution mensuelle.",
    tips: [
      "Consultez le nombre de patients par mois",
      "Identifiez vos consultations les plus fréquentes",
      "Le taux de fiabilité mesure les annulations de dernière minute",
    ],
  },
  {
    icon: <Bell className="h-7 w-7" />,
    title: "Rappels automatiques",
    description:
      "Vos patients reçoivent un email de rappel la veille de leur rendez-vous. Cela réduit les oublis et les rendez-vous non honorés.",
    tips: [
      "Les rappels sont envoyés automatiquement à 18h la veille",
      "Email de confirmation envoyé dès la réservation",
      "Les patients peuvent annuler depuis leur espace si besoin",
    ],
  },
];

interface MerchantOnboardingProps {
  isMedical?: boolean;
}

export default function MerchantOnboarding({ isMedical = false }: MerchantOnboardingProps) {
  return (
    <OnboardingTutorial
      storageKey={isMedical ? "bookeasy-medical-onboarding-seen" : "bookeasy-merchant-onboarding-seen"}
      steps={isMedical ? medicalSteps : merchantSteps}
      welcomeTitle={
        isMedical
          ? "Bienvenue sur BookEasy Santé ! 🏥"
          : "Bienvenue sur BookEasy Pro ! 🎉"
      }
      welcomeSubtitle={
        isMedical
          ? "Configurez votre cabinet en quelques étapes et permettez à vos patients de prendre rendez-vous en ligne, 24h/24."
          : "En quelques étapes, configurez votre espace professionnel et commencez à recevoir des réservations en ligne."
      }
      accentColor={isMedical ? "emerald" : "blue"}
    />
  );
}
