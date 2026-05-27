# 📡 Setup Resend pour Outreach — Guide pas à pas

**Objectif** : envoyer les 30 emails du batch #01 via Resend avec tracking automatique (ouvertures, clics, bounces) sans dégrader la réputation DKIM de `noreply@bookeasy.me` utilisé pour les emails transactionnels.

---

## ⚠️ Pourquoi un sous-domaine outbound dédié ?

### Le problème

`noreply@bookeasy.me` est utilisé pour les emails **transactionnels** critiques :
- Confirmations de réservation
- Rappels J-1
- Notifications de paiement PayZen
- Magic links auth

Si tu envoies **30+ emails d'outreach** depuis `noreply@bookeasy.me` et que **2-3 prospects** marquent ça comme spam :
- Ta réputation DKIM/SPF chute → délivrabilité de tes emails transactionnels baisse
- Résultat : clients qui ne reçoivent pas leur confirmation = mauvaise UX + tickets support

### La solution : sous-domaine séparé

Configurer `team.bookeasy.me` comme **domaine outbound dédié** :
- Tu envoies depuis `maravai@team.bookeasy.me`
- Si réputation chute → seuls tes outreach sont affectés
- Les transactionnels via `noreply@bookeasy.me` restent **safe**

---

## 🛠️ Setup en 3 étapes (30 min total)

### Étape 1 : Créer le sous-domaine Resend (10 min)

1. Va sur https://resend.com/domains
2. Click **Add Domain**
3. Entre : `team.bookeasy.me`
4. Resend te donne **4 DNS records** à ajouter chez ton registrar :
   - **TXT** (SPF) : `v=spf1 include:amazonses.com ~all`
   - **CNAME** (DKIM 1) : `resend._domainkey` → `resend._domainkey.amazonses.com`
   - **CNAME** (DKIM 2) : optionnel
   - **TXT** (DMARC) : `v=DMARC1; p=none;`

5. Ajoute les records chez ton registrar (probablement OVH, Cloudflare, ou Vercel DNS)
6. Attends **15-30 min** propagation DNS
7. Click **Verify** sur Resend → status doit passer 🟢 verified

### Étape 2 : Variables d'environnement (5 min)

Ajoute à `.env.local` (PAS .env) :

```bash
# Outreach batch envoi (séparé des transactionnels)
OUTREACH_FROM="Maravai · BookEasy <maravai@team.bookeasy.me>"
OUTREACH_REPLY_TO="bookeasy.pf@gmail.com"

# Garde-fou : si "true", force dry-run même avec --send
OUTREACH_DRY_RUN="false"
```

**IMPORTANT** : `RESEND_API_KEY` doit déjà exister (utilisé pour les emails transactionnels). On réutilise la même clé.

### Étape 3 : Test dry-run (5 min)

```bash
# Aperçu sans envoi réel
tsx scripts/send-outreach-batch.ts --batch=01

# → Affiche les 30 emails personnalisés en console
# → Aucun envoi, juste vérification
```

Vérifie que :
- ✅ Chaque prospect a un sujet personnalisé
- ✅ Le hook de perso est bien inséré
- ✅ Pas de variable `{prenom}` non remplacée

---

## 🚀 Envoi du batch (15 min)

### Test progressif (recommandé)

```bash
# 1. Envoyer aux 3 premiers prospects seulement (test grandeur nature)
tsx scripts/send-outreach-batch.ts --batch=01 --send --limit=3

# 2. Vérifier sur Resend Dashboard que les 3 emails arrivent (pas en spam)
#    https://resend.com/emails

# 3. Si OK → envoyer les 27 restants
tsx scripts/send-outreach-batch.ts --batch=01 --send
```

### Envoi complet

```bash
tsx scripts/send-outreach-batch.ts --batch=01 --send
```

Le script :
- Lit `marketing/prospects/batch-01/batch-01.csv`
- Génère un email personnalisé par prospect (sujet + hook + signature)
- Envoie via Resend avec **tags** (`campaign`, `prospect_id`, `sector`, `priority`)
- Throttle à 2 emails/seconde (limite free tier Resend)
- Log chaque envoi dans `marketing/prospects/batch-01/sent-log.csv`

Durée totale pour 30 emails : ~30 sec.

---

## 📊 Tracking automatique des ouvertures

### Côté Resend Dashboard

1. Va sur https://resend.com/emails
2. Filter par **tag** : `campaign:outreach-batch-01`
3. Tu vois en live :
   - **Opens** (par prospect_id)
   - **Clicks** (sur les liens bookeasy.me/pricing, calculateur ROI...)
   - **Bounces** (emails morts → mettre 🔴 dead dans tracking.md)
   - **Complaints** (spam reports → BOY ENLEVER de la base)

### Côté webhook BookEasy (déjà configuré ✅)

`src/app/api/resend/webhook/route.ts` traite automatiquement :
- `email.bounced` → marque `emailBounced=true` en DB
- `email.complained` → marque `emailComplained=true` en DB
- Le `canSendTo()` du `lib/email.ts` bloque les renvois aux adresses mortes

→ Aucun risque de spam loop.

---

## 📝 Mise à jour du tracking.md

À J+1 après l'envoi, mets à jour `marketing/prospects/batch-01/tracking.md` :

1. Coche **"Email envoyé"** pour tous les prospects du `sent-log.csv` (status=sent)
2. Marque 🔴 dead pour les `status=failed` (bounce)
3. À J+2, va sur Resend Dashboard et reporte les **opens** dans la colonne "Ouvert ?"

→ Cette étape sera automatisée dans la **Phase 2** (Move #3 — dashboard outreach avancé).

---

## 🆘 Troubleshooting

| Problème | Solution |
|---|---|
| `OUTREACH_FROM manquant` | Ajoute la var dans `.env.local` |
| `team.bookeasy.me not verified` | Attends 30 min après ajout DNS, click Verify Resend |
| Email arrive en spam | Vérifie DKIM/SPF/DMARC tous 🟢 sur Resend Domains |
| Tous les emails échouent | Vérifie RESEND_API_KEY valide via `curl https://api.resend.com/domains` |
| 1 email échoue | Email probablement invalide → marquer 🔴 dead |

---

## ✅ Checklist avant envoi batch #01

- [ ] Sous-domaine `team.bookeasy.me` créé sur Resend
- [ ] DNS records ajoutés et vérifiés 🟢
- [ ] `OUTREACH_FROM` configuré dans `.env.local`
- [ ] Dry-run exécuté avec succès (30 emails affichés sans erreur)
- [ ] Test envoi 3 prospects → emails reçus en inbox (pas spam)
- [ ] Envoi complet déclenché
- [ ] `sent-log.csv` généré avec 30 lignes status=sent
- [ ] J+1 : update `tracking.md` avec les "Email envoyé" cochés

---

## 🔄 Alternative : envoi via Gmail perso (si pas envie de setup Resend)

Si tu veux skip le setup Resend pour ce premier batch :

1. Ouvre `marketing/prospects/batch-01/batch-01.csv` dans Sheets
2. Pour chaque ligne, copie email + applique le template manuellement dans Gmail
3. Garde le track dans `tracking.md`

**Limite** : pas de tracking ouverture, pas de tags, plus de travail manuel. OK pour 30 emails, pas pour 100+.

→ Recommandation : **setup Resend maintenant** (30 min one-time investment), gain ENORME dès batch #02.
