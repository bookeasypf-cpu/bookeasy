import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDuration, formatDate, formatTime } from "@/lib/utils";
import { Calendar, Clock, Briefcase, MapPin, Home, CalendarCheck, Star } from "lucide-react";
import Link from "next/link";

interface ConfirmationPageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function BookingConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      merchant: { select: { businessName: true, xpPerBooking: true } },
      service: true,
    },
  });

  if (!booking) notFound();

  // Get XP earned for this booking
  const xpEarned = await prisma.xpTransaction.findFirst({
    where: { bookingId, type: "EARNED" },
    select: { amount: true },
  });

  return (
    <div className="page-transition min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 sm:px-6 py-12">
      {/* Success animation area */}
      <div className="animate-scale-in mb-6">
        <div className="relative w-24 h-24 mx-auto">
          {/* Outer ring pulse */}
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-pulse-soft" />
          {/* Inner ring */}
          <div className="absolute inset-2 rounded-full bg-emerald-50 flex items-center justify-center">
            {/* Animated checkmark SVG */}
            <svg
              className="w-12 h-12"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="26"
                cy="26"
                r="23"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                className="animate-fade-in"
              />
              <path
                d="M15 27L22 34L37 19"
                fill="none"
                stroke="#10B981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="100"
                style={{
                  animation: "checkmark 0.6s ease-out 0.3s forwards",
                  strokeDashoffset: 100,
                }}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Success text */}
      <div className="animate-fade-in-up text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0C1B2A] mb-2">
          Rendez-vous confirmé !
        </h1>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          Votre rendez-vous a bien été enregistré. Vous recevrez une confirmation.
        </p>
      </div>

      {/* Summary card */}
      <div className="animate-fade-in-up w-full max-w-md" style={{ animationDelay: "0.15s" }}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
          {/* Card header with gradient */}
          <div className="bg-gradient-to-r from-[#0066FF] to-[#00B4D8] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm">
                {booking.merchant.businessName[0]}
              </div>
              <div>
                <h2 className="font-bold text-white text-sm">
                  {booking.merchant.businessName}
                </h2>
                <p className="text-xs text-white/70">Réservation confirmée</p>
              </div>
            </div>
          </div>

          {/* Card body */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Briefcase className="h-3.5 w-3.5" />
                Service
              </span>
              <span className="font-semibold text-[#0C1B2A] text-sm">
                {booking.service.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                Date
              </span>
              <span className="font-semibold text-[#0C1B2A] text-sm">
                {formatDate(booking.date)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                Heure
              </span>
              <span className="font-semibold text-[#0C1B2A] text-sm">
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                Duree
              </span>
              <span className="font-semibold text-[#0C1B2A] text-sm">
                {formatDuration(booking.service.duration)}
              </span>
            </div>

            {/* Price */}
            <div className="border-t border-dashed border-gray-200 pt-4 flex items-center justify-between">
              <span className="font-bold text-[#0C1B2A]">Total</span>
              <span className="text-2xl font-black bg-gradient-to-r from-[#0066FF] to-[#00B4D8] bg-clip-text text-transparent">
                {formatPrice(booking.totalPrice)}
              </span>
            </div>

            {/* XP Earned */}
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
          <button className="btn-press w-full inline-flex items-center justify-center gap-2 border-2 border-gray-200 bg-white text-[#0C1B2A] font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm">
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </button>
        </Link>
      </div>
    </div>
  );
}
