import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import { GiftCardVerifier } from "./GiftCardVerifier";

export default async function DashboardGiftCardsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    select: { id: true, businessName: true },
  });
  if (!merchant) redirect("/dashboard/profile");

  // Gift cards linked to this merchant
  const giftCards = await prisma.giftCard.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Count bookings that used gift cards
  const bookingsWithGiftCards = await prisma.booking.count({
    where: {
      merchantId: merchant.id,
      notes: { contains: "[Carte cadeau:" },
    },
  });

  const activeCards = giftCards.filter(
    (c) => c.status === "ACTIVE" && c.expiresAt > new Date()
  );
  const usedCards = giftCards.filter(
    (c) => c.status === "USED" || c.balance <= 0
  );
  const expiredCards = giftCards.filter(
    (c) => c.status !== "USED" && c.balance > 0 && c.expiresAt <= new Date()
  );

  const totalRevenue = giftCards.reduce((sum, c) => sum + c.amount, 0);
  const totalUsed = giftCards.reduce(
    (sum, c) => sum + (c.amount - c.balance),
    0
  );

  return (
    <div className="page-transition">
      <h1 className="text-2xl font-bold text-[#0C1B2A] dark:text-white mb-6 animate-fade-in-up">
        Cartes cadeaux
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-[#0066FF]">
              {giftCards.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total cartes</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-green-500">
              {activeCards.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Actives</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-[#0C1B2A] dark:text-white">
              {formatPrice(Math.round(totalRevenue * 119.33))}
            </p>
            <p className="text-xs text-gray-500 mt-1">Valeur totale</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-purple-500">
              {bookingsWithGiftCards}
            </p>
            <p className="text-xs text-gray-500 mt-1">Réservations</p>
          </CardContent>
        </Card>
      </div>

      {/* Verify a gift card */}
      <GiftCardVerifier merchantId={merchant.id} />

      {/* Active cards */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[#0C1B2A] dark:text-white mb-4">
          Cartes actives ({activeCards.length})
        </h2>
        {activeCards.length > 0 ? (
          <div className="space-y-3">
            {activeCards.map((card) => (
              <Card
                key={card.id}
                className="rounded-2xl border-0 shadow-sm"
              >
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-mono font-bold text-[#0066FF] text-sm">
                        {card.code}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        De {card.senderName} pour {card.recipientName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Expire le{" "}
                        {new Date(card.expiresAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#0C1B2A] dark:text-white">
                        {formatPrice(Math.round(card.balance * 119.33))}
                      </p>
                      <p className="text-xs text-gray-400">
                        sur {formatPrice(Math.round(card.amount * 119.33))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Aucune carte cadeau active pour votre commerce.
          </p>
        )}
      </section>

      {/* Used / expired cards */}
      {(usedCards.length > 0 || expiredCards.length > 0) && (
        <section>
          <h2 className="text-lg font-semibold text-[#0C1B2A] dark:text-white mb-4">
            Utilisées / Expirées ({usedCards.length + expiredCards.length})
          </h2>
          <div className="space-y-3">
            {[...usedCards, ...expiredCards].map((card) => {
              const isExpired =
                card.status !== "USED" && card.expiresAt <= new Date();
              return (
                <Card
                  key={card.id}
                  className="rounded-2xl border-0 shadow-sm opacity-60"
                >
                  <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold text-gray-500 text-sm">
                            {card.code}
                          </p>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isExpired
                                ? "bg-orange-100 text-orange-600"
                                : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            }`}
                          >
                            {isExpired ? "Expirée" : "Utilisée"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {card.senderName} → {card.recipientName}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-500">
                        {formatPrice(Math.round(card.amount * 119.33))}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
