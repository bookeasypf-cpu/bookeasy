import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { MerchantCard } from "@/components/search/MerchantCard";
import Link from "next/link";

export const metadata = {
  title: "Mes favoris | BookEasy",
  description: "Vos professionnels favoris sur BookEasy.",
};

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      merchant: {
        include: {
          sector: true,
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const merchants = favorites
    .filter((f) => f.merchant.isActive)
    .map((f) => ({
      ...f.merchant,
      avgRating:
        f.merchant.reviews.length > 0
          ? f.merchant.reviews.reduce((sum, r) => sum + r.rating, 0) /
            f.merchant.reviews.length
          : 0,
    }));

  return (
    <div className="page-transition min-h-screen bg-[#F8FAFC] dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0C1B2A] via-[#0C1B2A] to-[#003D99]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
            <Heart className="h-7 w-7 text-white fill-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Mes favoris
          </h1>
          <p className="text-white/50 mt-2">
            {merchants.length} professionnel{merchants.length !== 1 ? "s" : ""} sauvegardé{merchants.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4 pb-12">
        {merchants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {merchants.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              <Heart className="h-8 w-8 text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Aucun favori pour le moment
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Explorez nos professionnels et ajoutez-les à vos favoris en cliquant sur le coeur.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Explorer les professionnels
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
