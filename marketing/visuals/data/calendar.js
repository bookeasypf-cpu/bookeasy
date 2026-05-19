/**
 * BookEasy — Calendrier éditorial 30 jours
 * Couvre Lun 04 mai → Mar 02 juin 2026
 * Rotation 13 secteurs · cadence ~1 post/jour
 *
 * Types de posts :
 *  - hero       : Template 1 (Magazine éditorial)
 *  - ui         : Template 2 (UI Showcase marchand)
 *  - testimonial: Template 3 (Témoignage client)
 *  - welcome    : Annonce inscription Free signup
 *  - upgrade    : Annonce upgrade Pro (post premium + boost)
 *  - educational: Carrousel éducatif
 *  - signature  : Pack Tech Néon (moments forts)
 */

export const CALENDAR = [
  // ═══════════════════════════ SEMAINE 1 (04-10 mai 2026) ═══════════════════════════
  {
    date: '2026-05-04', day: 'Lundi', week: 1,
    type: 'hero', sector: 'spa', template: 1,
    platforms: ['instagram', 'facebook'],
    time: '11:00',
    title: 'Lancement semaine · Hero Spa',
    caption: `🌺 Réserver un massage à Papeete n'a jamais été aussi simple.

BookEasy référence 47 spas et esthéticiennes à Tahiti, Moorea, Bora Bora — avis vérifiés, créneaux temps réel, paiement XPF.

👉 bookeasy.me`,
    hashtags: '#SpaTahiti #BienetrePolynesie #MassagePapeete #WellnessPF #BookEasy #PolynesieFrancaise',
    notes: 'Premier post de la semaine. Ton premium aspirationnel.',
  },
  {
    date: '2026-05-05', day: 'Mardi', week: 1,
    type: 'ui', sector: 'barber', template: 2,
    platforms: ['instagram'],
    time: '12:30',
    title: 'UI Showcase Barber',
    caption: `✂️ Fades & Co. · Papeete

Coupe + barbe : 4 500 XPF · 45 min
⭐ 4.8/5 (89 avis)

Réservation en 2 clics → bookeasy.me`,
    hashtags: '#BarberTahiti #FadePF #BarbierPapeete #BookEasy',
    notes: 'Mettre en avant un marchand partenaire concret.',
  },
  {
    date: '2026-05-06', day: 'Mercredi', week: 1,
    type: 'testimonial', sector: 'medecin', template: 3,
    platforms: ['instagram', 'facebook'],
    time: '19:00',
    title: 'Témoignage Médical',
    caption: `« Mon médecin répondait jamais. J'ai trouvé mieux en 2 min sur BookEasy, RDV pris pour le lendemain. » — Moana R., Papeete

89 médecins disponibles en Polynésie. Confirmation immédiate, rappel SMS.

👉 bookeasy.me`,
    hashtags: '#MedecinPapeete #SantePolynesie #RDVMedicalTahiti #BookEasy',
    notes: 'Soir = peak engagement Polynésie.',
  },
  {
    date: '2026-05-07', day: 'Jeudi', week: 1,
    type: 'welcome', sector: 'institut',
    platforms: ['instagram-story', 'facebook'],
    time: '10:00',
    title: 'Welcome · Nouveau marchand Free',
    caption: `🌺 Bienvenue à @[NomMarchand] sur BookEasy !

📍 [Ville] · Institut de beauté
✨ Soin visage · Épilation · Massage

👉 Découvre sur bookeasy.me`,
    hashtags: '#NouveauSurBookEasy #InstitutBeautePF',
    notes: 'Format léger story. Tag le marchand pour qu\'il repartage.',
  },
  {
    date: '2026-05-08', day: 'Vendredi', week: 1,
    type: 'hero', sector: 'medecin', template: 1,
    platforms: ['instagram', 'facebook', 'tiktok'],
    time: '17:00',
    title: 'Hero Médical · Week-end',
    caption: `🩺 Ta santé, sans la salle d'attente.

89 professionnels de santé en Polynésie disponibles via BookEasy. Médecins, dentistes, kinés, ostéopathes — confirmation instantanée.

👉 bookeasy.me`,
    hashtags: '#SantePolynesie #MedecinPapeete #DentisteTahiti #KineMoorea #BookEasy',
    notes: 'Vendredi soir = pic réservations week-end. Booster si possible.',
  },
  {
    date: '2026-05-09', day: 'Samedi', week: 1,
    type: 'ui', sector: 'spa', template: 2,
    platforms: ['instagram', 'instagram-story'],
    time: '10:30',
    title: 'UI Showcase Spa week-end',
    caption: `🌺 Manea Spa · Moorea

Massage polynésien · 60 min · 8 500 XPF
⭐ 4.9/5 (127 avis)

Week-end détente ? Réserve maintenant.
👉 bookeasy.me`,
    hashtags: '#SpaMoorea #WeekendDetente #MasagePolynesie #BookEasy',
    notes: 'Samedi matin = idéal pour planifier le week-end.',
  },
  {
    date: '2026-05-10', day: 'Dimanche', week: 1,
    type: 'testimonial', sector: 'barber', template: 3,
    platforms: ['instagram-story'],
    time: '11:00',
    title: 'Témoignage Barber · Story',
    caption: `« Plus jamais à attendre 30 min au téléphone. Je réserve mon barbier le matin, j'y vais à 18h. » — Teiki M., Punaauia

👉 bookeasy.me`,
    hashtags: '#BookEasy',
    notes: 'Dimanche = repos. Format story low-effort suffisant.',
  },

  // ═══════════════════════════ SEMAINE 2 (11-17 mai 2026) ═══════════════════════════
  {
    date: '2026-05-11', day: 'Lundi', week: 2,
    type: 'hero', sector: 'coiffeur', template: 1,
    platforms: ['instagram', 'facebook'],
    time: '11:00',
    title: 'Hero Coiffeur',
    caption: `💇 Ta coiffure, sans attendre.

62 salons de coiffure en Polynésie sur BookEasy. Coupe, coloration, brushing, balayage — créneaux temps réel, prix transparents en XPF.

👉 bookeasy.me`,
    hashtags: '#CoiffeurTahiti #SalonPF #ColorationPapeete #BookEasy',
    notes: 'Cible large : femmes 25-55 ans.',
  },
  {
    date: '2026-05-12', day: 'Mardi', week: 2,
    type: 'ui', sector: 'coach', template: 2,
    platforms: ['instagram', 'tiktok'],
    time: '06:30',
    title: 'UI Coach Sportif · Matin',
    caption: `💪 Mana Fit Coach · Papeete

Séance personnelle · 60 min · 6 500 XPF
⭐ 4.9/5 (76 avis)

Commence la journée fort 💥
👉 bookeasy.me`,
    hashtags: '#CoachSportifPF #FitnessTahiti #PersonalTrainerPapeete #BookEasy',
    notes: 'Heure matinale ciblée. TikTok = audience plus jeune sportive.',
  },
  {
    date: '2026-05-13', day: 'Mercredi', week: 2,
    type: 'educational', sector: null,
    platforms: ['instagram'],
    time: '19:00',
    title: 'Carrousel · Comment ça marche',
    caption: `📚 Comment réserver en 30 secondes sur BookEasy ?

Swipe pour voir les 4 étapes 👉

1️⃣ Choisis ton secteur
2️⃣ Sélectionne ton créneau
3️⃣ Confirme avec un clic
4️⃣ Reçois ton rappel SMS

Plus jamais besoin d'appeler 📞❌

👉 bookeasy.me`,
    hashtags: '#BookEasy #TutorielPF #Polynesie #Reservation #SansAppeler',
    notes: 'Carrousel pédagogique = boost rétention. Format 1080x1080 × 4 slides.',
  },
  {
    date: '2026-05-14', day: 'Jeudi', week: 2,
    type: 'welcome', sector: 'manucure',
    platforms: ['instagram-story', 'facebook'],
    time: '10:00',
    title: 'Welcome · Onglerie',
    caption: `💅 Bienvenue à @[NomOnglerie] sur BookEasy !

📍 [Ville] · Manucure & Onglerie
✨ Pose gel · Nail art · Vernis

👉 bookeasy.me`,
    hashtags: '#NouveauSurBookEasy #ManucureTahiti',
    notes: 'Story format. Tag le marchand.',
  },
  {
    date: '2026-05-15', day: 'Vendredi', week: 2,
    type: 'upgrade', sector: 'spa',
    platforms: ['instagram', 'facebook', 'tiktok'],
    time: '17:00',
    title: '🚀 UPGRADE PRO · Boost recommandé',
    caption: `🚀 [Manea Spa] passe en PRO sur BookEasy !

✓ Visible dans la recherche Google
✓ Cité par ChatGPT et Perplexity
✓ Page dédiée optimisée SEO/GEO
✓ Réservations 24/7

Découvre Manea Spa en exclusivité :
👉 bookeasy.me/manea-spa`,
    hashtags: '#BookEasyPro #SpaTahiti #ManeaSpaPro #BookEasy',
    notes: 'POST CLÉ DU MOIS. Format carrousel premium + boost payé 5000-10000 XPF.',
  },
  {
    date: '2026-05-16', day: 'Samedi', week: 2,
    type: 'hero', sector: 'institut', template: 1,
    platforms: ['instagram', 'facebook'],
    time: '10:30',
    title: 'Hero Institut Beauté',
    caption: `✨ Ta beauté, sublimée.

38 instituts de beauté à Tahiti et Moorea sur BookEasy. Soin visage, épilation, esthétique — réservation directe en XPF.

👉 bookeasy.me`,
    hashtags: '#InstitutBeautePF #SoinVisageTahiti #EsthetiquePolynesie #BookEasy',
    notes: 'Samedi = pic recherches beauté.',
  },
  {
    date: '2026-05-17', day: 'Dimanche', week: 2,
    type: 'testimonial', sector: 'spa', template: 3,
    platforms: ['instagram-story'],
    time: '11:00',
    title: 'Témoignage Spa · Story',
    caption: `« J'ai réservé mon massage en 30 secondes depuis le canapé. Une heure plus tard j'étais sur la table. Magique. » — Hina T., Papeete

👉 bookeasy.me`,
    hashtags: '#BookEasy',
    notes: 'Story dimanche = inspiration douce.',
  },

  // ═══════════════════════════ SEMAINE 3 (18-24 mai 2026) ═══════════════════════════
  {
    date: '2026-05-18', day: 'Lundi', week: 3,
    type: 'hero', sector: 'manucure', template: 1,
    platforms: ['instagram', 'facebook'],
    time: '11:00',
    title: 'Hero Onglerie',
    caption: `💅 Tes mains, ton style.

41 onglistes en Polynésie sur BookEasy. Manucure, pose gel, nail art — créneaux temps réel, prix en clair.

👉 bookeasy.me`,
    hashtags: '#ManucureTahiti #NailArtPF #OnglerieMoorea #BookEasy',
    notes: 'Cible 18-35 ans féminine.',
  },
  {
    date: '2026-05-19', day: 'Mardi', week: 3,
    type: 'ui', sector: 'dentiste', template: 2,
    platforms: ['instagram', 'facebook'],
    time: '12:30',
    title: 'UI Dentiste',
    caption: `🦷 Dr Pia Tehei · Papeete

Détartrage + contrôle · 30 min · 6 800 XPF
⭐ 4.9/5 (156 avis)

RDV dentiste en 1 clic.
👉 bookeasy.me`,
    hashtags: '#DentistePapeete #SoinsDentairesTahiti #BookEasy',
    notes: 'Secteur sensible = ton rassurant pas humoristique.',
  },
  {
    date: '2026-05-20', day: 'Mercredi', week: 3,
    type: 'testimonial', sector: 'coach', template: 3,
    platforms: ['instagram'],
    time: '19:00',
    title: 'Témoignage Coach',
    caption: `« Mon coach m'attend, mes objectifs s'alignent. Réserver mes séances en 1 clic = motivation x2. » — Heimana V., -8 kg en 3 mois

28 coachs sportifs disponibles.
👉 bookeasy.me`,
    hashtags: '#CoachSportifPF #FitnessTahiti #BookEasy',
    notes: 'Témoignage avec résultat chiffré = très engageant.',
  },
  {
    date: '2026-05-21', day: 'Jeudi', week: 3,
    type: 'educational', sector: null,
    platforms: ['instagram'],
    time: '19:00',
    title: 'Carrousel · Top 5 spas Papeete',
    caption: `🏆 TOP 5 spas à Papeete · selon les avis BookEasy

Swipe pour découvrir 👉

5️⃣ ...
4️⃣ ...
3️⃣ ...
2️⃣ ...
1️⃣ ...

Tag tes amies qui ont besoin d'une pause détente ✨

👉 bookeasy.me`,
    hashtags: '#TopSpaPapeete #BienetreTahiti #BookEasy',
    notes: 'Listicle = super viral. Inviter au tag = portée.',
  },
  {
    date: '2026-05-22', day: 'Vendredi', week: 3,
    type: 'hero', sector: 'barber', template: 1,
    platforms: ['instagram', 'facebook', 'tiktok'],
    time: '17:00',
    title: 'Hero Barber · Week-end',
    caption: `✂️ Le rituel masculin, sans appel.

34 barbiers en Polynésie sur BookEasy. Coupe, barbe, dégradé — prix transparents, créneaux temps réel.

👉 bookeasy.me`,
    hashtags: '#BarberTahiti #FadePF #BarbierPapeete #BookEasy',
    notes: 'Vendredi soir = pic réservations barber.',
  },
  {
    date: '2026-05-23', day: 'Samedi', week: 3,
    type: 'ui', sector: 'coiffeur', template: 2,
    platforms: ['instagram'],
    time: '10:30',
    title: 'UI Coiffeur',
    caption: `💇 Salon Vahine · Punaauia

Coupe + brushing · 60 min · 5 500 XPF
⭐ 4.7/5 (142 avis)

👉 bookeasy.me`,
    hashtags: '#CoiffeurTahiti #SalonPF #BookEasy',
    notes: 'Samedi matin = créneau réservation week-end.',
  },
  {
    date: '2026-05-24', day: 'Dimanche', week: 3,
    type: 'welcome', sector: 'tatoueur',
    platforms: ['instagram-story'],
    time: '11:00',
    title: 'Welcome · Tatoueur',
    caption: `🎨 Bienvenue à @[NomTatoueur] sur BookEasy !

📍 [Ville] · Tatouage polynésien
👉 bookeasy.me`,
    hashtags: '#NouveauSurBookEasy #TattooPF',
    notes: 'Story format léger.',
  },

  // ═══════════════════════════ SEMAINE 4 (25-31 mai 2026) ═══════════════════════════
  {
    date: '2026-05-25', day: 'Lundi', week: 4,
    type: 'hero', sector: 'maquillage', template: 1,
    platforms: ['instagram', 'facebook'],
    time: '11:00',
    title: 'Hero Maquilleuse',
    caption: `💄 Ton jour J, sublimé.

24 maquilleuses pro en Polynésie sur BookEasy. Mariage, événement, shooting — portfolio, tarifs, avis en clair.

👉 bookeasy.me`,
    hashtags: '#MaquilleuseTahiti #MariagePolynesie #MakeupPF #BookEasy',
    notes: 'Cible mariées + événementiel.',
  },
  {
    date: '2026-05-26', day: 'Mardi', week: 4,
    type: 'ui', sector: 'tatoueur', template: 2,
    platforms: ['instagram', 'tiktok'],
    time: '18:00',
    title: 'UI Tatoueur',
    caption: `🎨 Mana Tattoo · Papeete

Tatouage polynésien · Session 3h · 45 000 XPF
⭐ 4.9/5 (87 avis)

L'art ancré dans la tradition.
👉 bookeasy.me`,
    hashtags: '#TatouageTahiti #PolynesianTattoo #BookEasy',
    notes: 'Soir = audience tatouage plus active.',
  },
  {
    date: '2026-05-27', day: 'Mercredi', week: 4,
    type: 'testimonial', sector: 'medecin', template: 3,
    platforms: ['instagram', 'facebook'],
    time: '19:00',
    title: 'Témoignage Médical',
    caption: `« Mon médecin répondait jamais. J'ai trouvé mieux en 2 min sur BookEasy. » — Moana R., Papeete

89 médecins disponibles en PF. RDV en 30 secondes.
👉 bookeasy.me`,
    hashtags: '#MedecinPapeete #SantePolynesie #BookEasy',
    notes: 'Repost différent angle.',
  },
  {
    date: '2026-05-28', day: 'Jeudi', week: 4,
    type: 'educational', sector: null,
    platforms: ['instagram'],
    time: '19:00',
    title: 'Carrousel · Avant/Après BookEasy',
    caption: `📊 Comment BookEasy change ta vie en Polynésie

❌ AVANT
📞 Appeler 5 fois · Attendre · "C'est complet"

✅ MAINTENANT
⚡ 2 clics · Créneau garanti · Rappel SMS

Tag quelqu'un qui galère encore au téléphone 👉

👉 bookeasy.me`,
    hashtags: '#BookEasy #PolynesieDigitale #Reservation',
    notes: 'Format comparatif = très partagé.',
  },
  {
    date: '2026-05-29', day: 'Vendredi', week: 4,
    type: 'upgrade', sector: 'barber',
    platforms: ['instagram', 'facebook', 'tiktok'],
    time: '17:00',
    title: '🚀 UPGRADE PRO · Boost recommandé',
    caption: `🚀 [Fades & Co.] passe en PRO sur BookEasy !

✓ Visible sur Google et ChatGPT
✓ Page boutique optimisée
✓ Réservations 24/7

Le barber préféré de Papeete, accessible à tous.
👉 bookeasy.me/fades-co`,
    hashtags: '#BookEasyPro #BarberTahiti #FadesAndCoPro',
    notes: 'POST CLÉ DU MOIS #2. Boost payé 5000-10000 XPF.',
  },
  {
    date: '2026-05-30', day: 'Samedi', week: 4,
    type: 'hero', sector: 'dentiste', template: 1,
    platforms: ['instagram', 'facebook'],
    time: '10:30',
    title: 'Hero Dentiste',
    caption: `🦷 Ton sourire, soigné.

42 dentistes en Polynésie sur BookEasy. Détartrage, urgence, soins, orthodontie — réservation en clair.

👉 bookeasy.me`,
    hashtags: '#DentistePapeete #SoinsDentairesTahiti #BookEasy',
    notes: 'Ton rassurant secteur sensible.',
  },
  {
    date: '2026-05-31', day: 'Dimanche', week: 4,
    type: 'ui', sector: 'massage', template: 2,
    platforms: ['instagram-story'],
    time: '11:00',
    title: 'UI Massage · Story',
    caption: `💆 Tane Massage · Moorea

Taurumi traditionnel · 90 min · 12 000 XPF
⭐ 4.9/5 (156 avis)

👉 bookeasy.me`,
    hashtags: '#TaurumiPF #BookEasy',
    notes: 'Story = inspiration dimanche.',
  },

  // ═══════════════════════════ SEMAINE 5 partielle (01-02 juin 2026) ═══════════════════════════
  {
    date: '2026-06-01', day: 'Lundi', week: 5,
    type: 'hero', sector: 'kine', template: 1,
    platforms: ['instagram', 'facebook'],
    time: '11:00',
    title: 'Hero Kiné',
    caption: `🦵 Rééduquer, retrouver, repartir.

31 kinésithérapeutes en Polynésie sur BookEasy. Rééducation, suivi sportif, post-op — premiers créneaux affichés.

👉 bookeasy.me`,
    hashtags: '#KinePapeete #KineTahiti #BookEasy',
    notes: 'Début juin = saison reprise sport après vacances.',
  },
  {
    date: '2026-06-02', day: 'Mardi', week: 5,
    type: 'testimonial', sector: 'osteopathe', template: 3,
    platforms: ['instagram'],
    time: '12:30',
    title: 'Témoignage Ostéo',
    caption: `« Mon dos me faisait souffrir depuis 6 mois. Une séance, RDV pris sur BookEasy en 30 secondes. Soulagé. » — Heitamatoa V., Papeete

23 ostéopathes en PF disponibles.
👉 bookeasy.me`,
    hashtags: '#OsteoTahiti #MalDeDosPF #BookEasy',
    notes: 'Témoignage avec problème commun = identifiable.',
  },
];

export const PLATFORM_INFO = {
  instagram: { label: 'Instagram', icon: '📷', color: '#E1306C' },
  facebook: { label: 'Facebook', icon: '👍', color: '#1877F2' },
  tiktok: { label: 'TikTok', icon: '🎵', color: '#000000' },
  'instagram-story': { label: 'IG Story', icon: '⚡', color: '#FF6B35' },
};

export const TYPE_INFO = {
  hero: { label: 'Hero Magazine', color: '#0EA5A0', icon: '🎨' },
  ui: { label: 'UI Showcase', color: '#A855F7', icon: '📱' },
  testimonial: { label: 'Témoignage', color: '#F59E0B', icon: '💬' },
  welcome: { label: 'Welcome Free', color: '#10B981', icon: '👋' },
  upgrade: { label: 'Upgrade Pro 🚀', color: '#EC4899', icon: '🚀' },
  educational: { label: 'Éducatif', color: '#3B82F6', icon: '📚' },
  signature: { label: 'Tech Néon', color: '#00F0D4', icon: '⚡' },
};
