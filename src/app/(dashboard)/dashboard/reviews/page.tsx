import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { isMedicalSectorName } from "@/lib/medical";
import { Star, TrendingUp, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardReviewsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    include: { sector: { select: { name: true } } },
  });
  if (!merchant) redirect("/dashboard/profile");

  const isMedical = isMedicalSectorName(merchant.sector?.name);

  // Upsell for non-PRO merchants
  if (merchant.plan !== "PRO") {
    return (
      <div className="page-transition">
        <h1 className="text-2xl font-bold text-[#0C1B2A] dark:text-white mb-6 animate-fade-in-up">
          {isMedical ? "Avis patients" : "Avis clients"}
        </h1>
        <div className="bg-gradient-to-br from-[#0066FF]/5 via-white to-[#00B4D8]/5 dark:from-[#0066FF]/10 dark:via-gray-900 dark:to-[#00B4D8]/10 rounded-2xl border border-[#0066FF]/15 dark:border-[#0066FF]/20 p-8 text-center animate-fade-in-up">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00B4D8] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Star className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-lg font-bold text-[#0C1B2A] dark:text-white mb-2">
            Activez les avis clients
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto mb-6">
            Passez en PRO pour permettre à vos clients de noter et commenter vos services. Les avis renforcent votre crédibilité et attirent de nouveaux clients.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Star className="h-4 w-4 text-amber-400" />
              Notes et commentaires
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Meilleure visibilité
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Users className="h-4 w-4 text-[#0066FF]" />
              Plus de clients
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#0066FF] to-[#00B4D8] rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
          >
            Découvrir le plan Pro
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const reviews = await prisma.review.findMany({
    where: { merchantId: merchant.id },
    include: {
      client: { select: { name: true } },
      booking: { include: { service: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const avatarGradient = isMedical
    ? "from-emerald-500/10 to-teal-500/10"
    : "from-[#0066FF]/10 to-[#00B4D8]/10";
  const avatarText = isMedical ? "text-emerald-600" : "text-[#0066FF]";
  const ratingGradient = isMedical
    ? "from-emerald-500 to-teal-500"
    : "from-[#0066FF] to-[#00B4D8]";

  return (
    <div className="page-transition">
      <h1 className="text-2xl font-bold text-[#0C1B2A] dark:text-white mb-2 animate-fade-in-up">
        {isMedical ? "Avis patients" : "Avis clients"}
      </h1>
      {reviews.length > 0 && (
        <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
          <StarRating rating={avgRating} size={20} />
          <span className={`text-lg font-bold bg-gradient-to-r ${ratingGradient} bg-clip-text text-transparent`}>
            {avgRating.toFixed(1)}
          </span>
          <span className="text-gray-500">({reviews.length} avis)</span>
        </div>
      )}
      <div className="space-y-3 stagger-children">
        {reviews.map((review) => (
          <Card key={review.id} className="rounded-2xl card-hover border-0 shadow-sm">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-sm font-semibold ${avatarText}`}>
                  {review.client.name?.[0] || "?"}
                </div>
                <div>
                  <span className="text-sm font-medium text-[#0C1B2A] dark:text-white">
                    {review.client.name || "Anonyme"}
                  </span>
                  <p className="text-xs text-gray-400">
                    {review.booking.service.name}
                  </p>
                </div>
                <div className="ml-auto">
                  <StarRating rating={review.rating} size={14} />
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{review.comment}</p>
              )}
            </CardContent>
          </Card>
        ))}
        {reviews.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            Aucun avis pour le moment
          </p>
        )}
      </div>
    </div>
  );
}
