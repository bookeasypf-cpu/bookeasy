import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate, formatTime, formatDuration } from "@/lib/utils";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/lib/constants";
import { Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { CancelBookingButton } from "./CancelButton";

export default async function MyBookingsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { clientId: session.user.id },
    include: {
      merchant: { select: { businessName: true, city: true } },
      service: true,
      review: { select: { id: true } },
    },
    orderBy: { date: "desc" },
  });

  const upcoming = bookings.filter(
    (b) =>
      (b.status === "CONFIRMED" || b.status === "PENDING") &&
      b.date >= new Date().toISOString().split("T")[0]
  );

  const past = bookings.filter(
    (b) =>
      b.status === "COMPLETED" ||
      b.status === "CANCELLED_BY_CLIENT" ||
      b.status === "CANCELLED_BY_MERCHANT" ||
      b.status === "NO_SHOW" ||
      (b.date < new Date().toISOString().split("T")[0] &&
        (b.status === "CONFIRMED" || b.status === "PENDING"))
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Mes rendez-vous
      </h1>

      {/* Upcoming */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          &Agrave; venir ({upcoming.length})
        </h2>
        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {booking.merchant.businessName}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${BOOKING_STATUS_COLORS[booking.status] || ""}`}
                        >
                          {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {booking.service.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(booking.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(booking.startTime)} -{" "}
                          {formatTime(booking.endTime)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">
                        {formatPrice(booking.totalPrice)}
                      </span>
                      {(booking.status === "CONFIRMED" ||
                        booking.status === "PENDING") && (
                        <CancelBookingButton bookingId={booking.id} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            Aucun rendez-vous &agrave; venir.{" "}
            <Link href="/search" className="text-indigo-600">
              Trouver un professionnel
            </Link>
          </p>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pass&eacute;s ({past.length})
          </h2>
          <div className="space-y-3">
            {past.map((booking) => (
              <Card key={booking.id} className="opacity-75">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {booking.merchant.businessName}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${BOOKING_STATUS_COLORS[booking.status] || ""}`}
                        >
                          {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {booking.service.name}
                      </p>
                      <span className="text-sm text-gray-400">
                        {formatDate(booking.date)} &agrave;{" "}
                        {formatTime(booking.startTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">
                        {formatPrice(booking.totalPrice)}
                      </span>
                      {booking.status === "COMPLETED" && !booking.review && (
                        <Link
                          href={`/merchants/${booking.merchantId}`}
                          className="text-sm text-indigo-600 font-medium"
                        >
                          Laisser un avis
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
