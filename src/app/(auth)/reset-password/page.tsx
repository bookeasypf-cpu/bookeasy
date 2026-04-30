"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 sm:p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Lien invalide
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
          <Link
            href="/forgot-password"
            className="text-[#0066FF] text-sm font-medium hover:text-[#0052CC]"
          >
            Refaire une demande
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6 sm:p-8">
        {success ? (
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Mot de passe modifié !
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
            </p>
            <Link href="/login">
              <Button className="w-full">Se connecter</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Nouveau mot de passe
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              Choisissez un nouveau mot de passe pour votre compte
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordInput
                id="password"
                name="password"
                label="Nouveau mot de passe"
                placeholder="Minimum 6 caractères"
                minLength={6}
                required
              />
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirmer le mot de passe"
                placeholder="Répétez votre mot de passe"
                minLength={6}
                required
              />
              <Button type="submit" className="w-full" loading={loading}>
                Réinitialiser
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
