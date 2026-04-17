"use client";

import { useState, useEffect, useReducer, useTransition, useOptimistic } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
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
  FileText,
  Star,
  Gift,
  X,
  CreditCard,
  Banknote,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { isMedicalSectorClient } from "@/lib/medical-client";

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
  sector?: { slug: string } | null;
  paymentPolicy?: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface BookingState {
  step: number;
  merchant: Merchant | null;
  selectedService: Service | null;
  selectedDate: string;
  selectedSlot: TimeSlot | null;
  slots: TimeSlot[];
  loadingSlots: boolean;
  notes: string;
  loading: boolean;
  giftCardCode: string;
  giftCardApplied: { code: string; balanceXPF: number } | null;
  checkingGiftCard: boolean;
  paymentMethod: "online" | "on_site";
  processingPayment: boolean;
}

type BookingAction =
  | { type: "SET_STEP"; step: number }
  | { type: "SET_MERCHANT"; merchant: Merchant }
  | { type: "SELECT_SERVICE"; service: Service | null }
  | { type: "SELECT_DATE"; date: string }
  | { type: "SELECT_SLOT"; slot: TimeSlot | null }
  | { type: "SET_SLOTS"; slots: TimeSlot[] }
  | { type: "SET_LOADING_SLOTS"; loading: boolean }
  | { type: "SET_NOTES"; notes: string }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_GIFT_CARD_CODE"; code: string }
  | { type: "APPLY_GIFT_CARD"; data: { code: string; balanceXPF: number } }
  | { type: "REMOVE_GIFT_CARD" }
  | { type: "SET_CHECKING_GIFT_CARD"; checking: boolean }
  | { type: "SET_PAYMENT_METHOD"; method: "online" | "on_site" }
  | { type: "SET_PROCESSING_PAYMENT"; processing: boolean };

const bookingReducer = (state: BookingState, action: BookingAction): BookingState => {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_MERCHANT":
      return { ...state, merchant: action.merchant, loading: false };
    case "SELECT_SERVICE":
      return { ...state, selectedService: action.service };
    case "SELECT_DATE":
      return { ...state, selectedDate: action.date, selectedSlot: null };
    case "SELECT_SLOT":
      return { ...state, selectedSlot: action.slot };
    case "SET_SLOTS":
      return { ...state, slots: action.slots, loadingSlots: false };
    case "SET_LOADING_SLOTS":
      return { ...state, loadingSlots: action.loading };
    case "SET_NOTES":
      return { ...state, notes: action.notes };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_GIFT_CARD_CODE":
      return { ...state, giftCardCode: action.code };
    case "APPLY_GIFT_CARD":
      return { ...state, giftCardApplied: action.data, giftCardCode: "" };
    case "REMOVE_GIFT_CARD":
      return { ...state, giftCardApplied: null, giftCardCode: "" };
    case "SET_CHECKING_GIFT_CARD":
      return { ...state, checkingGiftCard: action.checking };
    case "SET_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.method };
    case "SET_PROCESSING_PAYMENT":
      return { ...state, processingPayment: action.processing };
    default:
      return state;
  }
};

const STEPS = [
  { label: "Service", icon: Briefcase },
  { label: "Date & Heure", icon: Calendar },
  { label: "Confirmation", icon: Check },
];

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const merchantId = params.merchantId as string;
  const preselectedServiceId = searchParams.get("service");

  const [state, dispatch] = useReducer(bookingReducer, {
    step: 1,
    merchant: null,
    selectedService: null,
    selectedDate: "",
    selectedSlot: null,
    slots: [],
    loadingSlots: false,
    notes: "",
    loading: true,
    giftCardCode: "",
    giftCardApplied: null,
    checkingGiftCard: false,
    paymentMethod: "on_site",
    processingPayment: false,
  });

  const [isPending, startTransition] = useTransition();
  const [optimisticSlot, setOptimisticSlot] = useOptimistic(state.selectedSlot);

  // Fetch merchant info
  useEffect(() => {
    fetch(`/api/merchants/${merchantId}`)
      .then((r) => r.json())
      .then((data) => {
        dispatch({ type: "SET_MERCHANT", merchant: data });
        // Auto-select service if passed via URL query param
        if (preselectedServiceId && data?.services) {
          const service = data.services.find((s: Service) => s.id === preselectedServiceId);
          if (service) {
            dispatch({ type: "SELECT_SERVICE", service });
            dispatch({ type: "SET_STEP", step: 2 });
          }
        }
      })
      .catch(() => dispatch({ type: "SET_LOADING", loading: false }));
  }, [merchantId, preselectedServiceId]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (!state.selectedDate || !state.selectedService) return;
    dispatch({ type: "SET_LOADING_SLOTS", loading: true });
    dispatch({ type: "SELECT_SLOT", slot: null });
    fetch(
      `/api/merchants/${merchantId}/availability?date=${state.selectedDate}&serviceId=${state.selectedService.id}`
    )
      .then((r) => r.json())
      .then((data) => {
        dispatch({ type: "SET_SLOTS", slots: data.slots || [] });
      })
      .catch(() => {
        dispatch({ type: "SET_SLOTS", slots: [] });
      });
  }, [state.selectedDate, state.selectedService, merchantId]);

  // Generate next 30 days
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split("T")[0];
  });

  function handleApplyGiftCard() {
    if (!state.giftCardCode.trim()) return;
    startTransition(async () => {
      dispatch({ type: "SET_CHECKING_GIFT_CARD", checking: true });
      try {
        const res = await fetch(`/api/gift-cards?code=${encodeURIComponent(state.giftCardCode)}&merchantId=${merchantId}`);
        const data = await res.json();
        if (res.ok && data.balanceXPF > 0) {
          dispatch({ type: "APPLY_GIFT_CARD", data: { code: data.code, balanceXPF: data.balanceXPF } });
          toast.success(`Carte cadeau appliquée : ${data.balanceXPF.toLocaleString()} F CFP`);
        } else {
          toast.error(data.error || "Carte cadeau invalide");
        }
      } catch {
        toast.error("Erreur de vérification");
      }
      dispatch({ type: "SET_CHECKING_GIFT_CARD", checking: false });
    });
  }

  function handleConfirm() {
    if (!state.selectedService || !state.selectedSlot || !state.selectedDate) return;
    startTransition(async () => {
      const paymentMethod = state.merchant?.paymentPolicy === "ONLINE_ONLY"
        ? "online" as const
        : state.merchant?.paymentPolicy === "FLEXIBLE"
          ? state.paymentMethod
          : undefined;

      const result = await createBooking({
        merchantId,
        serviceId: state.selectedService!.id,
        date: state.selectedDate,
        startTime: state.selectedSlot!.startTime,
        endTime: state.selectedSlot!.endTime,
        notes: state.notes || undefined,
        giftCardCode: state.giftCardApplied?.code || undefined,
        paymentMethod,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.requiresPayment && result.bookingId) {
        dispatch({ type: "SET_PROCESSING_PAYMENT", processing: true });
        try {
          const res = await fetch("/api/payzen/booking-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId: result.bookingId }),
          });
          const data = await res.json();

          if (data.actionUrl && data.fields) {
            // Create and submit hidden form to PayZen
            const form = document.createElement("form");
            form.method = "POST";
            form.action = data.actionUrl;
            for (const [key, value] of Object.entries(data.fields)) {
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = key;
              input.value = value as string;
              form.appendChild(input);
            }
            document.body.appendChild(form);
            form.submit();
            return;
          }
          toast.error(data.error || "Erreur lors de l'initialisation du paiement");
        } catch {
          toast.error("Erreur de connexion au service de paiement");
        }
        dispatch({ type: "SET_PROCESSING_PAYMENT", processing: false });
        return;
      }

      if (result.bookingId) {
        toast.success("Rendez-vous confirmé !");
        router.push(`/booking/confirmation/${result.bookingId}`);
      }
    });
  }

  if (state.loading) {
    return (
      <div className="page-transition flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0066FF]/10 to-[#00B4D8]/10 flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
        <p className="text-sm text-gray-400">Chargement...</p>
      </div>
    );
  }

  if (!state.merchant) {
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
    <div className="page-transition min-h-screen bg-[#F8FAFC] dark:bg-gray-950">
      {/* Top bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="btn-press w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#0C1B2A] dark:hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-[#0C1B2A] dark:text-white truncate">
              Réserver chez {state.merchant?.businessName}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {/* Stepper */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => {
            const StepIcon = s.icon;
            const isCompleted = i + 1 < state.step;
            const isCurrent = i + 1 === state.step;
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
                          : "bg-gray-100 dark:bg-gray-800 text-gray-300"
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
        {state.step === 1 && (
          <div className="animate-fade-in-up">
            <h2 className="text-lg font-bold text-[#0C1B2A] dark:text-white mb-1">
              Choisissez un service
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              Sélectionnez le service qui vous convient
            </p>
            <div className="space-y-3">
              {state.merchant?.services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => dispatch({ type: "SELECT_SERVICE", service })}
                  className={cn(
                    "card-hover w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 bg-white dark:bg-gray-900",
                    state.selectedService?.id === service.id
                      ? "border-[#0066FF] bg-[#0066FF]/[0.03] shadow-lg shadow-blue-500/10"
                      : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#0C1B2A] dark:text-white">
                          {service.name}
                        </h3>
                        {state.selectedService?.id === service.id && (
                          <div className="w-5 h-5 rounded-full bg-[#0066FF] flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {formatDuration(service.duration)}
                        </span>
                        {state.merchant && (!state.merchant.sector ? false : !isMedicalSectorClient(state.merchant.sector.slug)) && (service.xpAmount ?? state.merchant.xpPerBooking) > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded-full">
                            <Star className="h-3 w-3 text-yellow-500" />
                            +{service.xpAmount ?? state.merchant.xpPerBooking} XP
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className={cn(
                        "text-lg font-bold",
                        state.selectedService?.id === service.id ? "text-[#0066FF]" : "text-[#0C1B2A] dark:text-white"
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
                onClick={() => dispatch({ type: "SET_STEP", step: 2 })}
                disabled={!state.selectedService}
                size="lg"
              >
                Continuer
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {state.step === 2 && (
          <div className="animate-fade-in-up">
            <h2 className="text-lg font-bold text-[#0C1B2A] dark:text-white mb-1">
              Choisissez une date et un créneau
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              {state.selectedService && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0066FF]" />
                  {state.selectedService.name} - {formatDuration(state.selectedService.duration)}
                </span>
              )}
            </p>

            {/* Date picker */}
            <div className="mb-6">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-[#0C1B2A] dark:text-white mb-3">
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
                  const isSelected = state.selectedDate === date;
                  const isToday = false; // Tomorrow at minimum
                  return (
                    <button
                      key={date}
                      onClick={() => dispatch({ type: "SELECT_DATE", date })}
                      className={cn(
                        "flex flex-col items-center min-w-[72px] px-3 py-3 rounded-2xl border-2 text-sm transition-all duration-200 shrink-0",
                        isSelected
                          ? "border-[#0066FF] bg-gradient-to-b from-[#0066FF] to-[#0052CC] text-white shadow-lg shadow-blue-500/25"
                          : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-[#0066FF]/30 hover:shadow-md text-gray-600 dark:text-gray-300"
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
                        isSelected ? "text-white" : "text-[#0C1B2A] dark:text-white"
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
            {state.selectedDate && (
              <div className="animate-fade-in">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-[#0C1B2A] dark:text-white mb-3">
                  <Clock className="h-4 w-4 text-[#00B4D8]" />
                  Creneau horaire
                </label>
                {state.loadingSlots ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Spinner className="h-6 w-6" />
                    <p className="text-xs text-gray-400">Recherche des créneaux...</p>
                  </div>
                ) : state.slots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {state.slots.map((slot) => (
                      <button
                        key={slot.startTime}
                        onClick={() => {
                          startTransition(() => {
                            setOptimisticSlot(slot);
                            dispatch({ type: "SELECT_SLOT", slot });
                          });
                        }}
                        className={cn(
                          "py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200",
                          optimisticSlot?.startTime === slot.startTime
                            ? "border-[#0066FF] bg-gradient-to-b from-[#0066FF] to-[#0052CC] text-white shadow-lg shadow-blue-500/25"
                            : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-[#0C1B2A] dark:text-white hover:border-[#0066FF]/30 hover:shadow-md"
                        )}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center">
                    <Clock className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">
                      Aucun créneau disponible pour cette date
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => dispatch({ type: "SET_STEP", step: 1 })}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Retour
              </Button>
              <Button
                variant="gradient"
                onClick={() => dispatch({ type: "SET_STEP", step: 3 })}
                disabled={!optimisticSlot}
                size="lg"
              >
                Continuer
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {state.step === 3 && state.selectedService && optimisticSlot && (
          <div className="animate-fade-in-up">
            <h2 className="text-lg font-bold text-[#0C1B2A] dark:text-white mb-1">
              Confirmez votre rendez-vous
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              Vérifiez les détails avant de confirmer
            </p>

            {/* Summary card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-6">
              {/* Card header */}
              <div className="bg-gradient-to-r from-[#0066FF]/5 to-[#00B4D8]/5 dark:from-[#0066FF]/10 dark:to-[#00B4D8]/10 px-5 py-4 border-b border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00B4D8] flex items-center justify-center text-white font-bold text-sm">
                    {state.merchant?.businessName?.[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0C1B2A] dark:text-white text-sm">
                      {state.merchant?.businessName}
                    </h3>
                    <p className="text-xs text-gray-400">Récapitulatif</p>
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Briefcase className="h-3.5 w-3.5" />
                    Service
                  </span>
                  <span className="font-semibold text-[#0C1B2A] dark:text-white text-sm">
                    {state.selectedService.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    Date
                  </span>
                  <span className="font-semibold text-[#0C1B2A] dark:text-white text-sm">
                    {formatDate(state.selectedDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    Heure
                  </span>
                  <span className="font-semibold text-[#0C1B2A] dark:text-white text-sm">
                    {formatTime(optimisticSlot.startTime)} - {formatTime(optimisticSlot.endTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    Durée
                  </span>
                  <span className="font-semibold text-[#0C1B2A] dark:text-white text-sm">
                    {formatDuration(state.selectedService.duration)}
                  </span>
                </div>

                {/* Price divider */}
                <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
                  <span className="font-bold text-[#0C1B2A] dark:text-white">Total</span>
                  <span className="text-2xl font-black bg-gradient-to-r from-[#0066FF] to-[#00B4D8] bg-clip-text text-transparent">
                    {formatPrice(state.selectedService.price)}
                  </span>
                </div>

                {/* XP Bonus */}
                {(!state.merchant?.sector ? false : !isMedicalSectorClient(state.merchant.sector.slug)) && (state.selectedService.xpAmount ?? state.merchant?.xpPerBooking) > 0 && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl px-4 py-3 flex items-center justify-between border border-yellow-100">
                    <span className="flex items-center gap-2 text-sm font-medium text-yellow-800">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Points fidélité
                    </span>
                    <span className="font-bold text-yellow-700">
                      +{state.selectedService.xpAmount ?? state.merchant?.xpPerBooking} XP
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Gift Card */}
            {(!state.merchant?.sector ? false : !isMedicalSectorClient(state.merchant.sector.slug)) && (
              <div className="mb-6">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-[#0C1B2A] dark:text-white mb-2">
                  <Gift className="h-4 w-4 text-[#0066FF]" />
                  Carte cadeau (optionnel)
                </label>
                {state.giftCardApplied ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl px-4 py-3 flex items-center justify-between border border-green-200">
                    <div>
                      <p className="text-sm font-semibold text-green-800">
                        Carte {state.giftCardApplied.code}
                      </p>
                      <p className="text-xs text-green-600">
                        Solde : {state.giftCardApplied.balanceXPF.toLocaleString()} F CFP
                      </p>
                    </div>
                    <button
                      onClick={() => dispatch({ type: "REMOVE_GIFT_CARD" })}
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
                      value={state.giftCardCode}
                      onChange={(e) => dispatch({ type: "SET_GIFT_CARD_CODE", code: e.target.value.toUpperCase() })}
                      className="flex-1 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-mono tracking-wider text-[#0C1B2A] dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-500 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleApplyGiftCard}
                      disabled={!state.giftCardCode.trim() || state.checkingGiftCard}
                      className="px-4 py-2.5 rounded-xl bg-[#0066FF]/10 text-[#0066FF] font-semibold text-sm hover:bg-[#0066FF]/20 transition-colors disabled:opacity-50"
                    >
                      {state.checkingGiftCard ? "..." : "Appliquer"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Payment method selector */}
            {state.merchant?.paymentPolicy && state.merchant.paymentPolicy !== "NONE" && (
              <div className="mb-6">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-[#0C1B2A] dark:text-white mb-3">
                  <CreditCard className="h-4 w-4 text-[#0066FF]" />
                  Mode de paiement
                </label>
                {state.merchant.paymentPolicy === "ONLINE_ONLY" ? (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-[#0066FF]/20 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0066FF]/10 flex items-center justify-center shrink-0">
                      <CreditCard className="h-5 w-5 text-[#0066FF]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#0C1B2A] dark:text-white">Paiement en ligne requis</p>
                      <p className="text-xs text-gray-500">Ce professionnel exige un paiement en ligne pour confirmer la réservation</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "SET_PAYMENT_METHOD", method: "on_site" })}
                      className={cn(
                        "p-4 rounded-2xl border-2 text-left transition-all duration-200",
                        state.paymentMethod === "on_site"
                          ? "border-[#0066FF] bg-[#0066FF]/[0.03] shadow-lg shadow-blue-500/10"
                          : "border-gray-100 dark:border-gray-700 hover:border-gray-200"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Banknote className={cn("h-5 w-5", state.paymentMethod === "on_site" ? "text-[#0066FF]" : "text-gray-400")} />
                        {state.paymentMethod === "on_site" && (
                          <div className="w-4 h-4 rounded-full bg-[#0066FF] flex items-center justify-center ml-auto">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <p className={cn("font-semibold text-sm", state.paymentMethod === "on_site" ? "text-[#0066FF]" : "text-[#0C1B2A] dark:text-white")}>
                        Sur place
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Espèces ou CB au RDV</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "SET_PAYMENT_METHOD", method: "online" })}
                      className={cn(
                        "p-4 rounded-2xl border-2 text-left transition-all duration-200",
                        state.paymentMethod === "online"
                          ? "border-[#0066FF] bg-[#0066FF]/[0.03] shadow-lg shadow-blue-500/10"
                          : "border-gray-100 dark:border-gray-700 hover:border-gray-200"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <CreditCard className={cn("h-5 w-5", state.paymentMethod === "online" ? "text-[#0066FF]" : "text-gray-400")} />
                        {state.paymentMethod === "online" && (
                          <div className="w-4 h-4 rounded-full bg-[#0066FF] flex items-center justify-center ml-auto">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <p className={cn("font-semibold text-sm", state.paymentMethod === "online" ? "text-[#0066FF]" : "text-[#0C1B2A] dark:text-white")}>
                        En ligne
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Payer maintenant par CB</p>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="mb-6">
              <label
                htmlFor="notes"
                className="flex items-center gap-1.5 text-sm font-semibold text-[#0C1B2A] dark:text-white mb-2"
              >
                <FileText className="h-4 w-4 text-gray-400" />
                Notes (optionnel)
              </label>
              <textarea
                id="notes"
                value={state.notes}
                onChange={(e) => dispatch({ type: "SET_NOTES", notes: e.target.value })}
                placeholder="Des précisions pour votre rendez-vous..."
                className="w-full rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#0C1B2A] dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-500 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10 resize-none transition-all"
                rows={3}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => dispatch({ type: "SET_STEP", step: 2 })}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Retour
              </Button>
              <Button
                variant="gradient"
                onClick={handleConfirm}
                loading={isPending || state.processingPayment}
                size="lg"
              >
                {state.processingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Redirection vers le paiement...
                  </>
                ) : (state.merchant?.paymentPolicy === "ONLINE_ONLY" || (state.merchant?.paymentPolicy === "FLEXIBLE" && state.paymentMethod === "online")) ? (
                  <>
                    <CreditCard className="h-4 w-4 mr-1.5" />
                    Payer et confirmer
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1.5" />
                    Confirmer la réservation
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
