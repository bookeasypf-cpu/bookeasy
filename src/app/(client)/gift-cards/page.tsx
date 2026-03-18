"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Gift, Send, CheckCircle, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import toast from "react-hot-toast";
import QRCode from "qrcode";

const amounts = [
  { value: 2000, label: "2 000 F" },
  { value: 5000, label: "5 000 F" },
  { value: 10000, label: "10 000 F" },
  { value: 20000, label: "20 000 F" },
  { value: 50000, label: "50 000 F" },
];

function GiftCardsContent() {
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code");

  const [tab, setTab] = useState<"buy" | "check">(codeFromUrl ? "check" : "buy");
  const [selectedAmount, setSelectedAmount] = useState<number>(5000);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ code: string; amountXPF: number } | null>(null);
  const [checkCode, setCheckCode] = useState(codeFromUrl || "");
  const [checkResult, setCheckResult] = useState<{
    code: string;
    balanceXPF: number;
    merchantName: string;
    expiresAt: string;
    status: string;
  } | null>(null);
  const [form, setForm] = useState({
    senderName: "",
    senderEmail: "",
    recipientName: "",
    recipientEmail: "",
    message: "",
  });
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-check if code is in URL
  useEffect(() => {
    if (codeFromUrl) {
      handleCheckCode(codeFromUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeFromUrl]);

  // Generate QR code when gift card is created
  useEffect(() => {
    if (sent?.code && qrCanvasRef.current) {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/gift-cards?code=${sent.code}`;
      QRCode.toCanvas(qrCanvasRef.current, url, {
        width: 200,
        margin: 2,
        color: { dark: "#0C1B2A", light: "#FFFFFF" },
      });
      QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: { dark: "#0C1B2A", light: "#FFFFFF" },
      }).then(setQrDataUrl);
    }
  }, [sent]);

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amountXPF: selectedAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent({ code: data.code, amountXPF: data.amountXPF });
        toast.success("Carte cadeau créée !");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Erreur de connexion");
    }
    setSending(false);
  }

  async function handleCheckCode(code: string) {
    if (!code.trim()) return;
    try {
      const res = await fetch(`/api/gift-cards?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (res.ok) {
        setCheckResult(data);
      } else {
        toast.error(data.error);
        setCheckResult(null);
      }
    } catch {
      toast.error("Erreur de connexion");
    }
  }

  function handleCheck() {
    handleCheckCode(checkCode);
  }

  function downloadQR() {
    if (!qrDataUrl || !sent) return;
    const link = document.createElement("a");
    link.download = `carte-cadeau-${sent.code}.png`;
    link.href = qrDataUrl;
    link.click();
  }

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0C1B2A] to-[#132D46] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00B4D8] flex items-center justify-center">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Cartes Cadeaux
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-lg">
            Offrez du bien-être à vos proches. Valable chez tous nos partenaires en Polynésie.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-6 pb-16">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("buy")}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              tab === "buy"
                ? "bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/25"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Gift className="h-4 w-4 inline mr-2" />
            Offrir une carte
          </button>
          <button
            onClick={() => setTab("check")}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              tab === "check"
                ? "bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/25"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Search className="h-4 w-4 inline mr-2" />
            Vérifier mon solde
          </button>
        </div>

        {tab === "buy" && !sent && (
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleBuy} className="space-y-6">
                {/* Montant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choisissez un montant
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {amounts.map((a) => (
                      <button
                        key={a.value}
                        type="button"
                        onClick={() => setSelectedAmount(a.value)}
                        className={`py-3 px-2 rounded-xl text-sm font-bold transition-all ${
                          selectedAmount === a.value
                            ? "bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/25 scale-105"
                            : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-[#0066FF]"
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* De */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">De la part de</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      id="senderName"
                      label="Votre nom"
                      value={form.senderName}
                      onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                      required
                    />
                    <Input
                      id="senderEmail"
                      label="Votre email"
                      type="email"
                      value={form.senderEmail}
                      onChange={(e) => setForm({ ...form, senderEmail: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Pour */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Pour</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      id="recipientName"
                      label="Nom du destinataire"
                      value={form.recipientName}
                      onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                      required
                    />
                    <Input
                      id="recipientEmail"
                      label="Email du destinataire"
                      type="email"
                      value={form.recipientEmail}
                      onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="giftMessage" className="block text-sm font-medium text-gray-700 mb-1">
                    Message (optionnel)
                  </label>
                  <textarea
                    id="giftMessage"
                    placeholder="Un petit mot pour accompagner votre cadeau..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-colors"
                    rows={3}
                    maxLength={500}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white hover:shadow-lg hover:shadow-[#0066FF]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    "Création en cours..."
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Offrir {amounts.find((a) => a.value === selectedAmount)?.label} CFP
                    </>
                  )}
                </button>
              </form>
            </CardContent>
          </Card>
        )}

        {tab === "buy" && sent && (
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-[#0C1B2A] mb-2">Carte cadeau créée !</h2>
              <div className="bg-gray-50 rounded-xl p-4 mb-4 inline-block">
                <p className="text-2xl font-mono font-bold text-[#0066FF] tracking-wider">
                  {sent.code}
                </p>
              </div>
              <p className="text-gray-500 mb-2">
                Montant : <strong>{sent.amountXPF.toLocaleString()} F CFP</strong>
              </p>

              {/* QR Code */}
              <div className="my-6">
                <p className="text-sm text-gray-500 mb-3">Scannez pour vérifier le solde :</p>
                <div className="inline-block bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <canvas ref={qrCanvasRef} />
                </div>
                <div className="mt-3">
                  <button
                    onClick={downloadQR}
                    className="inline-flex items-center gap-2 text-sm text-[#0066FF] hover:underline font-medium"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger le QR code
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-6">
                Le code et le QR code ont été envoyés par email au destinataire. Valable 1 an.
              </p>
              <button
                onClick={() => {
                  setSent(null);
                  setQrDataUrl(null);
                  setForm({ senderName: "", senderEmail: "", recipientName: "", recipientEmail: "", message: "" });
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#0066FF]/10 text-[#0066FF] hover:bg-[#0066FF]/20 transition-colors"
              >
                Offrir une autre carte
              </button>
            </CardContent>
          </Card>
        )}

        {tab === "check" && (
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Vérifier le solde d&apos;une carte cadeau</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: BE-ABCD-1234-EFGH"
                  value={checkCode}
                  onChange={(e) => setCheckCode(e.target.value.toUpperCase())}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-mono tracking-wider focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-colors"
                />
                <button
                  onClick={handleCheck}
                  className="px-5 py-2.5 rounded-xl bg-[#0066FF] text-white font-semibold text-sm hover:bg-[#0052CC] transition-colors"
                >
                  Vérifier
                </button>
              </div>

              {checkResult && (
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#0066FF]/5 to-[#00B4D8]/5 border border-[#0066FF]/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Code</span>
                    <span className="font-mono font-bold text-[#0066FF]">{checkResult.code}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Solde restant</span>
                    <span className="text-xl font-bold text-[#0C1B2A]">{checkResult.balanceXPF.toLocaleString()} F CFP</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Valable chez</span>
                    <span className="text-sm font-medium">{checkResult.merchantName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Expire le</span>
                    <span className="text-sm">{new Date(checkResult.expiresAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

export default function GiftCardsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24 text-gray-400">Chargement...</div>}>
      <GiftCardsContent />
    </Suspense>
  );
}
