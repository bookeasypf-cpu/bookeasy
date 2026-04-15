# Claude Code Config — BookEasy (AUTO-GÉNÉRÉ)
> Généré automatiquement depuis l'état réel du projet. Ne pas éditer manuellement.
> Extends parent `/CLAUDE.md`

**Généré le**: 2026-04-14 13:55

## Stack (depuis package.json)
```
next: 16.1.6
react: 19.2.3
typescript: ^5
@prisma/client: ^7.4.2
prisma: ^7.4.2
next-auth: ^4.24.13
resend: ^6.9.3
web-push: ^3.6.7
stripe: ^20.4.1
zod: ^4.3.6
tailwindcss: ^4
framer-motion: ^12.35.0
```

## Structure réelle (src/)
```
actions/auth.ts
actions/booking.ts
actions/review.ts
app/(auth)/layout.tsx
app/(auth)/login/page.tsx
app/(auth)/register/layout.tsx
app/(auth)/register/page.tsx
app/(client)/booking/[merchantId]/page.tsx
app/(client)/booking/confirmation/[bookingId]/page.tsx
app/(client)/favorites/page.tsx
app/(client)/gift-cards/page.tsx
app/(client)/layout.tsx
app/(client)/legal/cgu/page.tsx
app/(client)/legal/confidentialite/page.tsx
app/(client)/legal/layout.tsx
app/(client)/legal/mentions-legales/page.tsx
app/(client)/map/page.tsx
app/(client)/merchants/[merchantId]/loading.tsx
app/(client)/merchants/[merchantId]/page.tsx
app/(client)/my-bookings/CancelButton.tsx
app/(client)/my-bookings/ReviewForm.tsx
app/(client)/my-bookings/page.tsx
app/(client)/my-rewards/page.tsx
app/(client)/pricing/page.tsx
app/(client)/profile/page.tsx
app/(client)/referrals/ReferralPageClient.tsx
app/(client)/referrals/page.tsx
app/(client)/search/loading.tsx
app/(client)/search/page.tsx
app/(client)/sectors/page.tsx
app/(dashboard)/dashboard/analytics/page.tsx
app/(dashboard)/dashboard/availability/page.tsx
app/(dashboard)/dashboard/bookings/BookingActions.tsx
app/(dashboard)/dashboard/bookings/page.tsx
app/(dashboard)/dashboard/calendar/page.tsx
app/(dashboard)/dashboard/gift-cards/GiftCardVerifier.tsx
app/(dashboard)/dashboard/gift-cards/page.tsx
app/(dashboard)/dashboard/loyalty/page.tsx
app/(dashboard)/dashboard/page.tsx
app/(dashboard)/dashboard/patients/page.tsx
app/(dashboard)/dashboard/profile/page.tsx
app/(dashboard)/dashboard/reviews/page.tsx
app/(dashboard)/dashboard/services/page.tsx
app/(dashboard)/dashboard/support/page.tsx
app/(dashboard)/layout.tsx
app/api/admin/geocode-all/route.ts
app/api/auth/[...nextauth]/route.ts
app/api/cron/expire-subscriptions/route.ts
app/api/cron/reminders/route.ts
app/api/dashboard/availability/route.ts
app/api/dashboard/calendar/route.ts
app/api/dashboard/patients/notes/route.ts
app/api/dashboard/photos/route.ts
app/api/dashboard/profile/route.ts
app/api/dashboard/services/route.ts
app/api/dashboard/support/route.ts
app/api/dashboard/validate-code/route.ts
app/api/dashboard/xp-rewards/route.ts
app/api/dashboard/xp-settings/route.ts
app/api/favorites/route.ts
app/api/gift-cards/route.ts
app/api/merchants/[merchantId]/availability/route.ts
app/api/merchants/[merchantId]/route.ts
app/api/merchants/list/route.ts
app/api/payzen/checkout/route.ts
app/api/payzen/ipn/route.ts
app/api/profile/route.ts
app/api/push/subscribe/route.ts
app/api/quick-register/route.ts
app/api/referrals/route.ts
app/api/referrals/validate/route.ts
app/api/sectors/route.ts
app/api/stripe/checkout/route.ts
app/api/stripe/portal/route.ts
app/api/stripe/webhook/route.ts
app/api/upload/route.ts
app/api/xp/balance/route.ts
app/api/xp/history/route.ts
app/api/xp/redeem/route.ts
app/error.tsx
```

## API Routes (src/app/api/)
- /api/admin/geocode-all
- /api/auth/[...nextauth]
- /api/cron/expire-subscriptions
- /api/cron/reminders
- /api/dashboard/availability
- /api/dashboard/calendar
- /api/dashboard/patients/notes
- /api/dashboard/photos
- /api/dashboard/profile
- /api/dashboard/services
- /api/dashboard/support
- /api/dashboard/validate-code
- /api/dashboard/xp-rewards
- /api/dashboard/xp-settings
- /api/favorites
- /api/gift-cards
- /api/merchants/[merchantId]/availability
- /api/merchants/[merchantId]
- /api/merchants/list
- /api/payzen/checkout
- /api/payzen/ipn
- /api/profile
- /api/push/subscribe
- /api/quick-register
- /api/referrals
- /api/referrals/validate
- /api/sectors
- /api/stripe/checkout
- /api/stripe/portal
- /api/stripe/webhook
- /api/upload
- /api/xp/balance
- /api/xp/history
- /api/xp/redeem

## Modèles Prisma (schema réel)
- User
- Account
- Session
- VerificationToken
- Sector
- Merchant
- MerchantPhoto
- Service
- WeeklySchedule
- BlockedSlot
- Booking
- Review
- Notification
- XpTransaction
- XpReward
- XpRedemption
- GiftCard
- Favorite
- PushSubscription
- PatientNote
- WebhookEvent
- Referral

## État migrations
1 migration found in prisma/migrations

## Variables d'env requises
```
DATABASE_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
FACEBOOK_CLIENT_ID
FACEBOOK_CLIENT_SECRET
RESEND_API_KEY
EMAIL_FROM
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

## Règles métier critiques (invariantes)

### Paiements
- **PayZen** (OSB) = paiements clients (réservations) — devise XPF
- **Stripe** = abonnements Pro marchands uniquement
- IPN PayZen → toujours retourner 200 même si erreur interne
- Signature HMAC-SHA256 vérifiée AVANT tout traitement

### Auth
- NextAuth v4 (rester sur v4, v5 = beta)
- Strategy JWT (pas database)
- Middleware: allow list uniquement, jamais deny list
- Jamais importer Prisma dans middleware.ts (Edge Runtime)

### DB
- Prisma 7 — `$use` SUPPRIMÉ, utiliser `$extends`
- `prisma generate` n'est plus automatique → postinstall script
- Transactions + SELECT FOR UPDATE pour double-booking
- Soft delete pour données importantes

### Sécurité
- Ownership check avant chaque retour de données
- Rate limiting sur endpoints publics (Upstash)
- Jamais exposer passwordHash, refresh_token, tokens
- Validation Zod côté serveur TOUJOURS (même si client valide)

### Logging (RGPD)
- Logger: bookingId, orderId, transactionId, status, duration
- JAMAIS logger: email, nom, téléphone, cardNumber, hash PayZen, tokens

### MCP disponibles dans cette session
- `postgres` → requêtes SQL directes sur Neon DB
- `prisma` → migrate-status, migrate-dev, Prisma Studio
- `github` → PRs, issues, commits (repo: bookeasypf-cpu/bookeasy)
- `vercel` → deployments, logs (projet: bookeasy)
