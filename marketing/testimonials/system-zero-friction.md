# 🎯 Système de témoignages Zero-Friction — BookEasy

> **Date** : 2026-06-10
> **Philosophie** : Le Pro répond **juste "OK"** — Maravai et l'automation gèrent le reste
> **Objectif** : Collecter 10 témoignages PF authentiques en 60 jours pour ouvrir les portes des gros poissons (Faverjon, ELITE, Nehenehe, AXO)

---

## 🎯 Principe fondateur

**Chaque ms de friction = un témoignage perdu.**

Le Pro ne doit JAMAIS :
- Remplir un formulaire
- Trouver les chiffres lui-même
- Rédiger un copy
- Trouver une photo
- Réfléchir à où publier

Le Pro doit SEULEMENT :
- Lire un WhatsApp
- Répondre **"OK"** (ou "OK avec une modif")
- Profiter de la visibilité gratuite que ça lui apporte

---

## ⏱️ Process automatisé — 3 phases

### Phase 1 — J0 Onboarding "État des lieux"

Quand le Pro signe en Pro (ou Free → Pro), Maravai pose **3 questions** en 60 secondes max **pendant la visio de setup** :

```
Avant de te lancer sur BookEasy, juste 3 chiffres pour qu'on mesure ton ROI :

1. En moyenne, tu fais combien de RDV par mois actuellement ?
   → [Pro répond verbalement]

2. Sur ces RDV, combien de no-shows tu as par semaine ?
   → [Pro répond verbalement]

3. Ton ticket moyen, c'est quoi à peu près ?
   → [Pro répond verbalement]

Top, je note. On mesurera les progrès dans 30 jours.
```

→ Maravai entre ces 3 chiffres dans le dashboard Pro lui-même via une simple page admin `/dashboard/baseline` (à créer — voir TODO).

### Phase 2 — J30 Extraction automatique des chiffres

Maravai lance :
```bash
npx tsx scripts/generate-testimonial.ts --merchant=[ID]
```

Le script :
1. Se connecte à Prisma
2. Extrait les chiffres clés des 30 derniers jours :
   - Nombre de RDV créés en ligne
   - Cartes cadeaux émises + montant total XPF
   - Points XP distribués + redemptions
   - Acomptes PayZen perçus + montant
   - Taux de no-show (calculé)
   - Top 3 services par revenus
3. Compare à la baseline J0
4. Génère un fichier `marketing/testimonials/[merchant-slug]-J30.md` contenant :
   - Le rapport chiffres
   - Le message Pro pré-rempli (prêt à copier dans WhatsApp)
   - Le copy testimonial proposé
   - La checklist publication

### Phase 3 — J30+1 Envoi au Pro via WhatsApp

Maravai envoie le message généré **tel quel** via WhatsApp. Format :

```
Salut [Prénom] 👋

30 jours sur BookEasy, premier point ROI 📊

Tes chiffres :
✨ RDV pris en ligne : [X] (vs [Y] avant)
🎁 Cartes cadeaux émises : [Z] ([W] XPF)
⭐ Programme XP : [N] clientes inscrites
💳 Acomptes PayZen perçus : [M] XPF
📉 No-shows réduits de [P]%

Pour célébrer + aider d'autres pros PF, je te propose ce témoignage à publier sur ta page Insta/FB + sur la mienne (je mentionne ta marque, ça te ramène des followers).

Le visuel et le copy sont prêts. Tu n'as qu'à valider 👇

---

🌺 [Nom Pro] · [Métier] · [Ville]
"En 30 jours avec BookEasy, j'ai [chiffre marquant]. L'outil tahitien que je recommande aux pros du fenua."

[VISUEL ATTACHÉ]
---

3 réponses possibles :

✅ "OK" → je publie vendredi sur Insta @bookeasy_pf + ton compte + GMB
🔧 "OK avec modif X" → tu me dis, je corrige, je publie
❌ "Pas maintenant" → no problem, je te repropose dans 30j

Tu me dis 🙌

Maravai
```

### Phase 4 — J32 Publication multi-canal automatique

Une fois "OK" reçu, Maravai (ou un futur script) publie :

| Canal | Format | Quand |
|---|---|---|
| **Insta @bookeasy_pf** | Post + Story | J32 9h |
| **Compte du Pro** | Story repost + tag @bookeasy_pf | J32 9h05 |
| **Facebook BookEasy** | Post identique | J32 9h10 |
| **Google My Business** | Post avec chiffres clés | J32 9h15 |
| **Landing /testimonials sur bookeasy.me** | Section dédiée | J32 manuel |
| **Tarif Fondateur page** | Carrousel témoignages | J32 manuel |

---

## 🎨 Template visuel (Canva — à créer 1× et réutiliser)

### Dimensions
- **1080×1080** (carré Insta post)
- **1080×1920** (story Insta/FB)

### Structure du visuel
```
┌─────────────────────────────────┐
│  [LOGO BOOKEASY EN HAUT]        │
│                                 │
│  📊 TÉMOIGNAGE 30 JOURS         │
│                                 │
│  [PHOTO DU PRO — circle 200px]  │
│                                 │
│  "[Citation 1 ligne forte]"     │
│                                 │
│  — [Nom Pro]                    │
│  [Métier] · [Ville]             │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  CHIFFRES CLÉS :                │
│  ✨ [X] RDV en ligne            │
│  🎁 [Y] XPF cartes cadeaux      │
│  📉 -[Z]% no-shows              │
│                                 │
│                                 │
│  bookeasy.me · Tarif Fondateur  │
└─────────────────────────────────┘
```

### Couleurs (cohérence brand)
- **Fond** : `#0C1B2A` (bleu nuit BookEasy)
- **Accent** : `#0066FF` (bleu vif BookEasy)
- **Texte principal** : `#FFFFFF`
- **Texte secondaire** : `rgba(255,255,255,0.7)`

### Template Canva à créer
1. Va sur **canva.com** (gratuit suffit)
2. Crée un template "BookEasy Témoignage 30j" avec les zones modifiables :
   - `{{PROSPECT_PHOTO}}` (placeholder photo)
   - `{{PROSPECT_NAME}}`
   - `{{PROSPECT_JOB}}`
   - `{{PROSPECT_CITY}}`
   - `{{QUOTE_LINE}}`
   - `{{METRIC_1}}` / `{{METRIC_2}}` / `{{METRIC_3}}`
3. Save comme **template réutilisable**
4. Pour chaque témoignage : duplique → remplace les champs en 2 min

---

## 📝 Variantes de copy par secteur (pré-rédigées)

Le script `generate-testimonial.ts` sélectionne automatiquement la bonne variante selon le `sector` du merchant.

### Beauté / Institut / Onglerie
> "En 30 jours avec BookEasy, mes clientes réservent quand elles veulent + les cartes cadeaux digitales m'ont ramené [X]% de CA en plus. L'outil tahitien que je recommande aux instituts du fenua. 🌺"

### Coiffeur / Barber
> "BookEasy en 30 jours : [X] RDV bookés en ligne sans répondre au tel + le programme fidélité XP fait revenir mes clients automatiquement. Pour les pros PF, c'est game-changer. ✂️"

### Massage / Spa
> "30 jours sur BookEasy : [X] séances réservées 24/7, acompte PayZen XPF natif (carte tahitienne), rappels automatiques qui ont divisé mes no-shows. L'outil pensé pour nous, fenua. 🌴"

### Coach (sportif / vie / énergétique)
> "Avec BookEasy depuis 30 jours, mes clientes paient en CB tahitienne sans frais cachés + le programme XP fidélise sur les transformations long-cours. Le bon outil pour les coachs PF. 💪"

### Photographe
> "BookEasy a sécurisé mes shoots en 30 jours : acompte PayZen XPF avant chaque séance, plus de no-shows, calendrier carré. L'outil que je recommande aux photographes du fenua. 📸"

### Santé (ostéo, kiné, somato, sage-femme)
> "30 jours avec BookEasy : rappels J-1 automatiques qui ont divisé mes no-shows par 4 + patient notes chiffrées RGPD natives. L'outil santé pensé PF. 🩺"

---

## 📊 Métriques à extraire (script automatique)

Le script SQL extrait pour chaque merchant à J30 :

| Métrique | Source Prisma | Formule |
|---|---|---|
| **RDV créés ce mois** | `Booking.createdAt > J-30 AND status != CANCELLED` | COUNT |
| **RDV en ligne (vs phone)** | Booking créés via plateforme | COUNT |
| **CA généré ce mois** | `Booking.totalPrice` confirmés | SUM |
| **No-show actuel** | `Booking.status = NO_SHOW` / total | % |
| **No-show baseline (J0)** | Input manuel onboarding | % |
| **Cartes cadeaux émises** | `GiftCard.createdAt > J-30` | COUNT |
| **Montant cartes cadeaux** | `GiftCard.amount` actives | SUM XPF |
| **XP transactions** | `XpTransaction.createdAt > J-30` | COUNT |
| **XP redemptions** | `XpRedemption.createdAt > J-30` | COUNT |
| **Acomptes PayZen** | `Booking.amountPaid > 0` | SUM XPF |
| **Top 3 services** | `Booking.serviceId` group | TOP 3 by CA |
| **Avis nouveaux** | `Review.createdAt > J-30` | COUNT |
| **Note moyenne** | `Review.rating` | AVG |

---

## 🎁 Bonus : ce que tu offres au Pro pour augmenter le "OK"

Pour que le Pro dise OUI quasi-systématiquement, ajoute dans ton message WhatsApp :

```
Petit bonus si tu valides 👇

✨ Je tagge ta marque dans mon post → tu récupères mes followers intéressés
✨ Je publie sur Google My Business BookEasy avec ton lien → SEO bonus pour ton institut
✨ Je t'envoie le visuel en HD pour tes propres stories
✨ Tu apparaitras dans la "Hall of Fame" Fondateurs sur bookeasy.me/testimonials

Pas de contrepartie demandée. C'est gagnant-gagnant : moi je gagne en crédibilité, toi tu gagnes en visibilité.
```

→ Le Pro voit que c'est **équilibré** et que c'est **du concret pour lui aussi**. Taux d'acceptation attendu : ~80-90%.

---

## 🗓️ Calendrier de collecte (objectif 10 témoignages en 60j)

Cible : décrocher les premiers Pro entre J0-J20, puis collecter témoignages à J30+30 chacun.

| Mois | Action | Sortie |
|---|---|---|
| **Juin 2026 (M0)** | Closing batch #02 P1 (10 petits poissons) | 5-7 signups Pro espérés |
| **Juillet 2026 (M1)** | Collecte témoignages J30 des premiers Pro | 5-7 témoignages |
| **Août 2026 (M2)** | Approche batch #02 P3 (gros poissons) avec témoignages en main | Faverjon, ELITE, Nehenehe répondent |

---

## ✅ Checklist publication (à dérouler après "OK" du Pro)

```
☐ Insta @bookeasy_pf : post carré 1080×1080
☐ Insta @bookeasy_pf : story (durée 24h)
☐ Tag du compte Pro dans le post + story
☐ DM au Pro avec le lien du post pour qu'il reposte sur ses stories
☐ Facebook page BookEasy : post identique
☐ Google My Business : post hebdo avec chiffres
☐ Landing bookeasy.me/testimonials : ajout au carrousel
☐ Tarif Fondateur page : ajout au carrousel
☐ Tracking sheet : marquer témoignage publié + date
```

---

## 🔧 TODO produit (à dev par Mara)

Pour que le système soit vraiment turnkey, il manque :

### 1. Page admin `/dashboard/baseline` (1h dev)
Champ texte pour entrer pendant l'onboarding :
- `baselineMonthlyBookings: number`
- `baselineWeeklyNoShows: number`
- `baselineAvgTicket: number`

→ Stocké dans `Merchant.baselineMetrics: Json` (nouveau champ Prisma).

### 2. Page publique `/testimonials` (3h dev)
Liste les témoignages validés. Composant `<TestimonialCard>` avec photo, citation, chiffres, lien fiche merchant.

### 3. Section "Hall of Fame Fondateurs" sur `/pricing` (1h dev)
Bandeau dynamique avec les 10 premiers Pro qui ont activé le Tarif Fondateur. Social proof maximal pour les futurs prospects.

---

## 🚀 Quick start pour Mara

```bash
# Dès qu'un Pro arrive à J30 :
npx tsx scripts/generate-testimonial.ts --merchant=12

# Lis le fichier généré :
cat marketing/testimonials/output/ava-e-ora-J30.md

# Copie-colle le message WhatsApp dans le chat avec le Pro
# Attends "OK"
# Duplique le template Canva, remplace les champs (2 min)
# Publie sur les 4-6 canaux selon checklist

# C'est tout. Total : 10-15 min de ton temps par témoignage.
```

---

_Système Zero-Friction : Pro répond "OK" + 10-15 min de Maravai par témoignage · 2026-06-10_
