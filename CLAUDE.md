# Claude Code Config - BookEasy

Extends parent `/CLAUDE.md` with BookEasy-specific specializations.

---

## 🎯 Project Context

**BookEasy** = Booking/Reservation Platform

### Core Domains
- User accounts & profiles
- Availability slots & calendar
- Booking/reservation lifecycle
- Payments (Stripe)
- Notifications (email + push)
- Location-based services (Leaflet)
- QR code generation & verification

---

## 📦 BookEasy-Specific Specialties

### 1️⃣ Reservation Logic
**Patterns to know:**
- Slot availability (booked vs available)
- Concurrency: two users booking same slot simultaneously
  - Use DB-level constraints (UNIQUE, CHECK)
  - Prisma transactions for atomic operations
- Booking states: pending → confirmed → completed → cancelled
- Cancellation windows (grace period logic)
- Double-booking prevention

**Common patterns:**
```typescript
// Atomic booking with transaction
await prisma.$transaction(async (tx) => {
  const slot = await tx.slot.findUnique({ ... });
  if (!slot || slot.booked) throw Error("Unavailable");
  await tx.booking.create({ ... });
  await tx.slot.update({ booked: true });
});
```

### 2️⃣ Payment Integration (Stripe)
**Key concepts:**
- Idempotent webhook handlers (same webhook ≠ duplicate charge)
- Payment status tracking: pending → succeeded → failed → refunded
- Refund workflows (partial + full)
- Dispute handling
- PCI compliance (never handle raw card data)

**Webhook pattern:**
```typescript
// idempotencyKey prevents duplicate processing
if (await db.webhook.exists(event.id)) return;
await processPayment(event);
await db.webhook.create(event.id);
```

### 3️⃣ Notifications
**Email (Resend):**
- Booking confirmation
- Reminder 24h before
- Cancellation notices
- Payment receipt

**Push notifications:**
- Real-time booking updates
- Reminders
- Status changes

**Pattern:**
- Template-based (not string concatenation)
- Retry on failure
- Track delivery status

### 4️⃣ Database Schema (Prisma)
**Key models:**
- `User` (profile, auth)
- `Service` (what can be booked: haircut, consultation, etc.)
- `Slot` (availability window)
- `Booking` (reservation instance)
- `Payment` (transaction record)
- `Notification` (delivery log)

**Relationships to watch:**
- One user → many bookings
- One service → many slots
- One booking → one payment
- Cascade deletes (careful!)

### 5️⃣ Geolocation & Maps (Leaflet)
**Patterns:**
- Calculate distance between user & service location
- Service zones (available in radius)
- Map clustering for multiple slots
- Geocoding addresses

### 6️⃣ QR Codes
**Flow:**
- Generate on booking confirmation (booking ID encoded)
- Scan to verify attendance (stateless: decode → validate → mark complete)
- Never trust client-side QR decode (verify on server)

### 7️⃣ Form Validation (Zod)
**All forms must validate:**
- Client-side (UX)
- Server-side (security) ← always, assume client is compromised
- Consistent error messages

### 8️⃣ Security & Permissions
**Critical:**
- Row-level: user can only see their bookings
- Rate limiting: prevent spam booking attempts
- CSRF tokens (NextAuth handles)
- Never expose internal IDs in URLs (slug + check ownership)
- Input sanitization (especially text fields)

**Pattern:**
```typescript
// Check ownership before returning data
const booking = await db.booking.findUnique({ where: { id } });
if (booking.userId !== session.user.id) throw Forbidden();
```

---

## 🔄 Common Workflows

### User Books a Slot
1. User selects service + date/time
2. Check slot available (not booked)
3. Create booking (pending)
4. Initiate Stripe payment
5. On payment success: mark booking confirmed
6. Send confirmation email + push
7. Generate QR code

### Slot Management
- Admin creates slots for service
- Calculate availability (working hours, buffer between bookings)
- Block slots (maintenance, time off)

### Cancellation
- User cancels: refund + notification
- Admin cancels: refund + notification
- Grace period: cancel free up to X hours before

---

## 📊 Database Constraints

```prisma
// Slot uniqueness: service + date + time
@@unique([serviceId, startTime])

// Booking constraints
- One booking per user per slot
- Status must be: pending|confirmed|completed|cancelled
- Payment must exist if booking confirmed

// Payment idempotency
- Unique stripePaymentId (prevents duplicate Stripe charges)
```

---

## 🚨 Edge Cases to Handle

- User clicks "Book" twice → prevent duplicate booking
- Payment webhook arrives before booking created → queue & retry
- Slot deleted while user booking → show error gracefully
- Admin changes service availability → notify affected users
- Refund issued but user books again → handle state correctly
- QR code expires (booking completed) → show "already verified"

---

## 🎨 UI/UX Patterns

- Availability calendar (Framer Motion transitions)
- Loading states during booking (optimistic updates)
- Toast notifications (react-hot-toast)
- Form validation feedback (real-time Zod)
- Error boundaries (don't crash on payment failure)
- Dark mode (next-themes)

---

## 🧪 Testing Focus

Integration tests > unit tests for:
- Full booking flow (slot → payment → confirmation)
- Concurrent bookings (race conditions)
- Webhook idempotence
- Permission checks (user X can't access user Y's bookings)

---

## 📍 File Structure (BookEasy-specific)

```
app/
  (auth)/              # login, signup, forgot-password
  (dashboard)/         # user dashboard
    bookings/          # my bookings list
    [bookingId]/       # booking detail + QR code
  api/
    bookings/          # POST (create), GET (list)
    [bookingId]/       # GET, PATCH (cancel)
    payments/          # Stripe webhooks
    slots/             # service availability
lib/
  services/
    booking.ts         # booking logic
    payment.ts         # Stripe integration
    notification.ts    # email + push
    geolocation.ts     # maps + distance
prisma/
  schema.prisma        # models + constraints
```

