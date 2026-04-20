import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { isMedicalSectorName } from "@/lib/medical";

export default async function DashboardReviewsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    include: { sector: { select: { name: true } } },
  });
  if (!merchant) redirect("/dashboard/profile");

  const isMedical = isMedicalSectorName(merchant.sector?.name);

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
