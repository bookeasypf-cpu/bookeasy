# 📸 BookEasy — Photo Bank & MidJourney Prompts

> Banque photos centrale pour les 13 secteurs marketing.
> Actuel : Unsplash générique. Objectif : photos authentiques Polynésie.

---

## 🎯 Stratégie photos (3 niveaux)

| Niveau | Source | Quand | Budget |
|---|---|---|---|
| **🟢 NOW** | Unsplash IDs ci-dessous | Démarrage immédiat | 0 XPF |
| **🟡 MIDDLE** | MidJourney prompts ci-dessous | Phase 2 (post 1 mois) | ~3 000 XPF/mois |
| **🔴 PRO** | Photographe local Tahiti | Phase 3 (post 3 mois) | 50–100 k XPF / session |

---

## 🟡 MidJourney Prompts — Authentiques Polynésie

Pattern à appliquer à TOUS les prompts pour cohérence visuelle BookEasy :
```
[scene] + Polynesian setting, tropical light, warm golden hour,
authentic local atmosphere, professional photography, --ar 1:1 --style raw --v 6
```

### 🌺 Beauté & Bien-être

**Spa**
```
Polynesian spa massage room, hands pouring monoi oil, tiare flowers,
warm sunset light streaming through bamboo blinds, wooden table,
professional photography, peaceful authentic atmosphere,
--ar 1:1 --style raw --v 6
```

**Institut de beauté**
```
Modern beauty institute in Papeete, facial treatment room,
soft natural light, pink tropical flowers, vahine receiving care,
clean minimal decor, professional photography,
--ar 1:1 --style raw --v 6
```

**Massage**
```
Traditional Polynesian taurumi massage, hands working on shoulders,
monoi oil, wooden table on terrace, palm trees in soft background,
authentic warm tropical mood, --ar 1:1 --style raw --v 6
```

**Manucure & Onglerie**
```
Nail art studio Tahiti, close-up hands with tropical floral nail design,
pink hibiscus and white tiare patterns, modern minimal salon background,
soft natural light, --ar 1:1 --style raw --v 6
```

**Maquillage**
```
Polynesian makeup artist working on bride, traditional flower crown,
professional palette, soft window light, authentic emotional moment,
wedding preparation Tahiti, --ar 1:1 --style raw --v 6
```

**Tatoueur**
```
Polynesian tattoo artist in studio, traditional patua patterns on skin,
focused hands working, dim warm tungsten light, authentic Tahitian
cultural atmosphere, professional, --ar 1:1 --style raw --v 6
```

### ✂️ Coiffure

**Barber**
```
Modern barbershop in Papeete, vintage leather chair, masculine mood,
fade haircut in progress, warm tungsten lighting, professional barber tools
in foreground, --ar 1:1 --style raw --v 6
```

**Coiffeur**
```
Elegant hair salon Tahiti, female stylist working on long dark hair,
tropical flowers in background, soft natural daylight, modern interior,
professional photography, --ar 1:1 --style raw --v 6
```

### 💪 Sport

**Coach sportif**
```
Personal trainer beach workout session in Polynesia, athletic vahine
doing strength training at sunrise, lagoon background, energetic
authentic Pacific mood, --ar 1:1 --style raw --v 6
```

### 🩺 Médical

**Médecin**
```
Modern medical office in Papeete, polynesian doctor with stethoscope,
clean professional environment, soft natural light, trust and care
atmosphere, --ar 1:1 --style raw --v 6
```

**Dentiste**
```
Modern dental clinic Tahiti, professional dentist chair, bright clean
environment, tropical plant in corner, soft natural light, reassuring
mood, --ar 1:1 --style raw --v 6
```

**Ostéopathe**
```
Osteopath treatment room, natural wood and white walls, polynesian
practitioner working on back, calm professional atmosphere, soft light,
--ar 1:1 --style raw --v 6
```

**Kiné**
```
Modern physiotherapy clinic, treatment table, recovery equipment,
bright clean environment, professional setting, --ar 1:1 --style raw --v 6
```

**Infirmier**
```
Home care nurse in Polynesian family home, gentle care moment,
soft tropical daylight through window, professional caring atmosphere,
authentic local home, --ar 1:1 --style raw --v 6
```

---

## 🔴 Brief Photographe Local (Phase 3)

### Liste shot par session (1 session = 1 secteur, 30-50 photos exploitables)

**Format demandé** :
- Carré 1:1 (Instagram post)
- Portrait 9:16 (Story/Reel)
- Bonus paysage 16:9 (cover Facebook)

**Style imposé** :
- Lumière naturelle, golden hour si possible
- Pas de flash agressif
- Authentique, pas de poses figées
- Inclure éléments locaux (fleurs tiaré, monoi, vue lagon)
- Espace négatif sur 30% du cadre (pour overlay texte ensuite)

**Droits** : cession complète pour usage marketing BookEasy multi-supports

---

## 📋 Checklist par secteur (à valider avant publication)

Pour chaque photo retenue :

- [ ] Définition ≥ 1080×1080
- [ ] Format AVIF/WebP (optimisation Next.js)
- [ ] Pas de visage identifiable sans autorisation
- [ ] Zone "safe" dégagée pour texte (30% min)
- [ ] Lumière naturelle dominante
- [ ] Cohérence palette du secteur respectée
- [ ] Alt text descriptif (accessibilité + SEO)
- [ ] Stockée dans Vercel Blob avec nommage `[sector]-[variant]-[size].avif`

---

## 🔁 Workflow de remplacement Unsplash → MidJourney → Pro

1. **Semaine 1-4** : Unsplash actuel = on poste maintenant
2. **Semaine 4-8** : MidJourney basé sur prompts ci-dessus = remplace progressivement
3. **Mois 3+** : Session pro = remplacement définitif des photos clés (top 5 secteurs)

**Important** : éditer `data/sectors.js` à chaque remplacement — les visuels se mettent à jour automatiquement partout.
