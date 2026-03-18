"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { createBooking } from "@/actions/booking";
import {
  formatPrice,
  formatDuration,
  formatDate,
  formatTime,
  cn,
} from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Check,
  ArrowLeft,
  Briefcase,
  User,
  MapPin,
  FileText,
  Star,
  Gift,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  xpAmount: number | null;
}

interface Merchant {
  id: string;
  businessName: string;
  services: Service[];
  xpPerBooking: number;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

const STEPS = [
  { label: "Service", icon: Briefcase },
  { label: "Date & Heure", icon: Calendar },
  { label: "Confirmation", icon: Check },
];

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const merchantId = params.merchantId as string;

  const [step, setStep] = useState(1);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardApplied, setGiftCardApplied] = useState<{
    code: string;
    balanceXPF: number;
  } | null>(null);
  const [checkingGiftCard, setCheckingGiftCard] = useState(false);

  // Fetch merchant info
  useEffect(() => {
    fetch(`/api/merchants/${merchantId}`)
      .then((r) => r.json())
      .then((data) => {
        setMerchant(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [merchantId]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    fetch(
      `/api/merchants/${merchantId}/availability?date=${selectedDate}&serviceId=${selectedService.id}`
    )
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots || []);
        setLoadingSlots(false);
      })
      .catch(() => setLoadingSlots(false));
  }, [selectedDate, selectedService, merchantId]);

  // Generate next 30 days
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split("T")[0];
  });

  async function handleApplyGiftCard() {
    if (!giftCardCode.trim()) return;
    setCheckingGiftCard(true);
    try {
      const res = await fetch(`/api/gift-cards?code=${encodeURIComponent(giftCardCode)}`);
      const data = await res.json();
      if (res.ok && data.balanceXPF > 0) {
        setGiftCardApplied({ code: data.code, balanceXPF: data.balanceXPF });
        toast.success(`Carte cadeau appliquée : ${data.balanceXPF.toLocaleString()} F CFP`);
      } else {
        toast.error(data.error || "Carte cadeau invalide");
      }
    } catch {
      toast.error("Erreur de vérification");
    }
    setCheckingGiftCard(false);
  }

  async function handleConfirm() {
    if (!selectedService || !selectedSlot || !selectedDate) return;
    setSubmitting(true);

    const result = await createBooking({
      merchantId,
      serviceId: selectedService.id,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      notes: notes || undefined,
      giftCardCode: giftCardApplied?.code || undefined,
    });

    if (result.error) {
      toast.error(result.error);
      setSubmitting(false);
    } else if (result.bookingId) {
      toast.success("Rendez-vous confirmé !");
      router.push(`/booking/confirmation/${result.bookingId}`);
    }
  }

  if (loading) {
    return (
      <div className="page-transition flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0066FF]/10 to-[#00B4D8]/10 flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
        <p className="text-sm text-gray-400">Chargement...</p>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="page-transition flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-16 h-16 rounded-2xl bg-[#FF6B6B]/10 flex items-center justify-center">
          <User className="h-8 w-8 text-[#FF6B6B]/40" />
        </div>
        <p className="text-gray-500 font-medium">Professionnel introuvable</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-[#0066FF] hover:underline"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="page-transition min-h-screen bg-[#F8FAFC]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="btn-press w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#0C1B2A] transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-[#0C1B2A] truncate">
              Reserver chez {merchant.businessName}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {/* Stepper */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => {
            const StepIcon = s.icon;
            const isCompleted = i + 1 < step;
            const isCurrent = i + 1 === step;
            return (
              <div key={s.label} className="flex items-center flex-1 last:flex-initial">
                <div className="flex items-center gap-2.5">
                  {/* Step circle */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                      isCompleted
                        ? "bg-gradient-to-br from-[#0066FF] to-[#00B4D8] text-white shadow-lg shadow-blue-500/25"
                        : isCurrent
                          ? "bg-[#0066FF]/10 text-[#0066FF] ring-2 ring-[#0066FF] ring-offset-2"
                          : "bg-gray-100 text-gray-300"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  {/* Step label */}
                  <span
                    className={cn(
                      "text-xs font-semibold hidden sm:block transition-colors",
                      isCurrent
                        ? "text-[#0066FF]"
                        : isCompleted
                          ? "text-[#0C1B2A]"
                          : "text-gray-300"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {/* Connecting line */}
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mx-3 h-0.5 rounded-full overflow-hidden bg-gray-100">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isCompleted
                          ? "w-full bg-gradient-to-r from-[#0066FF] to-[#00B4D8]"
                          : "w-0"
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Select service */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <h2 className="text-lg font-bold text-[#0C1B2A] mb-1">
              Choisissez un service
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              Selectionnez le service qui vous convient
            </p>
            <div className="space-y-3">
              {merchant.services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={cn(
                    "card-hover w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 bg-white",
                    selectedService?.id === service.id
                      ? "border-[#0066FF] bg-[#0066FF]/[0.03] shadow-lg shadow-blue-500/10"
                      : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#0C1B2A]">
                          {service.name}
                        </h3>
                        {selectedService?.id === service.id && (
                          <div className="w-5 h-5 rounded-full bg-[#0066FF] flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {formatDuration(service.duration)}
                        </span>
                        {(service.xpAmount ?? merchant.xpPerBooking) > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded-full">
                            <Star className="h-3 w-3 text-yellow-500" />
                            +{service.xpAmount ?? merchant.xpPerBooking} XP
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className={cn(
                        "text-lg font-bold",
                        selectedService?.id === service.id ? "text-[#0066FF]" : "text-[#0C1B2A]"
                      )}>
                        {formatPrice(service.price)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <Button
                variant="gradient"
                onClick={() => setStep(2)}
                disabled={!selectedService}
                size="lg"
              >
                Continuer
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <h2 className="text-lg font-bold text-[#0C1B2A] mb-1">
              Choisissez une date et un creneau
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              {selectedService && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0066FF]" />
                  {selectedService.name} - {formatDuration(selectedService.duration)}
                </span>
              )}
            </p>

            {/* Date picker */}
            <div className="mb-6">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-[#0C1B2A] mb-3">
                <Calendar className="h-4 w-4 text-[#0066FF]" />
                Date
              </label>
              <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                {dates.map((date) => {
                  const d = new Date(date + "T00:00:00");
                  const dayName = d.toLocaleDateString("fr-FR", {
                    weekday: "short",
                  });
                  const dayNum = d.getDate();
                  const monthName = d.toLocaleDateString("fr-FR", {
                    month: "short",
                  });
                  const isSelected = selectedDate === date;
                  const isToday = false; // Tomorrow at minimum
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "flex flex-col items-center min-w-[72px] px-3 py-3 rounded-2xl border-2 text-sm transition-all duration-200 shrink-0",
                        isSelected
                          ? "border-[#0066FF] bg-gradient-to-b from-[#0066FF] to-[#0052CC] text-white shadow-lg shadow-blue-500/25"
                          : "border-gray-100 bg-white hover:border-[#0066FF]/30 hover:shadow-md text-gray-600"
                      )}
                    >
                      <span className={cn(
                        "text-[10px] uppercase font-semibold tracking-wider",
                        isSelected ? "text-white/70" : "text-gray-400"
                      )}>
                        {dayName}
                      </span>
                      <span className={cn(
                        "text-xl font-bold mt-0.5",
                        isSelected ? "text-white" : "text-[#0C1B2A]"
                      )}>
                        {dayNum}
                      </span>
                      <span className={cn(
                        "text-[10px] uppercase font-medium",
                        isSelected ? "text-white/70" : "text-gray-400"
                      )}>
                        {monthName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="animate-fade-in">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-[#0C1B2A] mb-3">
                  <Clock className="h-4 w-4 text-[#00B4D8]" />
                  Creneau horaire
                </label>
                {loadingSlots ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Spinner className="h-6 w-6" />
                    <p className="text-xs text-gray-400">Recherche des creneaux...</p>
                  </div>
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.startTime}
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          "py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200",
                          selectedSlot?.startTime === slot.startTime
                            ? "border-[#0066FF] bg-gradient-to-b from-[#0066FF] to-[#0052CC] text-white shadow-lg shadow-blue-500/25"
                            : "border-gray-100 bg-white text-[#0C1B2A] hover:border-[#0066FF]/30 hover:shadow-md"
                        )}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <Clock className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">
                      Aucun creneau disponible pour cette date
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Retour
              </Button>
              <Button
                variant="gradient"
                onClick={() => setStep(3)}
                disabled={!selectedSlot}
                size="lg"
              >
                Continuer
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && selectedService && selectedSlot && (
          <div className="animate-fade-in-up">
            <h2 className="text-lg font-bold text-[#0C1B2A] mb-1">
              Confirmez votre rendez-vous
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              Verifiez les details avant de confirmer
            </p>

            {/* Summary card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
              {/* Card header */}
              <div className="bg-gradient-to-r from-[#0066FF]/5 to-[#00B4D8]/5 px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00B4D8] flex items-center justify-center text-white font-bold text-sm">
                    {merchant.businessName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0C1B2A] text-sm">
                      {merchant.businessName}
                    </h3>
                    <p className="text-xs text-gray-400">Recapitulatif</p>
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
                    {selectedService.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Date
                  </span>
                  <span className="font-semibold text-[#0C1B2A] text-sm">
                    {formatDate(selectedDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    Heure
                  </span>
                  <span className="font-semibold text-[#0C1B2A] text-sm">
                    {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    Duree
                  </span>
                  <span className="font-semibold text-[#0C1B2A] text-sm">
                    {formatDuration(selectedService.duration)}
                  </span>
                </div>

                {/* Price divider */}
                <div className="border-t border-dashed border-gray-200 pt-4 flex items-center justify-between">
                  <span className="font-bold text-[#0C1B2A]">Total</span>
                  <span className="text-2xl font-black bg-gradient-to-r from-[#0066FF] to-[#00B4D8] bg-clip-text text-transparent">
                    {formatPrice(selectedService.price)}
                  </span>
                </div>

                {/* XP Bonus */}
                {(selectedService.xpAmount ?? merchant.xpPerBooking) > 0 && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl px-4 py-3 flex items-center justify-between border border-yellow-100">
                    <span className="flex items-center gap-2 text-sm font-medium text-yellow-800">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Points fidélité
                    </span>
                    <span className="font-bold text-yellow-700">
                      +{selectedService.xpAmount ?? merchant.xpPerBooking} XP
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Gift Card */}
            <div className="mb-6">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-[#0C1B2A] mb-2">
                <Gift className="h-4 w-4 text-[#0066FF]" />
                Carte cadeau (optionnel)
              </label>
              {giftCardApplied ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl px-4 py-3 flex items-center justify-between border border-green-200">
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      Carte {giftCardApplied.code}
                    </p>
                    <p className="text-xs text-green-600">
                      Solde : {giftCardApplied.balanceXPF.toLocaleString()} F CFP
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setGiftCardApplied(null);
                      setGiftCardCode("");
                    }}
                    className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: BE-ABCD-1234-EFGH"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                    className="flex-1 rounded-xl border-2 border-gray-100 bg-white px-4 py-2.5 text-sm font-mono tracking-wider text-[#0C1B2A] placeholder:text-gray-300 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleApplyGiftCard}
                    disabled={!giftCardCode.trim() || checkingGiftCard}
                    className="px-4 py-2.5 rounded-xl bg-[#0066FF]/10 text-[#0066FF] font-semibold text-sm hover:bg-[#0066FF]/20 transition-colors disabled:opacity-50"
                  >
                    {checkingGiftCard ? "..." : "Appliquer"}
                  </button>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label
                htmlFor="notes"
                className="flex items-center gap-1.5 text-sm font-semibold text-[#0C1B2A] mb-2"
              >
                <FileText className="h-4 w-4 text-gray-400" />
                Notes (optionnel)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Des précisions pour votre rendez-vous..."
                className="w-full rounded-2xl border-2 border-gray-100 bg-white px-4 py-3 text-sm text-[#0C1B2A] placeholder:text-gray-300 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10 resize-none transition-all"
                rows={3}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Retour
              </Button>
              <Button
                variant="gradient"
                onClick={handleConfirm}
                loading={submitting}
                size="lg"
              >
                <Check className="h-4 w-4 mr-1.5" />
                Confirmer la reservation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
