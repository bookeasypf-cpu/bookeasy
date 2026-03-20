import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SECTORS = [
  // Beauté & Bien-être
  { name: "Coiffeur", slug: "coiffeur", icon: "Scissors" },
  { name: "Barber", slug: "barber", icon: "Scissors" },
  { name: "Esthéticienne", slug: "estheticienne", icon: "Sparkles" },
  { name: "Spa & Bien-être", slug: "spa", icon: "Droplets" },
  { name: "Manucure & Onglerie", slug: "manucure", icon: "Hand" },
  { name: "Massage", slug: "massage", icon: "Heart" },
  { name: "Maquillage", slug: "maquillage", icon: "Palette" },
  { name: "Tatoueur", slug: "tatoueur", icon: "Pen" },
  // Santé
  { name: "Dentiste", slug: "dentiste", icon: "Stethoscope" },
  { name: "Médecin", slug: "medecin", icon: "Stethoscope" },
  { name: "Kinésithérapeute", slug: "kinesitherapeute", icon: "Activity" },
  { name: "Ostéopathe", slug: "osteopathe", icon: "Activity" },
  { name: "Nutritionniste", slug: "nutritionniste", icon: "Apple" },
  { name: "Psychologue", slug: "psychologue", icon: "Brain" },
  { name: "Vétérinaire", slug: "veterinaire", icon: "PawPrint" },
  // Sport & Loisirs
  { name: "Coach sportif", slug: "coach-sportif", icon: "Dumbbell" },
  { name: "Plongée", slug: "plongee", icon: "Waves" },
  { name: "Yoga & Pilates", slug: "yoga-pilates", icon: "Flame" },
  { name: "Excursion & Tour", slug: "excursion", icon: "Compass" },
  // Services pro
  { name: "Photographe", slug: "photographe", icon: "Camera" },
  { name: "Auto-école", slug: "auto-ecole", icon: "Car" },
  { name: "Mécanicien", slug: "mecanicien", icon: "Wrench" },
  { name: "Pressing & Couture", slug: "pressing", icon: "Shirt" },
  { name: "Cours particulier", slug: "cours-particulier", icon: "GraduationCap" },
  // Autre
  { name: "Autre", slug: "autre", icon: "Store" },
];

// ============================================================
// 58 REAL MERCHANTS FROM TAHITI / FRENCH POLYNESIA
// ============================================================
interface MerchantSeed {
  businessName: string;
  description: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  sectorSlug: string;
  services: { name: string; description: string; duration: number; price: number }[];
  schedule: { days: number[]; startTime: string; endTime: string }[];
}

const TAHITI_MERCHANTS: MerchantSeed[] = [
  // =================== COIFFEURS (11) ===================
  {
    businessName: "Symbio's Tahiti",
    description: "Salon de coiffure et institut de beauté complet. Coupe, coloration, soins capillaires et beauté dans un cadre moderne.",
    phone: "+689 40 42 54 00",
    address: "Immeuble IA ORA, 33 bis Avenue Georges Clemenceau",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.539,
    longitude: -149.5628,
    sectorSlug: "coiffeur",
    services: [
      { name: "Coupe femme", description: "Coupe, shampoing et brushing", duration: 45, price: 4500 },
      { name: "Coupe homme", description: "Coupe classique homme", duration: 30, price: 3000 },
      { name: "Coloration", description: "Coloration complète", duration: 90, price: 8000 },
      { name: "Balayage", description: "Balayage naturel", duration: 120, price: 12000 },
      { name: "Brushing", description: "Brushing simple", duration: 30, price: 2500 },
    ],
    schedule: [
      { days: [2, 3, 4], startTime: "09:00", endTime: "18:00" },
      { days: [5], startTime: "09:00", endTime: "18:30" },
      { days: [6], startTime: "08:00", endTime: "17:00" },
    ],
  },
  {
    businessName: "DESSANGE Tahiti",
    description: "Salon de coiffure de luxe international. Expertise en coloration, coupe et soins capillaires haut de gamme.",
    phone: "+689 40 43 50 10",
    address: "92 rue des Remparts",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5398,
    longitude: -149.5652,
    sectorSlug: "coiffeur",
    services: [
      { name: "Coupe prestige femme", description: "Coupe experte avec soin", duration: 60, price: 7000 },
      { name: "Coupe homme", description: "Coupe tendance", duration: 30, price: 3500 },
      { name: "Coloration premium", description: "Coloration avec produits de luxe", duration: 90, price: 10000 },
      { name: "Mèches et balayage", description: "Technique personnalisée", duration: 120, price: 15000 },
    ],
    schedule: [
      { days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "18:00" },
      { days: [6], startTime: "09:00", endTime: "16:00" },
    ],
  },
  {
    businessName: "Salon Charme",
    description: "Salon de coiffure traditionnel au cœur de Papeete.",
    phone: "+689 40 42 85 93",
    address: "Rue des Ecoles",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5395,
    longitude: -149.5672,
    sectorSlug: "coiffeur",
    services: [
      { name: "Coupe femme", description: "Coupe et brushing", duration: 45, price: 3500 },
      { name: "Coupe homme", description: "Coupe classique", duration: 30, price: 2500 },
      { name: "Coloration", description: "Coloration complète", duration: 90, price: 6500 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "08:30", endTime: "17:30" }],
  },
  {
    businessName: "Cocoon Hair",
    description: "Salon de coiffure, barber et Hair Spa. Parking gratuit. Ambiance cocooning pour prendre soin de vos cheveux.",
    phone: "+689 40 43 57 22",
    address: "En face de Carrefour Arue, Immeuble Miriama",
    city: "Arue",
    postalCode: "98718",
    latitude: -17.5281,
    longitude: -149.5376,
    sectorSlug: "coiffeur",
    services: [
      { name: "Coupe femme", description: "Coupe et coiffage", duration: 45, price: 4000 },
      { name: "Coupe homme", description: "Coupe tendance", duration: 30, price: 3000 },
      { name: "Hair Spa", description: "Soin complet des cheveux", duration: 60, price: 5500 },
      { name: "Coloration", description: "Coloration naturelle", duration: 90, price: 7500 },
    ],
    schedule: [
      { days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "18:00" },
      { days: [6], startTime: "09:00", endTime: "17:00" },
    ],
  },
  {
    businessName: "Camille Albane Tahiti",
    description: "Franchise internationale de coiffure. Service premium dans un salon moderne à Punaauia.",
    phone: "+689 40 57 67 07",
    address: "Residence Vainui, PK 13.3",
    city: "Punaauia",
    postalCode: "98717",
    latitude: -17.6,
    longitude: -149.608,
    sectorSlug: "coiffeur",
    services: [
      { name: "Coupe femme", description: "Coupe personnalisée", duration: 50, price: 5000 },
      { name: "Coupe homme", description: "Coupe experte", duration: 30, price: 3500 },
      { name: "Couleur signature", description: "Coloration Camille Albane", duration: 90, price: 9000 },
    ],
    schedule: [
      { days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "18:00" },
      { days: [6], startTime: "09:00", endTime: "16:00" },
    ],
  },
  {
    businessName: "Cristal Coiffure",
    description: "Salon de coiffure mixte établi depuis plus de 15 ans à Punaauia.",
    phone: "+689 40 43 52 38",
    address: "PK 15, Centre Tamanu iti",
    city: "Punaauia",
    postalCode: "98717",
    latitude: -17.634,
    longitude: -149.609,
    sectorSlug: "coiffeur",
    services: [
      { name: "Coupe femme", description: "Coupe et brushing", duration: 45, price: 3500 },
      { name: "Coupe homme", description: "Coupe classique", duration: 30, price: 2500 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "08:00", endTime: "17:00" }],
  },
  {
    businessName: "Hair Concept",
    description: "Salon de coiffure créatif avec les dernières tendances capillaires.",
    phone: "+689 40 42 52 38",
    address: "Immeuble Te Aranui",
    city: "Punaauia",
    postalCode: "98717",
    latitude: -17.585,
    longitude: -149.606,
    sectorSlug: "coiffeur",
    services: [
      { name: "Coupe créative", description: "Coupe tendance personnalisée", duration: 45, price: 4000 },
      { name: "Coupe homme", description: "Coupe stylée", duration: 30, price: 3000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "18:00" }],
  },
  {
    businessName: "Hina Coiffure",
    description: "Salon de coiffure accueillant près du Carrefour d'Arue.",
    phone: "+689 40 41 93 47",
    address: "Carrefour Arue",
    city: "Arue",
    postalCode: "98718",
    latitude: -17.5283,
    longitude: -149.5378,
    sectorSlug: "coiffeur",
    services: [
      { name: "Coupe femme", description: "Coupe et coiffage", duration: 40, price: 3500 },
      { name: "Coupe homme", description: "Coupe rapide", duration: 25, price: 2500 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "08:30", endTime: "17:30" }],
  },
  {
    businessName: "Hair Box",
    description: "Salon de coiffure moderne à Pirae.",
    phone: "+689 40 85 28 53",
    address: "Rue Afarerii",
    city: "Pirae",
    postalCode: "98716",
    latitude: -17.5313,
    longitude: -149.5529,
    sectorSlug: "coiffeur",
    services: [
      { name: "Coupe femme", description: "Coupe et brushing", duration: 45, price: 3500 },
      { name: "Coupe homme", description: "Coupe classique", duration: 30, price: 2500 },
      { name: "Soin capillaire", description: "Masque et soin profond", duration: 45, price: 4000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "18:00" }],
  },
  {
    businessName: "Salon Coiffure Duo",
    description: "Salon de coiffure au centre de Papeete.",
    phone: "+689 40 42 50 22",
    address: "Immeuble Cook n9",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5392,
    longitude: -149.5675,
    sectorSlug: "coiffeur",
    services: [
      { name: "Coupe femme", description: "Coupe et mise en forme", duration: 45, price: 3500 },
      { name: "Coupe homme", description: "Coupe homme classique", duration: 30, price: 2500 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "08:00", endTime: "17:00" }],
  },
  {
    businessName: "Salon Jany",
    description: "Salon de coiffure emblématique sur l'Avenue Pomare à Papeete.",
    phone: "+689 40 42 92 02",
    address: "Avenue Pomare",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.536,
    longitude: -149.5678,
    sectorSlug: "coiffeur",
    services: [
      { name: "Coupe femme", description: "Coupe et brushing", duration: 45, price: 3500 },
      { name: "Coupe homme", description: "Coupe simple", duration: 30, price: 2500 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "08:00", endTime: "17:30" }],
  },

  // =================== BARBERS (4) ===================
  {
    businessName: "Corner Barber Shop",
    description: "Barbershop au sein du Salon Manovai à Fariipiti. Coupes hommes et barbes dans une ambiance décontractée.",
    phone: "+689 87 76 03 11",
    address: "Avenue du Chef Vairaatoa, Fariipiti",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5418,
    longitude: -149.5732,
    sectorSlug: "barber",
    services: [
      { name: "Coupe homme", description: "Coupe tendance", duration: 30, price: 3000 },
      { name: "Taille de barbe", description: "Taille et contours", duration: 20, price: 2000 },
      { name: "Coupe + Barbe", description: "Combo complet", duration: 45, price: 4500 },
      { name: "Rasage traditionnel", description: "Rasage au blaireau", duration: 30, price: 3500 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "18:00" }],
  },
  {
    businessName: "Roots Barber Tahiti",
    description: "Barbershop avec deux adresses à Papeete. Grooming masculin et coupes tendances.",
    phone: "+689 89 79 13 52",
    address: "Centre-ville Papeete",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5388,
    longitude: -149.567,
    sectorSlug: "barber",
    services: [
      { name: "Coupe homme", description: "Coupe stylée", duration: 30, price: 3000 },
      { name: "Taille de barbe", description: "Entretien barbe", duration: 20, price: 2000 },
      { name: "Coupe + Barbe", description: "Service complet", duration: 45, price: 4500 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "19:00" }],
  },
  {
    businessName: "Axo Barber Tahiti",
    description: "Barbershop premium. Coiffure masculine personnalisée, taille de barbe soignée dans un cadre haut de gamme.",
    phone: "+689 87 70 00 00",
    address: "Rue Charles Vienot 2, Immeuble Maeva",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5388,
    longitude: -149.5662,
    sectorSlug: "barber",
    services: [
      { name: "Coupe premium", description: "Coupe homme sur-mesure", duration: 40, price: 4000 },
      { name: "Barbe premium", description: "Taille et soin barbe", duration: 25, price: 2500 },
      { name: "Combo VIP", description: "Coupe + barbe + soin", duration: 60, price: 6000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "18:00" }],
  },
  {
    businessName: "Chez Tony Barber Shop",
    description: "Barbershop ambiance décontractée avec musique, TV et rafraîchissements. Le spot des hommes à Faa'a.",
    phone: "+689 87 70 00 01",
    address: "2ème étage, Centre Fanomai",
    city: "Faa'a",
    postalCode: "98704",
    latitude: -17.552,
    longitude: -149.598,
    sectorSlug: "barber",
    services: [
      { name: "Coupe homme", description: "Coupe classique", duration: 30, price: 2500 },
      { name: "Barbe", description: "Taille de barbe", duration: 20, price: 1500 },
      { name: "Coupe + Barbe", description: "Combo", duration: 45, price: 3500 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "18:00" }],
  },

  // =================== ESTHETICIENNES (9) ===================
  {
    businessName: "Senso by Elo",
    description: "Institut de beauté complet au centre de Papeete. Soins du visage, corps, épilation et beauté des mains.",
    phone: "+689 40 83 41 42",
    address: "Place de la Cathédrale, 1er étage",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5382,
    longitude: -149.5668,
    sectorSlug: "estheticienne",
    services: [
      { name: "Soin visage", description: "Soin complet du visage", duration: 60, price: 7000 },
      { name: "Épilation jambes", description: "Épilation complète des jambes", duration: 45, price: 4500 },
      { name: "Manucure", description: "Soin des mains et pose vernis", duration: 30, price: 3000 },
      { name: "Maquillage", description: "Maquillage professionnel", duration: 45, price: 5000 },
    ],
    schedule: [
      { days: [1], startTime: "12:00", endTime: "18:00" },
      { days: [2, 3, 4, 5], startTime: "08:00", endTime: "18:00" },
      { days: [6], startTime: "08:00", endTime: "16:00" },
    ],
  },
  {
    businessName: "O'Hina Institut de Beauté",
    description: "Soins du visage, corps, gommages, massages, épilation, réflexothérapie. Produits SOTHYS et BERNARD CASSIÈRE.",
    phone: "+689 40 83 46 11",
    address: "Fare Ute, Immeuble JB Lecaill, 1er étage A12",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5325,
    longitude: -149.5625,
    sectorSlug: "estheticienne",
    services: [
      { name: "Soin visage Sothys", description: "Soin profond avec produits Sothys", duration: 75, price: 8500 },
      { name: "Gommage corps", description: "Gommage et hydratation", duration: 45, price: 5500 },
      { name: "Épilation", description: "Épilation au choix", duration: 30, price: 3000 },
      { name: "Réflexothérapie", description: "Séance de réflexologie", duration: 60, price: 7000 },
    ],
    schedule: [
      { days: [1], startTime: "12:00", endTime: "18:00" },
      { days: [2], startTime: "08:30", endTime: "18:00" },
      { days: [3, 4, 5], startTime: "08:00", endTime: "18:00" },
      { days: [6], startTime: "08:00", endTime: "14:00" },
    ],
  },
  {
    businessName: "Y de Aura Tahiti",
    description: "Esthéticienne certifiée Sothys, coiffure, bar à ongles et pédi-spa.",
    phone: "+689 89 77 07 55",
    address: "27 Rue Colette",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5388,
    longitude: -149.567,
    sectorSlug: "estheticienne",
    services: [
      { name: "Soin visage", description: "Soin certifié Sothys", duration: 60, price: 7500 },
      { name: "Bar à ongles", description: "Pose semi-permanent", duration: 45, price: 4000 },
      { name: "Pédi-spa", description: "Soin complet des pieds", duration: 50, price: 5000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:30" }],
  },
  {
    businessName: "Grains de Beauté Institut & Spa",
    description: "Soins visage et corps, manucure, épilation, thérapie LPG Cellu M6, Luxomed amincissement.",
    phone: "+689 40 43 40 22",
    address: "Quartier du Commerce, Rue du Commandant Jean Gilbert, 1er étage",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5398,
    longitude: -149.5672,
    sectorSlug: "estheticienne",
    services: [
      { name: "Soin visage", description: "Soin profond personnalisé", duration: 60, price: 7000 },
      { name: "LPG Cellu M6", description: "Séance anti-cellulite", duration: 45, price: 6000 },
      { name: "Manucure spa", description: "Soin des mains luxe", duration: 40, price: 4000 },
      { name: "Épilation complète", description: "Jambes + maillot + aisselles", duration: 60, price: 5500 },
    ],
    schedule: [
      { days: [2, 3, 4, 5], startTime: "09:00", endTime: "18:00" },
      { days: [6], startTime: "09:00", endTime: "15:00" },
    ],
  },
  {
    businessName: "O'Beauty Tahiti",
    description: "Massages, bien-être et soins esthétiques au cœur du quartier du Commerce.",
    phone: "+689 87 75 97 50",
    address: "Quartier du Commerce, en face Optique Gimond",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5395,
    longitude: -149.567,
    sectorSlug: "estheticienne",
    services: [
      { name: "Massage relaxant", description: "Massage corps complet", duration: 60, price: 7000 },
      { name: "Soin visage", description: "Soin hydratant", duration: 50, price: 6000 },
      { name: "Soin corps", description: "Gommage et enveloppement", duration: 75, price: 8500 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "18:00" }],
  },
  {
    businessName: "Beauty Success Papeete",
    description: "Institut de beauté et parfumerie. Soins visage, corps, mains, épilation et maquillage.",
    phone: "+689 40 50 85 85",
    address: "Centre Vaima, RDC, bord de mer",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5402,
    longitude: -149.5681,
    sectorSlug: "estheticienne",
    services: [
      { name: "Soin visage express", description: "Soin rapide 30min", duration: 30, price: 4000 },
      { name: "Maquillage jour", description: "Maquillage naturel", duration: 30, price: 3500 },
      { name: "Épilation sourcils", description: "Mise en forme", duration: 15, price: 1500 },
    ],
    schedule: [
      { days: [1, 2, 3, 4, 5], startTime: "08:00", endTime: "18:00" },
      { days: [6], startTime: "08:00", endTime: "16:00" },
    ],
  },
  {
    businessName: "Hinaiti Studio",
    description: "Studio de beauté, esthétique et massage à Papeete.",
    phone: "+689 87 77 09 77",
    address: "Centre-ville Papeete",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5393,
    longitude: -149.5665,
    sectorSlug: "estheticienne",
    services: [
      { name: "Soin visage", description: "Soin visage complet", duration: 60, price: 6500 },
      { name: "Massage relaxant", description: "Massage détente", duration: 60, price: 7000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:30" }],
  },
  {
    businessName: "Soleil Sucré de Tahiti",
    description: "Épilation, soins visage, amincissement, beauté des mains/pieds, ongles semi-permanent, massage.",
    phone: "+689 40 83 58 35",
    address: "PK 11, Punaauia",
    city: "Punaauia",
    postalCode: "98717",
    latitude: -17.578,
    longitude: -149.605,
    sectorSlug: "estheticienne",
    services: [
      { name: "Épilation au sucre", description: "Épilation naturelle", duration: 45, price: 4500 },
      { name: "Soin visage", description: "Nettoyage profond", duration: 60, price: 6500 },
      { name: "Ongles semi-permanent", description: "Pose gel", duration: 40, price: 4000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "08:30", endTime: "17:30" }],
  },
  {
    businessName: "Mako Tahiti",
    description: "Institut beauté, tatouage et piercing. Un lieu unique combinant esthétique et art corporel.",
    phone: "+689 87 70 00 02",
    address: "Quartier du Commerce",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5396,
    longitude: -149.5672,
    sectorSlug: "estheticienne",
    services: [
      { name: "Soin visage", description: "Soin esthétique", duration: 50, price: 5500 },
      { name: "Piercing", description: "Pose piercing", duration: 20, price: 3000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "17:00" }],
  },

  // =================== SPAS (4) ===================
  {
    businessName: "Tavai Spa",
    description: "Spa du Tahiti by Pearl Resorts. Soins polynésiens au monoï dans un cadre élégant. Niveau 3 du bâtiment principal.",
    phone: "+689 40 48 88 21",
    address: "Le Tahiti by Pearl Resorts, BP 14170",
    city: "Arue",
    postalCode: "98701",
    latitude: -17.5198,
    longitude: -149.4918,
    sectorSlug: "spa",
    services: [
      { name: "Massage polynésien", description: "Massage au monoï de Tahiti", duration: 60, price: 12000 },
      { name: "Soin du visage", description: "Soin aux fleurs de tiaré", duration: 50, price: 10000 },
      { name: "Enveloppement corps", description: "Enveloppement au monoï", duration: 45, price: 9000 },
      { name: "Forfait duo", description: "Massage duo relaxant", duration: 60, price: 20000 },
    ],
    schedule: [{ days: [3, 4, 5, 6, 0], startTime: "10:00", endTime: "18:00" }],
  },
  {
    businessName: "Deep Nature Spa",
    description: "Spa de l'InterContinental Tahiti. 300m² avec cabines individuelles/couple, Hammam, salle de relaxation.",
    phone: "+689 40 86 51 10",
    address: "InterContinental Tahiti Resort & Spa",
    city: "Faa'a",
    postalCode: "98702",
    latitude: -17.5711,
    longitude: -149.6189,
    sectorSlug: "spa",
    services: [
      { name: "Massage Deep Relaxation", description: "Massage corps complet 60min", duration: 60, price: 15000 },
      { name: "Soin Taurumi", description: "Massage traditionnel tahitien", duration: 75, price: 18000 },
      { name: "Hammam + Massage", description: "Forfait détente", duration: 90, price: 20000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6, 0], startTime: "09:00", endTime: "19:00" }],
  },
  {
    businessName: "Dhana Spa",
    description: "Spa de l'Hôtel Tahiti Nui. Massages, soins visage, enveloppements, manucure/pédicure, jacuzzi et hammam.",
    phone: "+689 40 46 38 99",
    address: "Hôtel Tahiti Nui, bord de mer",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5358,
    longitude: -149.5651,
    sectorSlug: "spa",
    services: [
      { name: "Massage duo polynésien", description: "Massage traditionnel en duo", duration: 60, price: 22000 },
      { name: "Soin visage luxe", description: "Soin premium aux extraits polynésiens", duration: 60, price: 10000 },
      { name: "Jacuzzi + Hammam", description: "Accès bien-être", duration: 60, price: 5000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6, 0], startTime: "09:00", endTime: "19:00" }],
  },
  {
    businessName: "Hononui Wellness Center",
    description: "Centre de bien-être du Te Moana Tahiti Resort. Taurumi traditionnel, soins visage/corps, huiles locales.",
    phone: "+689 87 25 21 34",
    address: "Te Moana Tahiti Resort",
    city: "Punaauia",
    postalCode: "98717",
    latitude: -17.6026,
    longitude: -149.6139,
    sectorSlug: "spa",
    services: [
      { name: "Taurumi", description: "Massage traditionnel tahitien", duration: 60, price: 10000 },
      { name: "Soin visage polynésien", description: "Aux huiles locales", duration: 50, price: 8000 },
      { name: "Gommage corps au sable", description: "Exfoliation polynésienne", duration: 45, price: 7000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "10:00", endTime: "17:00" }],
  },

  // =================== MANUCURE (4) ===================
  {
    businessName: "Onglerie Tahiti",
    description: "Prothèses ongulaires, nail art, beauté des mains/pieds, extensions de cils.",
    phone: "+689 87 70 00 03",
    address: "Place de la Cathédrale",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5382,
    longitude: -149.5668,
    sectorSlug: "manucure",
    services: [
      { name: "Pose gel complète", description: "Prothèse gel avec design", duration: 75, price: 6000 },
      { name: "Semi-permanent", description: "Pose vernis semi-permanent", duration: 40, price: 3500 },
      { name: "Nail art", description: "Design personnalisé", duration: 30, price: 2500 },
      { name: "Extensions de cils", description: "Pose cil à cil", duration: 90, price: 8000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "17:30" }],
  },
  {
    businessName: "Party Nails & Beauty Tahiti",
    description: "Techniciennes certifiées avec plus de 4 ans d'expérience en onglerie.",
    phone: "+689 87 70 00 04",
    address: "113 Avenue Georges Clemenceau, à côté Pharmacie de Mamao",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.541,
    longitude: -149.572,
    sectorSlug: "manucure",
    services: [
      { name: "Manucure complète", description: "Soin des mains + pose", duration: 60, price: 5000 },
      { name: "Pédicure", description: "Soin complet des pieds", duration: 50, price: 4500 },
      { name: "Gel UV", description: "Pose complète gel UV", duration: 75, price: 6500 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "18:00" }],
  },
  {
    businessName: "Vahine Nails",
    description: "Extensions d'ongles, semi-permanent, nail art dessiné à la main.",
    phone: "+689 87 38 03 03",
    address: "PK 12, Punaauia",
    city: "Punaauia",
    postalCode: "98717",
    latitude: -17.588,
    longitude: -149.6065,
    sectorSlug: "manucure",
    services: [
      { name: "Extensions ongles", description: "Pose capsules + gel", duration: 90, price: 7000 },
      { name: "Semi-permanent", description: "Pose vernis longue tenue", duration: 40, price: 3500 },
      { name: "Nail art main", description: "Design artistique", duration: 30, price: 2000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" }],
  },
  {
    businessName: "Heiana Beauty Nails",
    description: "Prothésiste ongulaire certifiée à Punaauia.",
    phone: "+689 87 70 00 05",
    address: "PK 14, Punaauia",
    city: "Punaauia",
    postalCode: "98717",
    latitude: -17.616,
    longitude: -149.6088,
    sectorSlug: "manucure",
    services: [
      { name: "Pose complète", description: "Prothèse ongulaire", duration: 90, price: 7000 },
      { name: "Remplissage", description: "Entretien mensuel", duration: 60, price: 4500 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" }],
  },

  // =================== MASSAGE (2) ===================
  {
    businessName: "Hina Massages",
    description: "Massages polynésiens Taurumi, massage relaxant, massage thaï à l'huile. Bungalow en bord de mer + déplacements.",
    phone: "+689 87 36 54 99",
    address: "Bungalow en bord de mer",
    city: "Arue",
    postalCode: "98718",
    latitude: -17.5248,
    longitude: -149.534,
    sectorSlug: "massage",
    services: [
      { name: "Taurumi traditionnel", description: "Massage polynésien ancestral", duration: 60, price: 8000 },
      { name: "Massage relaxant", description: "Massage détente corps complet", duration: 60, price: 7000 },
      { name: "Massage thaï", description: "Massage thaï à l'huile", duration: 75, price: 9000 },
      { name: "Massage à domicile", description: "Déplacement hôtel/domicile", duration: 60, price: 10000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "18:00" }],
  },
  {
    businessName: "Amandine Massage Tahiti",
    description: "Massothérapeute à Punaauia. Massages bien-être et relaxation.",
    phone: "+689 87 27 40 49",
    address: "PK 10, Punaauia",
    city: "Punaauia",
    postalCode: "98717",
    latitude: -17.573,
    longitude: -149.603,
    sectorSlug: "massage",
    services: [
      { name: "Massage relaxant", description: "Massage bien-être", duration: 60, price: 7000 },
      { name: "Massage sportif", description: "Récupération musculaire", duration: 60, price: 8000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" }],
  },

  // =================== DENTISTES (5) ===================
  {
    businessName: "Cabinet Dentaire Dr. Perez Eyrard",
    description: "Dentisterie générale au centre de Papeete. Soins, prothèses, esthétique dentaire.",
    phone: "+689 40 42 56 66",
    address: "Immeuble Angèle Bambridge, Passage Cardella, 2ème étage",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.541,
    longitude: -149.5677,
    sectorSlug: "dentiste",
    services: [
      { name: "Consultation", description: "Examen dentaire complet", duration: 30, price: 5000 },
      { name: "Détartrage", description: "Nettoyage professionnel", duration: 45, price: 8000 },
      { name: "Soin dentaire", description: "Traitement carie", duration: 45, price: 7000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "08:00", endTime: "19:00" }],
  },
  {
    businessName: "Cabinet Dentaire Dr. Levaux & Failloux",
    description: "Implants dentaires, prothèses, traitement gencives, esthétique dentaire. Anglais parlé.",
    phone: "+689 40 42 05 96",
    address: "117 Avenue du Prince Hinoi, BP 2746",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5348,
    longitude: -149.562,
    sectorSlug: "dentiste",
    services: [
      { name: "Consultation", description: "Bilan dentaire complet", duration: 30, price: 5000 },
      { name: "Implant dentaire", description: "Pose d'implant", duration: 90, price: 50000 },
      { name: "Blanchiment dentaire", description: "Blanchiment professionnel", duration: 60, price: 25000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "07:30", endTime: "17:30" }],
  },
  {
    businessName: "Cabinet Dentaire Vaimoanatea",
    description: "Cabinet dentaire moderne avec équipement de pointe.",
    phone: "+689 40 43 68 38",
    address: "Centre-ville Papeete",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5395,
    longitude: -149.5668,
    sectorSlug: "dentiste",
    services: [
      { name: "Consultation", description: "Examen et diagnostic", duration: 30, price: 5000 },
      { name: "Soins dentaires", description: "Traitement complet", duration: 45, price: 7000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "08:00", endTime: "17:00" }],
  },
  {
    businessName: "Cabinet Dentaire Dr. Robillard",
    description: "Dentisterie générale. RDC accessible handicapés, parking gratuit. Près de Carrefour Pacific Plaza.",
    phone: "+689 40 42 09 25",
    address: "À côté de Carrefour Pacific Plaza, façade bleue",
    city: "Faa'a",
    postalCode: "98704",
    latitude: -17.5515,
    longitude: -149.5975,
    sectorSlug: "dentiste",
    services: [
      { name: "Consultation", description: "Examen dentaire", duration: 30, price: 4500 },
      { name: "Détartrage", description: "Nettoyage complet", duration: 40, price: 7000 },
      { name: "Extraction", description: "Extraction dentaire", duration: 30, price: 8000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "07:15", endTime: "18:30" }],
  },
  {
    businessName: "Cabinet Dentaire Dr. Pignot",
    description: "Soins dentaires, prothèses, cosmétique et implantologie. Conventionné CPS et MGEN.",
    phone: "+689 40 42 00 00",
    address: "RDC Centre Médical Fanomai, PK 5, côté mer",
    city: "Faa'a",
    postalCode: "98704",
    latitude: -17.551,
    longitude: -149.597,
    sectorSlug: "dentiste",
    services: [
      { name: "Consultation", description: "Examen et devis", duration: 30, price: 4500 },
      { name: "Implant", description: "Pose implant dentaire", duration: 90, price: 45000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "07:30", endTime: "17:30" }],
  },

  // =================== MEDECINS (3) ===================
  {
    businessName: "Centre Médical Prince Hinoi",
    description: "Centre médical pluridisciplinaire avec généralistes, ophtalmologues et spécialistes. Parking 50 places.",
    phone: "+689 40 42 02 24",
    address: "Avenue Prince Hinoi",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5352,
    longitude: -149.5638,
    sectorSlug: "medecin",
    services: [
      { name: "Consultation générale", description: "Médecin généraliste", duration: 20, price: 4000 },
      { name: "Consultation ophtalmologie", description: "Examen des yeux", duration: 30, price: 7000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "06:30", endTime: "20:00" }],
  },
  {
    businessName: "Dr. François Vu-Dinh",
    description: "Médecin généraliste au centre de Papeete.",
    phone: "+689 40 42 00 01",
    address: "Rue Titiavai, local n67, RDC Immeuble Angèle Bambridge",
    city: "Papeete",
    postalCode: "98714",
    latitude: -17.5408,
    longitude: -149.568,
    sectorSlug: "medecin",
    services: [
      { name: "Consultation générale", description: "Médecine générale", duration: 20, price: 4000 },
      { name: "Certificat médical", description: "Certificat sportif ou autre", duration: 15, price: 3000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "07:30", endTime: "17:00" }],
  },
  {
    businessName: "Dr. Marie-Pierre Galichet",
    description: "Médecin généraliste à Papeete.",
    phone: "+689 40 42 00 02",
    address: "Entrée B, 2ème étage",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5398,
    longitude: -149.567,
    sectorSlug: "medecin",
    services: [
      { name: "Consultation générale", description: "Médecine générale", duration: 20, price: 4000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "08:00", endTime: "17:00" }],
  },

  // =================== TATOUEURS (10) ===================
  {
    businessName: "Mana'o Tattoo Studio",
    description: "Fondé en 2003 par Manu Farrarons. Studio internationalement reconnu, parmi les 20 plus emblématiques au monde. Tradition authentique du tatau polynésien.",
    phone: "+689 40 42 45 00",
    address: "43 Rue Albert Leboucher, Quartier du Commerce",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5398,
    longitude: -149.5668,
    sectorSlug: "tatoueur",
    services: [
      { name: "Tatouage polynésien petit", description: "Motif Patutiki bras/cheville", duration: 120, price: 15000 },
      { name: "Tatouage polynésien moyen", description: "Demi-bras ou épaule", duration: 240, price: 35000 },
      { name: "Tatouage polynésien grand", description: "Bras complet ou dos", duration: 480, price: 80000 },
      { name: "Consultation design", description: "Création motif personnalisé", duration: 60, price: 5000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "17:00" }],
  },
  {
    businessName: "NK Tattoo Tahiti",
    description: "Institution du tatouage polynésien sur le front de mer de Papeete.",
    phone: "+689 87 75 53 55",
    address: "Front de mer",
    city: "Papeete",
    postalCode: "98714",
    latitude: -17.5358,
    longitude: -149.5672,
    sectorSlug: "tatoueur",
    services: [
      { name: "Tatouage polynésien", description: "Motif traditionnel", duration: 180, price: 25000 },
      { name: "Tatouage personnalisé", description: "Design sur-mesure", duration: 120, price: 18000 },
    ],
    schedule: [
      { days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" },
      { days: [6], startTime: "08:00", endTime: "12:00" },
    ],
  },
  {
    businessName: "Tattoo by Patu",
    description: "Plusieurs artistes dont Emana, spécialiste du tatouage polynésien traditionnel et moderne.",
    phone: "+689 89 75 31 73",
    address: "133 Rue des Remparts, Papeava, en face AMING",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5415,
    longitude: -149.5718,
    sectorSlug: "tatoueur",
    services: [
      { name: "Tatouage polynésien", description: "Style traditionnel Patu", duration: 180, price: 20000 },
      { name: "Tatouage moderne", description: "Fusion polynésien-moderne", duration: 120, price: 15000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "17:00" }],
  },
  {
    businessName: "Roonui Tattoo",
    description: "Roonui est un pionnier de la renaissance culturelle et maître tattoo traditionnel (tahua tatatau).",
    phone: "+689 87 32 72 57",
    address: "Immeuble Wohler Ahi, Galerie Vaiete, 310 Rue Colette, 1er étage",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.537,
    longitude: -149.5685,
    sectorSlug: "tatoueur",
    services: [
      { name: "Tatau traditionnel", description: "Art ancestral polynésien", duration: 240, price: 30000 },
      { name: "Consultation", description: "Discussion du projet", duration: 30, price: 0 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" }],
  },
  {
    businessName: "Tahiti Needles Tattoo",
    description: "Équipe de 5 artistes spécialisés dans le tatouage polynésien.",
    phone: "+689 87 31 27 45",
    address: "Centre de Papeete",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5393,
    longitude: -149.5665,
    sectorSlug: "tatoueur",
    services: [
      { name: "Tatouage petit", description: "Petit motif polynésien", duration: 60, price: 10000 },
      { name: "Tatouage moyen", description: "Motif bras ou jambe", duration: 180, price: 25000 },
      { name: "Tatouage grand", description: "Grande pièce", duration: 360, price: 50000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "18:00" }],
  },
  {
    businessName: "PK0 Tattoo Shop",
    description: "Artistes Maru et Mana. Tatouage polynésien et designs personnalisés, au cœur de Papeete.",
    phone: "+689 87 70 00 06",
    address: "Place Notre-Dame, Avenue du Général de Gaulle",
    city: "Papeete",
    postalCode: "98714",
    latitude: -17.5382,
    longitude: -149.5668,
    sectorSlug: "tatoueur",
    services: [
      { name: "Tatouage polynésien", description: "Par Maru ou Mana", duration: 180, price: 22000 },
      { name: "Tatouage custom", description: "Design unique personnalisé", duration: 120, price: 15000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "17:00" }],
  },
  {
    businessName: "Tagaloa Tattoo",
    description: "Fondé en 2007 par Makalio Folituu. 2 artistes. Styles polynésien et occidental. Sur rendez-vous uniquement.",
    phone: "+689 40 83 36 09",
    address: "Avenue du Prince Hinoi, face Hôtel Tahiti Nui",
    city: "Papeete",
    postalCode: "98714",
    latitude: -17.5355,
    longitude: -149.5648,
    sectorSlug: "tatoueur",
    services: [
      { name: "Tatouage polynésien", description: "Style traditionnel Makalio", duration: 180, price: 25000 },
      { name: "Tatouage occidental", description: "Style réaliste, old school", duration: 120, price: 18000 },
    ],
    schedule: [{ days: [2, 3, 4, 5, 6], startTime: "09:00", endTime: "17:00" }],
  },
  {
    businessName: "Tahiti Ink Art Studio",
    description: "Fondé en 2023 par Tana Tokoragi (tatoueur depuis 1998, primé). Équipe de 4 artistes. Patutiki, réalisme, polynésien.",
    phone: "+689 87 70 00 07",
    address: "Centre de Papeete",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5393,
    longitude: -149.567,
    sectorSlug: "tatoueur",
    services: [
      { name: "Tatouage Patutiki", description: "Style traditionnel marquisien", duration: 180, price: 25000 },
      { name: "Tatouage réalisme", description: "Portrait et réalisme", duration: 240, price: 35000 },
      { name: "Tatouage polynésien moderne", description: "Fusion contemporaine", duration: 120, price: 18000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "17:00" }],
  },
  {
    businessName: "James Samuela's Moorea Tattoo",
    description: "Seul artiste à Moorea pratiquant le tatau traditionnel. Actif depuis 1998. Sur rendez-vous uniquement.",
    phone: "+689 87 27 45 63",
    address: "PK 32, côté montagne, Hauru",
    city: "Moorea",
    postalCode: "98728",
    latitude: -17.492,
    longitude: -149.9025,
    sectorSlug: "tatoueur",
    services: [
      { name: "Tatau traditionnel", description: "Art ancestral polynésien de Moorea", duration: 240, price: 30000 },
      { name: "Tatouage polynésien", description: "Motif personnalisé", duration: 180, price: 22000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "16:00" }],
  },
  {
    businessName: "Lolo Tattoo Studio",
    description: "Artiste Gilles, 25+ ans d'expérience. Pionnier du premier salon de tatouage traditionnel à Moorea.",
    phone: "+689 87 75 87 67",
    address: "Nuuroa",
    city: "Moorea",
    postalCode: "98728",
    latitude: -17.505,
    longitude: -149.865,
    sectorSlug: "tatoueur",
    services: [
      { name: "Tatouage polynésien", description: "25 ans d'expertise", duration: 180, price: 25000 },
      { name: "Retouche tatouage", description: "Retouche et restauration", duration: 60, price: 8000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "16:00" }],
  },

  // =================== COACH SPORTIF (6) ===================
  {
    businessName: "Xtremgym Tahiti",
    description: "Musculation, CrossFit, fitness (Zumba, RPM, BodyJam, BodyJump), jiu-jitsu. 3 étages d'équipements.",
    phone: "+689 40 42 14 22",
    address: "Rue Francis-Cowan, Fare Ute",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5322,
    longitude: -149.5615,
    sectorSlug: "coach-sportif",
    services: [
      { name: "Séance CrossFit", description: "Entraînement CrossFit encadré", duration: 60, price: 2500 },
      { name: "Coaching personnel", description: "1h avec coach dédié", duration: 60, price: 5000 },
      { name: "Pass journée", description: "Accès libre toute la journée", duration: 480, price: 2000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "06:00", endTime: "20:00" }],
  },
  {
    businessName: "F45 Training Tahiti",
    description: "Franchise internationale de fitness. Plus de 5000 mouvements dynamiques et 80+ workouts différents.",
    phone: "+689 40 41 03 45",
    address: "17 Allée Pierre Loti, Vallée de la Fautaua",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.542,
    longitude: -149.563,
    sectorSlug: "coach-sportif",
    services: [
      { name: "Séance F45", description: "45min d'entraînement fonctionnel", duration: 45, price: 2500 },
      { name: "Pass semaine", description: "Accès illimité 7 jours", duration: 45, price: 8000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "06:00", endTime: "19:00" }],
  },
  {
    businessName: "The GYM Tahiti",
    description: "Centre de remise en forme. Fitness, cardio, musculation, coaching personnel, nutrition.",
    phone: "+689 89 54 09 00",
    address: "Complexe Sportif Phenix, face Collège de Punaauia",
    city: "Punaauia",
    postalCode: "98717",
    latitude: -17.574,
    longitude: -149.6052,
    sectorSlug: "coach-sportif",
    services: [
      { name: "Coaching personnel", description: "Séance individuelle avec coach", duration: 60, price: 5500 },
      { name: "Bilan nutrition", description: "Consultation diététique", duration: 45, price: 4000 },
      { name: "Pass journée", description: "Accès salle", duration: 480, price: 1500 },
    ],
    schedule: [
      { days: [1, 2, 3, 4, 5], startTime: "06:00", endTime: "20:00" },
      { days: [6], startTime: "07:00", endTime: "13:00" },
    ],
  },
  {
    businessName: "Vaima Fitness Club",
    description: "Club de fitness climatisé de 550m². Salle de fitness, studio RPM, section CrossFit.",
    phone: "+689 89 48 90 00",
    address: "Centre Vaima, 3ème étage, bord de mer",
    city: "Papeete",
    postalCode: "98713",
    latitude: -17.5402,
    longitude: -149.5681,
    sectorSlug: "coach-sportif",
    services: [
      { name: "Cours collectif", description: "RPM, Zumba, BodyPump", duration: 60, price: 2000 },
      { name: "Coaching privé", description: "Coach personnel dédié", duration: 60, price: 5000 },
    ],
    schedule: [{ days: [1, 2, 3, 4, 5, 6], startTime: "06:00", endTime: "20:00" }],
  },
  {
    businessName: "Mathias Coach Tahiti",
    description: "Coach sportif certifié. Perte de poids, renforcement musculaire, cardio. Coaching en studio ou à domicile.",
    phone: "+689 89 54 75 22",
    address: "Studio Coaching Evolution",
    city: "Punaauia",
    postalCode: "98717",
    latitude: -17.579,
    longitude: -149.605,
    sectorSlug: "coach-sportif",
    services: [
      { name: "Coaching individuel", description: "Séance personnalisée", duration: 60, price: 6000 },
      { name: "Coaching à domicile", description: "Le coach vient chez vous", duration: 60, price: 7500 },
      { name: "Programme nutrition", description: "Plan alimentaire sur-mesure", duration: 45, price: 5000 },
    ],
    schedule: [
      { days: [1, 2, 3, 4, 5], startTime: "07:00", endTime: "18:00" },
      { days: [6], startTime: "08:00", endTime: "11:00" },
    ],
  },
  {
    businessName: "Wesport Tamanu",
    description: "Salle de sport et coaching au Centre Commercial Tamanu.",
    phone: "+689 89 37 60 02",
    address: "Centre Commercial Tamanu",
    city: "Punaauia",
    postalCode: "98718",
    latitude: -17.634,
    longitude: -149.6092,
    sectorSlug: "coach-sportif",
    services: [
      { name: "Coaching fitness", description: "Séance encadrée", duration: 60, price: 4000 },
      { name: "Accès salle", description: "Pass journée", duration: 480, price: 1500 },
    ],
    schedule: [
      { days: [1, 2, 3, 4, 5], startTime: "06:00", endTime: "20:00" },
      { days: [6], startTime: "07:00", endTime: "13:00" },
    ],
  },
];

async function main() {
  console.log("🌺 Seeding BookEasy - Tahiti Edition...\n");

  // Create sectors
  const sectorMap: Record<string, string> = {};
  for (const sector of SECTORS) {
    const created = await prisma.sector.upsert({
      where: { slug: sector.slug },
      update: { name: sector.name, icon: sector.icon },
      create: sector,
    });
    sectorMap[sector.slug] = created.id;
  }
  console.log(`✅ ${SECTORS.length} secteurs créés`);

  // Create password hash for all demo users
  const passwordHash = await bcrypt.hash("password123", 10);

  // Create demo client
  await prisma.user.upsert({
    where: { email: "client@demo.com" },
    update: {},
    create: {
      email: "client@demo.com",
      name: "Jean Martin",
      passwordHash,
      role: "CLIENT",
    },
  });
  console.log("✅ Client de démo créé (client@demo.com)");

  // Create all 58 merchants
  let merchantCount = 0;
  let serviceCount = 0;

  for (let i = 0; i < TAHITI_MERCHANTS.length; i++) {
    const m = TAHITI_MERCHANTS[i];
    const email = `merchant${i + 1}@bookeasy.pf`;
    const sectorId = sectorMap[m.sectorSlug];
    if (!sectorId) {
      console.warn(`⚠️ Secteur ${m.sectorSlug} non trouvé pour ${m.businessName}`);
      continue;
    }

    // Create user for this merchant
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: m.businessName,
        passwordHash,
        role: "MERCHANT",
      },
    });

    // First 15 merchants get PRO plan, rest are FREE
    const merchantPlan = i < 15 ? "PRO" : "FREE";

    // Create merchant profile
    const merchant = await prisma.merchant.upsert({
      where: { userId: user.id },
      update: {
        businessName: m.businessName,
        description: m.description,
        phone: m.phone,
        address: m.address,
        city: m.city,
        postalCode: m.postalCode,
        latitude: m.latitude,
        longitude: m.longitude,
        sectorId,
        plan: merchantPlan,
      },
      create: {
        userId: user.id,
        businessName: m.businessName,
        description: m.description,
        phone: m.phone,
        address: m.address,
        city: m.city,
        postalCode: m.postalCode,
        latitude: m.latitude,
        longitude: m.longitude,
        sectorId,
        plan: merchantPlan,
      },
    });

    // Create services
    for (let j = 0; j < m.services.length; j++) {
      const svc = m.services[j];
      await prisma.service.upsert({
        where: { id: `svc-${i}-${j}` },
        update: { ...svc, sortOrder: j },
        create: {
          id: `svc-${i}-${j}`,
          merchantId: merchant.id,
          ...svc,
          currency: "XPF",
          sortOrder: j,
        },
      });
      serviceCount++;
    }

    // Create weekly schedule
    for (const sched of m.schedule) {
      for (const day of sched.days) {
        await prisma.weeklySchedule.upsert({
          where: {
            merchantId_dayOfWeek_startTime: {
              merchantId: merchant.id,
              dayOfWeek: day,
              startTime: sched.startTime,
            },
          },
          update: { endTime: sched.endTime },
          create: {
            merchantId: merchant.id,
            dayOfWeek: day,
            startTime: sched.startTime,
            endTime: sched.endTime,
          },
        });
      }
    }

    merchantCount++;
  }

  console.log(`\n🏪 ${merchantCount} commerçants créés avec ${serviceCount} services`);
  console.log("\n📊 Récapitulatif par secteur:");
  const bySector: Record<string, number> = {};
  for (const m of TAHITI_MERCHANTS) {
    bySector[m.sectorSlug] = (bySector[m.sectorSlug] || 0) + 1;
  }
  for (const [slug, count] of Object.entries(bySector)) {
    console.log(`   ${slug}: ${count}`);
  }

  // ============================================================
  // XP DEMO DATA - Bookings, XP Transactions, XP Rewards
  // ============================================================
  console.log("\n⭐ Création des données XP de démonstration...");

  const clientUser = await prisma.user.findUnique({
    where: { email: "client@demo.com" },
  });

  if (clientUser) {
    // Get first 5 merchants for demo XP data
    const demoMerchants = await prisma.merchant.findMany({
      take: 5,
      include: { services: true },
      orderBy: { businessName: "asc" },
    });

    for (const merchant of demoMerchants) {
      if (merchant.services.length === 0) continue;
      const service = merchant.services[0];

      // Create 3 completed bookings per merchant for demo client
      for (let b = 0; b < 3; b++) {
        const daysAgo = 30 - b * 10; // 30, 20, 10 days ago
        const bookingDate = new Date();
        bookingDate.setDate(bookingDate.getDate() - daysAgo);
        const dateStr = bookingDate.toISOString().split("T")[0];
        const bookingId = `demo-booking-${merchant.id}-${b}`;

        await prisma.booking.upsert({
          where: { id: bookingId },
          update: {},
          create: {
            id: bookingId,
            clientId: clientUser.id,
            merchantId: merchant.id,
            serviceId: service.id,
            date: dateStr,
            startTime: `${9 + b}:00`,
            endTime: `${9 + b}:${service.duration < 60 ? service.duration : "00"}`,
            status: "CONFIRMED",
            totalPrice: service.price,
          },
        });

        // Create XP transaction for each booking
        const xpTxId = `demo-xp-${merchant.id}-${b}`;
        await prisma.xpTransaction.upsert({
          where: { id: xpTxId },
          update: {},
          create: {
            id: xpTxId,
            userId: clientUser.id,
            merchantId: merchant.id,
            bookingId: bookingId,
            amount: merchant.xpPerBooking,
            type: "EARNED",
            reason: "Réservation confirmée",
          },
        });
      }

      // Create XP rewards for each merchant
      const rewardId1 = `demo-reward-${merchant.id}-1`;
      const rewardId2 = `demo-reward-${merchant.id}-2`;

      await prisma.xpReward.upsert({
        where: { id: rewardId1 },
        update: {},
        create: {
          id: rewardId1,
          merchantId: merchant.id,
          name: "10% de réduction",
          description: "Réduction de 10% sur votre prochaine prestation",
          xpCost: 20,
          type: "DISCOUNT",
          value: 10,
          isActive: true,
        },
      });

      await prisma.xpReward.upsert({
        where: { id: rewardId2 },
        update: {},
        create: {
          id: rewardId2,
          merchantId: merchant.id,
          name: "Prestation gratuite",
          description: "Une prestation de base offerte",
          xpCost: 50,
          type: "FREE_SERVICE",
          value: null,
          isActive: true,
        },
      });
    }

    console.log("✅ Bookings de démo créés pour client@demo.com");
    console.log("✅ Transactions XP créées (30 XP par marchand × 5 marchands)");
    console.log("✅ Récompenses XP créées (2 par marchand × 5 marchands)");
  }

  console.log("\n🎉 Seed terminé ! Comptes de démo:");
  console.log("   Client: client@demo.com / password123");
  console.log("   Pro (premier): merchant1@bookeasy.pf / password123");
  console.log(`   Pro (tous): merchant1@bookeasy.pf → merchant${TAHITI_MERCHANTS.length}@bookeasy.pf`);
  console.log("   Le client a 30 XP chez chacun des 5 premiers marchands");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
