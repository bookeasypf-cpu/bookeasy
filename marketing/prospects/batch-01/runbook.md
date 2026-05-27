# 🚀 Runbook Batch #01 — Outreach 30 prospects

**Objectif** : envoyer 30 emails personnalisés en 1 journée, suivre 14 jours.

---

## 📅 Calendrier d'exécution

### J0 — Préparation (1h)
- [ ] Lire les 6 templates dans `../templates/`
- [ ] Vérifier `batch-01.csv` (30 lignes, emails valides)
- [ ] Préparer signature email perso (Maravai · BookEasy · WhatsApp)
- [ ] Connecter compte email envoi (Resend déjà setup BookEasy ?)

### J1 — Envoi des 30 emails (2h)
- [ ] Envoyer emails entre **9h-11h** (heure PF)
- [ ] Respecter ordre : P1 d'abord (16 prospects), puis P2 (14 prospects)
- [ ] Personnaliser chaque envoi avec `personalization_hook` du CSV
- [ ] Marquer `tracking.md` → ☑ Email envoyé

### J3 — Relance DM Insta (1h)
- [ ] Pour prospects **sans réponse** ET ayant un compte Insta
- [ ] Pinger sur 1 publication récente avant le DM
- [ ] Utiliser version DM du template
- [ ] Marquer `tracking.md` → ☑ DM Insta

### J7 — Appel à froid (3h)
- [ ] Pour prospects **toujours sans réponse**
- [ ] Créneau optimal : **10h-11h** ou **14h-15h** PF
- [ ] SMS court 5 min avant l'appel (préchauffe)
- [ ] Note l'objection principale par appel dans `tracking.md`

### J14 — Bilan & itération
- [ ] Calculer KPIs réels (ouverture, réponse, démo)
- [ ] Identifier l'angle gagnant
- [ ] Préparer batch #02 avec apprentissages

---

## 📨 Process d'envoi d'un email (5 min par prospect)

### 1. Choisir le template (1 min)

| Secteur | Template |
|---|---|
| Tatoueur, Barber, Coiffeur, Onglerie, Maquilleuse | `01-beaute-body.md` |
| Spa, Institut beauté, Coach sportif | `02-bien-etre-premium.md` |
| Kiné, Ostéo, Sage-femme, Podologue | `03-sante-liberal.md` |
| Dentiste, Médecin gé | `04-sante-cabinet.md` |
| Infirmier libéral | `05-infirmiers-liberaux.md` |
| Photographe | `06-creatifs-photographes.md` |

### 2. Remplir les variables (2 min)

- `{prenom}` → chercher sur Insta/FB du prospect (sinon "Bonjour")
- `{nom_etablissement}` → colonne `prospect_name` du CSV
- `{signature}` → Maravai · BookEasy · WhatsApp +689 XX XX XX XX

### 3. Personnaliser avec le hook (1 min)

- Lire `personalization_hook` du CSV (ex: "Studio référence fondé 2003 — 24K Insta")
- Insérer 1 ligne perso AVANT le pitch :
  > "J'ai vu {hook précis} — je voulais vous écrire perso plutôt que d'envoyer un truc générique."

### 4. Envoi + tracking (1 min)

- Envoyer l'email
- Marquer ☑ dans `tracking.md` colonne "Email envoyé"

---

## 🔥 Règles d'or

✅ **À FAIRE**
- 1 prospect = 1 hook unique. Pas de copier-coller pur.
- Maximum 200 mots par email.
- Toujours mentionner XPF (pas EUR/USD).
- CTA simple : "10-15 min de démo ?"
- Si réponse positive → répondre dans les 2h.

❌ **À ÉVITER**
- Envois en masse avec BCC (= spam)
- Pavés de 5 paragraphes
- "Cher Madame/Monsieur"
- Pitch avant connexion (toujours 1 ligne perso d'abord)
- Forward avec 5 personnes en CC

---

## 📊 Outils recommandés (free tier OK pour 30 prospects)

| Besoin | Outil | Pourquoi |
|---|---|---|
| **Envoi emails personnalisés** | Resend (déjà setup BookEasy) ou Gmail | Tracking ouverture natif |
| **Tracking** | Ce fichier `tracking.md` + Sheets | Simple, versionnable |
| **DM Insta** | App Insta perso | Pas d'outil tiers (risque shadow ban) |
| **Appels** | WhatsApp Business (numéro PF) | Préféré en PF vs SMS classique |

---

## 🆘 Si tu bloques

| Situation | Action |
|---|---|
| Email reviendu (bounce) | Marquer 🔴 dead, vérifier email |
| Pas de réponse à J7 | Marquer 🔴 dead OU pinger DM Insta |
| Réponse négative | Marquer 🔴 dead, demander "qui dans votre équipe gère ça ?" |
| Réponse positive | Envoyer Calendly/lien de booking BookEasy démo |
| Demande de prix | Envoyer la grille tarifaire BookEasy (à préparer) |

---

## ✅ Critère de succès du batch #01

> Si on a **3 démos planifiées** sur 30 envois (= 10%), le batch est un succès.  
> Si on a **1 closing** (premier client payant) sur 30, c'est un home run.

→ On reproduit le process pour batch #02 avec ajustements basés sur les apprentissages.
