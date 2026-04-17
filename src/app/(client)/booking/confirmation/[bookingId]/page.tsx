import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDuration, formatDate, formatTime } from "@/lib/utils";
import { isMedicalSector } from "@/lib/medical";
import { Calendar, Clock, Briefcase, Home, CalendarCheck, Star, CreditCard, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { ConfirmationContent } from "@/components/booking/ConfirmationContent";

interface ConfirmationPageProps {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ payment?: string }>;
}

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: ConfirmationPageProps) {
  const { bookingId } = await params;
  const { payment } = await searchParams;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      merchant: { select: { businessName: true, xpPerBooking: true, sector: { select: { slug: true } } } },
      service: true,
    },
  });

  if (!booking) notFound();

  const isMedical = booking.merchant.sector ? isMedicalSector(booking.merchant.sector.slug) : false;
  const isPendingPayment = booking.status === "PENDING_PAYMENT";
  const isPaymentFailed = payment === "failed" || payment === "cancelled";
  const isConfirmed = booking.status === "CONFIRMED";

  const xpEarned = !isMedical && isConfirmed ? await prisma.xpTransaction.findFirst({
    where: { bookingId, type: "EARNED" },
    select: { amount: true },
  }) : null;

  return (
    <ConfirmationContent>
      <div className="page-transition min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
      {/* Status animation */}
      <div className="animate-scale-in mb-6">
        <div className="relative w-24 h-24 mx-auto">
          {isPaymentFailed ? (
            <>
              <div className="absolute inset-0 rounded-full bg-red-100 animate-pulse-soft" />
              <div className="absolute inset-2 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
            </>
          ) : isPendingPayment ? (
            <>
              <div className="absolute inset-0 rounded-full bg-orange-100 animate-pulse-soft" />
              <div className="absolute inset-2 rounded-full bg-orange-50 flex items-center justify-center">
                <CreditCard className="w-12 h-12 text-orange-500" />
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-pulse-soft" />
              <div className="absolute inset-2 rounded-full bg-emerald-50 flex items-center justify-center">
                <svg
                  className="w-12 h-12"
                  viewBox="0 0 52 52"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="26" cy="26" r="23" fill="none" stroke="#10B981" strokeWidth="3" className="animate-fade-in" />
                  <path
                    d="M15 27L22 34L37 19"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="100"
                    style={{ animation: "checkmark 0.6s ease-out 0.3s forwards", strokeDashoffset: 100 }}
                  />
                </svg>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status text */}
      <div className="animate-fade-in-up text-center mb-8">
        {isPaymentFailed ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0C1B2A] dark:text-white mb-2">
              Paiement échoué
            </h1>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Le paiement n&apos;a pas abouti. Votre réservation est en attente. Vous pouvez réessayer depuis vos rendez-vous.
            </p>
          </>
        ) : isPendingPayment ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0C1B2A] dark:text-white mb-2">
              En attente de paiement
            </h1>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Votre réservation sera confirmée une fois le paiement reçu. Cela peut prendre quelques instants.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0C1B2A] dark:text-white mb-2">
              Rendez-vous confirmé !
            </h1>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Votre rendez-vous a bien été enregistré. Vous recevrez une confirmation.
            </p>
          </>
        )}
      </div>

      {/* Summary card */}
      <div className="animate-fade-in-up w-full max-w-md" style={{ animationDelay: "0.15s" }}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
          <div className={`px-5 py-4 ${
            isPaymentFailed
              ? "bg-gradient-to-r from-red-500 to-red-600"
              : isPendingPayment
                ? "bg-gradient-to-r from-orange-500 to-amber-500"
                : "bg-gradient-to-r from-[#0066FF] to-[#00B4D8]"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm">
                {booking.merchant.businessName[0]}
              </div>
              <div>
                <h2 className="font-bold text-white text-sm">
                  {booking.merchant.businessName}
                </h2>
                <p className="text-xs text-white/70">
                  {isPaymentFailed ? "Paiement échoué" : isPendingPayment ? "En attente de paiement" : "Réservation confirmée"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Briefcase className="h-3.5 w-3.5" />
                Service
              </span>
              <span className="font-semibold text-[#0C1B2A] dark:text-white text-sm">
                {booking.service.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                Date
              </span>
              <span className="font-semibold text-[#0C1B2A] dark:text-white text-sm">
                {formatDate(booking.date)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                Heure
              </span>
              <span className="font-semibold text-[#0C1B2A] dark:text-white text-sm">
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                Duree
              </span>
              <span className="font-semibold text-[#0C1B2A] dark:text-white text-sm">
                {formatDuration(booking.service.duration)}
              </span>
            </div>

            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
              <span className="font-bold text-[#0C1B2A] dark:text-white">Total</span>
              <span className="text-2xl font-black bg-gradient-to-r from-[#0066FF] to-[#00B4D8] bg-clip-text text-transparent">
                {formatPrice(booking.totalPrice)}
              </span>
            </div>

            {booking.paymentStatus === "PAID" && booking.amountPaid && (
              <div className="bg-green-50 rounded-xl px-4 py-3 flex items-center justify-between border border-green-200">
                <span className="flex items-center gap-2 text-sm font-medium text-green-800">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  Payé en ligne
                </span>
                <span className="font-bold text-green-700">
                  {booking.amountPaid.toLocaleString()} F
                </span>
              </div>
            )}

            {xpEarned && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl px-4 py-3 flex items-center justify-between border border-yellow-100 animate-fade-in-up">
                <span className="flex items-center gap-2 text-sm font-medium text-yellow-800">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Points fidélité gagnés
                </span>
                <span className="font-bold text-yellow-700 text-lg">
                  +{xpEarned.amount} XP
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div
        className="animate-fade-in-up flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-md"
        style={{ animationDelay: "0.3s" }}
      >
        <Link href="/my-bookings" className="flex-1">
          <button className="btn-press w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all text-sm">
            <CalendarCheck className="h-4 w-4" />
            Voir mes rendez-vous
          </button>
        </Link>
        <Link href="/" className="flex-1">
          <button className="btn-press w-full inline-flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-[#0C1B2A] dark:text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 transition-all text-sm">
            <Home className="h-4 w-4" />
            Retour à l&apos;accueil
          </button>
        </Link>
      </div>
    </div>
    </ConfirmationContent>
  );
}
