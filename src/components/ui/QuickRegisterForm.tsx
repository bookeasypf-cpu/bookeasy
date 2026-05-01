"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Mail } from "lucide-react";
import toast from "react-hot-toast";

export function QuickRegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/quick-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan: "free" }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        toast.success("Compte créé !");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Erreur de connexion");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
        <h3 className="font-bold text-[#0C1B2A] mb-2">Compte créé !</h3>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
          <Mail className="h-4 w-4" />
          <p>Vos identifiants ont été envoyés à <strong className="text-[#0C1B2A]">{form.email}</strong></p>
        </div>
        <p className="text-xs text-gray-400 mb-4">Consultez votre boîte mail (vérifiez les spams) puis connectez-vous.</p>
        <a
          href="/login"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#0066FF] text-white hover:bg-[#0052CC] transition-colors"
        >
          Se connecter <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Nom de votre commerce"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-colors"
      />
      <input
        type="email"
        placeholder="Email professionnel"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-colors"
      />
      <input
        type="tel"
        placeholder="Téléphone (optionnel)"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white hover:shadow-lg hover:shadow-[#0066FF]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? "Création..." : (
          <>
            Créer mon compte en 30s
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
