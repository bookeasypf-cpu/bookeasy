# Plan de Refonte BookEasy - Tahiti Edition

## Vue d'ensemble
Refonte complète de l'app avec design premium inspiré de Fresha/Doctolib, carte interactive de Tahiti, animations professionnelles, et ajout de 58 vrais commerçants de Polynésie française.

---

## Phase 1 : Nouvelle identité visuelle + Animations

### Nouvelle palette de couleurs (inspirée Fresha/Doctolib)
- **Primary Deep** : `#0C1B2A` (dark navy - confiance/premium)
- **Primary Blue** : `#0066FF` (CTA principal - réservation)
- **Accent Teal** : `#00B4D8` (accents secondaires - Polynésie/océan)
- **Accent Coral** : `#FF6B6B` (badges, notifications, urgence)
- **Background** : `#F8FAFC` (gris très clair)
- **Cards** : `#FFFFFF` avec ombres douces
- **Success** : `#10B981`
- **Gradient Hero** : `#0066FF` → `#00B4D8` (bleu océan polynésien)

### Librairies à installer
- `framer-motion` — Animations fluides (page transitions, cards, modals)
- `react-leaflet` + `leaflet` — Carte interactive gratuite (OpenStreetMap)
- `@react-spring/web` — Animations de nombres/compteurs (optionnel)

### Animations à implémenter
1. **Page transitions** — Fade-in + slide-up au chargement des pages
2. **Cards marchands** — Hover lift (scale + shadow) + apparition progressive (stagger)
3. **Skeleton loading** — Shimmer effect pendant le chargement
4. **Boutons CTA** — Micro-animation au clic (scale bounce)
5. **Stepper réservation** — Transition fluide entre étapes
6. **Confirmation** — Checkmark animé + confetti léger
7. **Modal/Bottom sheet** — Slide-up smooth pour détails marchand sur la carte
8. **Compteurs dashboard** — Animation de comptage (0 → valeur)

### Refonte composants
- Header : glassmorphism (backdrop-blur), nouveau logo style
- Cards marchands : photo + dispo rapide + bouton "Réserver" sur la carte
- Secteur grid : icônes dans des cercles avec gradient doux
- Footer : plus riche avec liens utiles, réseaux sociaux

---

## Phase 2 : Carte interactive Tahiti / Polynésie française

### Technologie
- **Leaflet** + **react-leaflet** (gratuit, open-source, pas de clé API)
- Tuiles OpenStreetMap ou CartoDB (style épuré)
- Centrage initial : Papeete (-17.535, -149.570), zoom 12

### Fonctionnalités carte
1. **Vue carte plein écran** — Nouvelle page `/map` accessible depuis le header
2. **Pins personnalisés** — Couleurs par secteur (coiffeur=bleu, tatoueur=violet, dentiste=vert, etc.)
3. **Clustering** — Regroupement automatique des pins quand zoom est faible
4. **Popup au clic** — Mini-carte marchand : photo, nom, note, secteur, bouton "Voir" et "Réserver"
5. **Bottom sheet mobile** — Panel glissant depuis le bas avec détails complets du marchand
6. **Filtres par secteur** — Chips horizontaux au-dessus de la carte
7. **Géolocalisation** — Bouton "Me localiser" (GPS)
8. **Split view desktop** — Liste à gauche, carte à droite (style Airbnb/Doctolib)
9. **Recherche sur la carte** — Barre de recherche intégrée
10. **Détails + Réservation directe** — Clic sur un pin → voir tous les détails + réserver sans quitter la carte

### Intégration avec le booking
- Depuis la popup/bottom sheet de la carte, bouton "Réserver" qui ouvre le flow de réservation
- Ou modal de réservation rapide directement sur la carte

---

## Phase 3 : Refonte de toutes les pages

### Homepage
- Hero avec vidéo/image de Tahiti en arrière-plan + gradient overlay
- Barre de recherche premium (glassmorphism)
- Section "Explorer sur la carte" avec aperçu carte cliquable
- Catégories avec icônes animées
- Marchands populaires avec cards redesignées (next dispo visible)
- Témoignages / Social proof
- Stats animées (X commerçants, X réservations, etc.)

### Page Recherche
- Split view desktop (liste + carte)
- Filtres avancés (secteur, ville, note, disponibilité)
- Cards avec skeleton loading
- Vue carte toggle sur mobile

### Page Marchand
- Header parallax avec cover image
- Infos clés + badge secteur
- Onglets : Services, Avis, Infos
- Bouton réserver sticky en bas (mobile)
- Galerie photos

### Flow Réservation
- Steps animés avec transitions fluides
- Sélection date avec calendrier amélioré
- Confirmation avec animation checkmark

### Dashboard Pro
- Design modernisé avec la nouvelle palette
- Graphiques améliorés
- Animations compteurs

---

## Phase 4 : Base de données - 58 vrais commerçants de Tahiti

### Nouveaux secteurs à ajouter
- Mettre à jour les secteurs existants pour coller à Tahiti

### Commerçants à ajouter (58 total)
- 11 Coiffeurs (Symbio's, DESSANGE, Salon Charme, etc.)
- 4 Barbers (Corner Barber, Roots Barber, Axo Barber, Chez Tony)
- 9 Esthéticiennes (Senso by Elo, O'Hina, Y de Aura, etc.)
- 4 Spas (Tavai Spa, Deep Nature Spa, Dhana Spa, Hononui)
- 4 Nail salons (Onglerie Tahiti, Party Nails, Vahine Nails, Heiana)
- 2 Masseurs (Hina Massages, Amandine)
- 5 Dentistes (Dr. Perez, Dr. Levaux, Vaimoanatea, etc.)
- 3 Médecins (Centre Medical Prince Hinoi, Dr. Vu-Dinh, etc.)
- 10 Tatoueurs (Mana'o, NK Tattoo, Patu, Roonui, etc.)
- 6 Coach sportif (Xtremgym, F45, The GYM, etc.)

### Données pour chaque commerçant
- Nom, adresse, ville, téléphone, description
- Coordonnées GPS (latitude, longitude)
- Secteur
- Services types avec prix estimés
- Horaires d'ouverture

### Mise à jour du Prisma Schema
- Changer devise par défaut EUR → XPF (Franc Pacifique)
- S'assurer que latitude/longitude sont bien renseignés

---

## Ordre d'exécution

1. **Installer les dépendances** (framer-motion, leaflet, react-leaflet)
2. **Refonte globals.css** — Nouvelle palette, variables CSS, animations keyframes
3. **Refonte composants UI** — Button, Card, Badge, Input avec nouvelles couleurs + animations
4. **Refonte Header/Footer** — Glassmorphism, nouveau design
5. **Refonte Homepage** — Hero Tahiti, recherche premium, carte preview
6. **Créer la page Map** — Carte Leaflet avec pins, popups, filtres, bottom sheet
7. **Refonte Search** — Split view + filtres
8. **Refonte Merchant Detail** — Parallax, onglets, sticky CTA
9. **Refonte Booking Flow** — Animations transitions
10. **Refonte Dashboard** — Nouvelle palette + animations
11. **Seed 58 commerçants** — Nouveau fichier seed avec toutes les données Tahiti
12. **Tests et polish final**
