# BookEasy — Agent Reference (dense, no prose)

## Identity
Plateforme réservation Polynésie Française. bookeasy.me. XPF currency.

## Stack
Next.js 16 App Router | TypeScript 5 strict | Prisma 7 | PostgreSQL (Neon) | NextAuth 4 | PayZen (client payments) | Stripe (merchant subscriptions)

## Critical Rules (never break)
- NO Prisma in middleware.ts — Edge Runtime incompatible
- PayZen = client bookings (XPF) | Stripe = merchant Pro plans (USD/EUR)
- `$extends` only — `$use` removed in Prisma 7
- `getServerSession(authOptions)` — never `getSession()` server-side
- DB import: `@/lib/prisma` singleton only — never `new PrismaClient()`
- IPN: read body as `text()` first, then JSON.parse — HMAC-SHA256 with PAYZEN_IPN_SECRET
- Idempotency-Key header (not X-Entity-Ref-ID)

## File Map
```
src/app/api/         — 34 API routes
src/app/(merchant)/  — merchant dashboard
src/app/(client)/    — booking flow
src/lib/prisma.ts    — DB singleton
src/lib/payzen.ts    — PayZen client
src/middleware.ts    — auth/CORS (NO Prisma here)
prisma/schema.prisma — 21 models
```

## Auth
- Roles: CLIENT | MERCHANT | ADMIN
- Server: `getServerSession(authOptions)` → check session.user.role
- Server Actions: `requireRole('MERCHANT')` first line

## PayZen IPN Pattern
```ts
const body = await request.text() // text() first!
const hash = createHmac('sha256', PAYZEN_IPN_SECRET).update(body).digest('hex')
// verify hash before JSON.parse
const data = JSON.parse(body)
```

## Agents: scope
- security-reviewer: API routes, middleware, IPN handlers, auth
- db-analyst: Prisma queries, schema indexes, N+1, transactions
- code-reviewer: TypeScript, naming, Next.js patterns
- gemini-analyst: full codebase ingestion (pending auth)
