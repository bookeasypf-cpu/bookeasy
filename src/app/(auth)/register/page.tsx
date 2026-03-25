"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { registerUser } from "@/actions/auth";
import { User, Store, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "CLIENT";
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const refCode = searchParams.get("ref") || "";
  const [role, setRole] = useState<"CLIENT" | "MERCHANT">(
    defaultRole === "MERCHANT" ? "MERCHANT" : "CLIENT"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [referrerName, setReferrerName] = useState<string | null>(null);

  // Validate referral code and get referrer name
  useEffect(() => {
    if (refCode) {
      fetch(`/api/referrals/validate?code=${encodeURIComponent(refCode)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.valid && data.referrerName) {
            setReferrerName(data.referrerName);
          }
        })
        .catch(() => {});
    }
  }, [refCode]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("role", role);
    if (refCode) {
      formData.set("referralCode", refCode);
    }

    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Auto sign-in after registration
    const signInResult = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (signInResult?.error) {
      router.push("/login");
    } else {
      // Redirect to callbackUrl if available (e.g., booking page), otherwise role-based default
      const redirectUrl = callbackUrl || (role === "MERCHANT" ? "/dashboard/profile" : "/");
      router.push(redirectUrl);
      router.refresh();
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Créer un compte
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Rejoignez BookEasy gratuitement
        </p>

        {/* Referral banner */}
        {refCode && referrerName && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl text-center">
            <Gift className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-blue-800">
              Vous avez été invité(e) par {referrerName} !
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Inscrivez-vous pour recevoir 5 XP de bienvenue
            </p>
          </div>
        )}

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("CLIENT")}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              role === "CLIENT"
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <User
              className={cn(
                "h-6 w-6",
                role === "CLIENT" ? "text-indigo-600" : "text-gray-400"
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                role === "CLIENT" ? "text-indigo-700" : "text-gray-600"
              )}
            >
              Client
            </span>
            <span className="text-xs text-gray-400">
              Je veux réserver
            </span>
          </button>
          <button
            type="button"
            onClick={() => setRole("MERCHANT")}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              role === "MERCHANT"
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <Store
              className={cn(
                "h-6 w-6",
                role === "MERCHANT" ? "text-indigo-600" : "text-gray-400"
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                role === "MERCHANT" ? "text-indigo-700" : "text-gray-600"
              )}
            >
              Professionnel
            </span>
            <span className="text-xs text-gray-400">
              Je propose des services
            </span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            name="name"
            label="Nom complet"
            placeholder="Jean Dupont"
            required
          />
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="votre@email.com"
            required
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Mot de passe"
            placeholder="Minimum 6 caractères"
            minLength={6}
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            {role === "MERCHANT"
              ? "Créer mon compte pro"
              : "Créer mon compte"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="text-indigo-600 font-medium hover:text-indigo-500"
          >
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
