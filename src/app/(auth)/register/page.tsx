"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { registerUser } from "@/actions/auth";
import { User, Store } from "lucide-react";
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
  const [role, setRole] = useState<"CLIENT" | "MERCHANT">(
    defaultRole === "MERCHANT" ? "MERCHANT" : "CLIENT"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("role", role);

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
      router.push(role === "MERCHANT" ? "/dashboard/profile" : "/");
      router.refresh();
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Cr&eacute;er un compte
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Rejoignez BookEasy gratuitement
        </p>

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
              Je veux r&eacute;server
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
          D&eacute;j&agrave; un compte ?{" "}
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
