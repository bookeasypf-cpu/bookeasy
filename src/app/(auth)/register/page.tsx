"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Card, CardContent } from "@/components/ui/Card";
import { registerUser } from "@/actions/auth";
import { Store, Gift } from "lucide-react";

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
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const refCodeFromUrl = searchParams.get("ref") || "";
  // /register only creates CLIENT accounts. Pros use /pricing → QuickRegisterForm.
  const role = "CLIENT" as const;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptCgu, setAcceptCgu] = useState(false);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [refCode, setRefCode] = useState(refCodeFromUrl);
  const [showRefInput] = useState(!refCodeFromUrl);
  const [validatingRef, setValidatingRef] = useState(false);

  // Validate referral code
  const validateRefCode = (code: string) => {
    if (!code || code.length < 4) {
      setReferrerName(null);
      return;
    }
    setValidatingRef(true);
    fetch(`/api/referrals/validate?code=${encodeURIComponent(code)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid && data.referrerName) {
          setReferrerName(data.referrerName);
        } else {
          setReferrerName(null);
        }
      })
      .catch(() => setReferrerName(null))
      .finally(() => setValidatingRef(false));
  };

  // Validate on mount if code from URL
  useEffect(() => {
    if (refCodeFromUrl) {
      const id = requestAnimationFrame(() => validateRefCode(refCodeFromUrl));
      return () => cancelAnimationFrame(id);
    }
  }, [refCodeFromUrl]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    if (refCode) {
      formData.set("referralCode", refCode);
    }

    if (!acceptCgu) {
      setError("Vous devez accepter les CGU et la politique de confidentialité");
      setLoading(false);
      return;
    }
    formData.set("acceptCgu", "true");

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
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
      // Reset the onboarding flag so a fresh signup always sees the tutorial,
      // even if the same browser previously dismissed it for another account.
      try {
        localStorage.removeItem("bookeasy-client-onboarding-seen");
      } catch {
        // Private browsing / storage disabled — ignore.
      }
      // Redirect to callbackUrl if available (e.g., booking page), otherwise home
      const redirectUrl = callbackUrl || "/";
      router.push(redirectUrl);
      router.refresh();
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Créer un compte
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Rejoignez BookEasy gratuitement
        </p>

        {/* Referral banner or input */}
        {refCode && referrerName ? (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl text-center">
            <Gift className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-blue-800">
              Vous avez été invité(e) par {referrerName} !
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Inscrivez-vous pour recevoir 2 XP de bienvenue
            </p>
          </div>
        ) : (
          <div className="mb-6">
            {showRefInput ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Code de parrainage <span className="text-gray-400">(optionnel)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={refCode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setRefCode(val);
                    }}
                    onBlur={() => validateRefCode(refCode)}
                    placeholder="Ex: BK-A7X3"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => validateRefCode(refCode)}
                    disabled={validatingRef || !refCode}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {validatingRef ? "..." : "Valider"}
                  </button>
                </div>
                {refCode && !referrerName && !validatingRef && refCode.length >= 4 && (
                  <p className="text-xs text-red-500">Code invalide</p>
                )}
                {referrerName && (
                  <p className="text-xs text-green-600">
                    ✓ Invité(e) par {referrerName} — vous recevrez 2 XP !
                  </p>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Pro link */}
        <div className="mb-6 p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Vous êtes professionnel ?
            </span>
          </div>
          <Link
            href="/pricing"
            className="text-xs font-medium text-[#0066FF] hover:text-[#0052CC]"
          >
            Inscription Pro →
          </Link>
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
            placeholder="Maeva Tetuanui"
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
          <PasswordInput
            id="password"
            name="password"
            label="Mot de passe"
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
          <label className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptCgu}
              onChange={(e) => setAcceptCgu(e.target.checked)}
              required
              className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/40 cursor-pointer"
            />
            <span>
              J&apos;accepte les{" "}
              <Link href="/legal/cgu" target="_blank" className="text-[#0066FF] hover:underline">
                CGU
              </Link>{" "}
              et la{" "}
              <Link
                href="/legal/confidentialite"
                target="_blank"
                className="text-[#0066FF] hover:underline"
              >
                politique de confidentialité
              </Link>
              .
            </span>
          </label>
          <Button type="submit" className="w-full" loading={loading} disabled={!acceptCgu}>
            Créer mon compte
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="text-[#0066FF] font-medium hover:text-[#0052CC]"
          >
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
