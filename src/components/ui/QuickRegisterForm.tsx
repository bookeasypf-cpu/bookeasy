"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export function QuickRegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptCgu, setAcceptCgu] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!acceptCgu) {
      toast.error("Vous devez accepter les CGU et la politique de confidentialité");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/quick-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          plan: "free",
          acceptCgu: true,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'inscription");
        setLoading(false);
        return;
      }

      // Auto sign-in with the password the user just chose, then push to
      // the merchant dashboard. No email check, no "forgot password" detour.
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Compte créé mais connexion automatique impossible. Connectez-vous manuellement.");
        router.push("/login");
        return;
      }

      toast.success("Bienvenue sur BookEasy Pro !");
      router.push("/dashboard/profile");
      router.refresh();
    } catch {
      toast.error("Erreur de connexion");
      setLoading(false);
    }
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
      <input
        type="password"
        placeholder="Mot de passe (min. 6 caractères)"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        minLength={6}
        autoComplete="new-password"
        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-colors"
      />
      <input
        type="password"
        placeholder="Confirmer le mot de passe"
        value={form.confirmPassword}
        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        required
        minLength={6}
        autoComplete="new-password"
        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-colors"
      />
      <label className="flex items-start gap-2 text-xs text-gray-300 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={acceptCgu}
          onChange={(e) => setAcceptCgu(e.target.checked)}
          required
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/40 cursor-pointer"
        />
        <span>
          J&apos;accepte les{" "}
          <a href="/legal/cgu" target="_blank" rel="noopener" className="text-[#0066FF] hover:underline">
            CGU
          </a>{" "}
          et la{" "}
          <a
            href="/legal/confidentialite"
            target="_blank"
            rel="noopener"
            className="text-[#0066FF] hover:underline"
          >
            politique de confidentialité
          </a>
          .
        </span>
      </label>
      <button
        type="submit"
        disabled={loading || !acceptCgu}
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
