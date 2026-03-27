"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ProBadge } from "@/components/ui/ProBadge";
import { Headphones, Send, CheckCircle, Zap, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function DashboardSupportPage() {
  const [plan, setPlan] = useState<string>("FREE");
  const [isMedical, setIsMedical] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "" });

  useEffect(() => {
    fetch("/api/dashboard/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setPlan(data.plan || "FREE");
          if (data.isMedical) setIsMedical(true);
        }
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;

    setSending(true);
    const res = await fetch("/api/dashboard/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setSent(true);
      toast.success("Message envoyé !");
    } else {
      toast.error(data.error || "Erreur d'envoi");
    }
    setSending(false);
  }

  // Colors
  const btnGradient = isMedical
    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
    : "bg-gradient-to-r from-[#0066FF] to-[#00B4D8]";
  const btnShadow = isMedical
    ? "hover:shadow-emerald-500/25"
    : "hover:shadow-[#0066FF]/25";
  const accentBg = isMedical ? "bg-emerald-500/10" : "bg-[#0066FF]/10";
  const accentText = isMedical ? "text-emerald-600" : "text-[#0066FF]";
  const focusRing = isMedical
    ? "focus:ring-emerald-500/20 focus:border-emerald-500"
    : "focus:ring-[#0066FF]/20 focus:border-[#0066FF]";
  const proGradient = isMedical
    ? "bg-gradient-to-br from-emerald-500 to-teal-500"
    : "bg-gradient-to-br from-[#0066FF] to-[#00B4D8]";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className={`h-8 w-8 border-2 ${isMedical ? "border-emerald-500" : "border-[#0066FF]"} border-t-transparent rounded-full animate-spin`} />
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-[#0C1B2A] dark:text-white">Support</h1>
        {plan === "PRO" && <ProBadge size="md" />}
      </div>

      {/* Priority info */}
      <Card className="rounded-2xl border-0 shadow-sm mb-6 animate-fade-in-up">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              plan === "PRO" ? proGradient : "bg-gray-100"
            }`}>
              <Headphones className={`h-5 w-5 ${plan === "PRO" ? "text-white" : "text-gray-400"}`} />
            </div>
            <div className="flex-1">
              {plan === "PRO" ? (
                <>
                  <p className="font-semibold text-[#0C1B2A] dark:text-white">Support prioritaire activé</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vos demandes sont traitées en priorité. Réponse sous 24h ouvrées.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-[#0C1B2A] dark:text-white">Support standard</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Réponse sous 48-72h. Passez au Pro pour un support prioritaire.</p>
                </>
              )}
            </div>
            {plan !== "PRO" && (
              <Link
                href="/pricing"
                className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg ${btnGradient} text-white hover:shadow-md transition-all shrink-0`}
              >
                <Zap className="h-3 w-3" />
                Pro
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success state */}
      {sent ? (
        <Card className="rounded-2xl border-0 shadow-sm animate-fade-in-up">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-[#0C1B2A] dark:text-white mb-2">Message envoyé !</h2>
            <p className="text-gray-500 mb-6">
              {plan === "PRO"
                ? "Notre équipe va traiter votre demande en priorité. Réponse sous 24h ouvrées."
                : "Notre équipe vous répondra dans les meilleurs délais."}
            </p>
            <button
              onClick={() => {
                setSent(false);
                setForm({ subject: "", message: "" });
              }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl ${accentBg} ${accentText} hover:opacity-80 transition-colors`}
            >
              Envoyer un autre message
            </button>
          </CardContent>
        </Card>
      ) : (
        /* Contact form */
        <Card className="rounded-2xl border-0 shadow-sm animate-fade-in-up">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[#0C1B2A] dark:text-white mb-4">Contactez-nous</h3>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
              <Input
                id="support-subject"
                label="Sujet"
                placeholder="Ex: Problème avec les horaires"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              />
              <div>
                <label
                  htmlFor="support-message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="support-message"
                  placeholder="Décrivez votre problème ou question en détail..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={`block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm resize-none focus:ring-2 ${focusRing} transition-colors`}
                  rows={6}
                  required
                  maxLength={2000}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {form.message.length}/2000
                </p>
              </div>
              <button
                type="submit"
                disabled={sending || !form.subject.trim() || !form.message.trim()}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl ${btnGradient} text-white hover:shadow-lg ${btnShadow} transition-all duration-300 disabled:opacity-50`}
              >
                {sending ? (
                  "Envoi..."
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Envoyer
                  </>
                )}
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* FAQ links */}
      <div className="mt-6 text-center animate-fade-in-up">
        <p className="text-sm text-gray-400">
          Consultez aussi notre{" "}
          <Link href="/pricing" className={`${accentText} hover:underline font-medium`}>
            page tarifs & FAQ
          </Link>
        </p>
      </div>
    </div>
  );
}
