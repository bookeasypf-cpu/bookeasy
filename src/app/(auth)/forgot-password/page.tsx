"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Une erreur est survenue");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6 sm:p-8">
        {sent ? (
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4">
              <Mail className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email envoyé !
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Si un compte existe avec l&apos;adresse <strong className="text-gray-700 dark:text-gray-300">{email}</strong>,
              vous recevrez un lien de réinitialisation dans quelques minutes.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
              Pensez à vérifier vos spams si vous ne trouvez pas l&apos;email.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#0066FF] text-sm font-medium hover:text-[#0052CC]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Mot de passe oublié
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" loading={loading}>
                Envoyer le lien
              </Button>
            </form>

            <p className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#0066FF]"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
