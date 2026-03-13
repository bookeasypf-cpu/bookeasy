"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ProBadge } from "@/components/ui/ProBadge";
import { BadgeCheck, Zap, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Sector {
  id: string;
  name: string;
}

export default function DashboardProfilePage() {
  const router = useRouter();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [plan, setPlan] = useState<string>("FREE");
  const [form, setForm] = useState({
    businessName: "",
    description: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    sectorId: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/profile").then((r) => r.json()),
      fetch("/api/sectors").then((r) => r.json()),
    ]).then(([profile, sectorsData]) => {
      if (profile && !profile.error) {
        setForm({
          businessName: profile.businessName || "",
          description: profile.description || "",
          phone: profile.phone || "",
          address: profile.address || "",
          city: profile.city || "",
          postalCode: profile.postalCode || "",
          sectorId: profile.sectorId || "",
        });
        setPlan(profile.plan || "FREE");
      }
      setSectors(sectorsData || []);
      setInitialLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/dashboard/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.error) {
      toast.error(data.error);
    } else {
      toast.success("Profil mis à jour !");
      router.refresh();
    }
    setLoading(false);
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="page-transition">
      <h1 className="text-2xl font-bold text-[#0C1B2A] mb-6 animate-fade-in-up">Mon commerce</h1>

      {/* Subscription Status Card */}
      <Card className="rounded-2xl border-0 shadow-sm mb-6 animate-fade-in-up">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                plan === "PRO"
                  ? "bg-gradient-to-br from-[#0066FF] to-[#00B4D8]"
                  : "bg-gray-100"
              }`}>
                {plan === "PRO" ? (
                  <BadgeCheck className="h-6 w-6 text-white" />
                ) : (
                  <Zap className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#0C1B2A]">
                    Plan {plan === "PRO" ? "Pro" : "Gratuit"}
                  </h3>
                  {plan === "PRO" && <ProBadge size="sm" />}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {plan === "PRO"
                    ? "Services illimités, badge Pro vérifié, mise en avant dans les recherches"
                    : "Jusqu'à 5 services, fonctionnalités de base"}
                </p>
              </div>
            </div>
            {plan !== "PRO" && (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white hover:shadow-lg hover:shadow-[#0066FF]/25 transition-all shrink-0"
              >
                Passer au Pro
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            <Input
              id="businessName"
              label="Nom du commerce"
              value={form.businessName}
              onChange={(e) =>
                setForm({ ...form, businessName: e.target.value })
              }
              required
            />
            <div>
              <label
                htmlFor="sectorId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Secteur
              </label>
              <select
                id="sectorId"
                value={form.sectorId}
                onChange={(e) =>
                  setForm({ ...form, sectorId: e.target.value })
                }
                className="block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-colors"
                required
              >
                <option value="">Choisir un secteur</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-colors"
                rows={4}
              />
            </div>
            <Input
              id="phone"
              label="Téléphone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              id="address"
              label="Adresse"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="city"
                label="Ville"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <Input
                id="postalCode"
                label="Code postal"
                value={form.postalCode}
                onChange={(e) =>
                  setForm({ ...form, postalCode: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white hover:shadow-lg hover:shadow-[#0066FF]/25 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "..." : "Enregistrer"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
