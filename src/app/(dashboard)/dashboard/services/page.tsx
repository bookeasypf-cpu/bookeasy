"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { formatPrice, formatDuration } from "@/lib/utils";
import { Plus, Pencil, Trash2, Clock, Star } from "lucide-react";
import toast from "react-hot-toast";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  xpAmount: number | null;
  isActive: boolean;
}

export default function DashboardServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMedical, setIsMedical] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: "30",
    price: "0",
    xpAmount: "",
  });

  useEffect(() => {
    fetch("/api/dashboard/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data?.isMedical) setIsMedical(true);
      })
      .catch(() => {});
  }, []);

  async function fetchServices() {
    const res = await fetch("/api/dashboard/services");
    const data = await res.json();
    setServices(data || []);
    setLoading(false);
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => fetchServices());
    return () => cancelAnimationFrame(id);
  }, []);

  function resetForm() {
    setForm({ name: "", description: "", duration: "30", price: "0", xpAmount: "" });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(service: Service) {
    setForm({
      name: service.name,
      description: service.description || "",
      duration: String(service.duration),
      price: String(service.price),
      xpAmount: service.xpAmount ? String(service.xpAmount) : "",
    });
    setEditingId(service.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description || null,
      duration: Number(form.duration),
      price: Number(form.price),
      xpAmount: form.xpAmount ? Number(form.xpAmount) : null,
    };
    const url = editingId
      ? `/api/dashboard/services?id=${editingId}`
      : "/api/dashboard/services";
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success(
        editingId
          ? isMedical ? "Consultation modifiée" : "Service modifié"
          : isMedical ? "Consultation ajoutée" : "Service ajouté"
      );
      resetForm();
      fetchServices();
    } else {
      toast.error("Erreur");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(isMedical ? "Supprimer cette consultation ?" : "Supprimer ce service ?")) return;
    const res = await fetch(`/api/dashboard/services?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success(isMedical ? "Consultation supprimée" : "Service supprimé");
      fetchServices();
    }
  }

  // Colors
  const btnGradient = isMedical
    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
    : "bg-gradient-to-r from-[#0066FF] to-[#00B4D8]";
  const btnShadow = isMedical
    ? "hover:shadow-emerald-500/25"
    : "hover:shadow-[#0066FF]/25";
  const accentText = isMedical ? "text-emerald-600" : "text-[#0066FF]";
  const focusRing = isMedical
    ? "focus:ring-emerald-500/20 focus:border-emerald-500"
    : "focus:ring-[#0066FF]/20 focus:border-[#0066FF]";
  const hoverAccent = isMedical
    ? "hover:text-emerald-600 hover:bg-emerald-50"
    : "hover:text-[#0066FF] hover:bg-[#0066FF]/5";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0C1B2A] dark:text-white animate-fade-in-up">
          {isMedical ? "Consultations" : "Services"}
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className={`inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl ${btnGradient} text-white hover:shadow-lg ${btnShadow} transition-all duration-300`}
        >
          <Plus className="h-4 w-4 mr-1.5" /> Ajouter
        </button>
      </div>

      {showForm && (
        <Card className="mb-6 rounded-2xl border-0 shadow-sm animate-fade-in-up">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[#0C1B2A] dark:text-white mb-4">
              {editingId
                ? isMedical ? "Modifier la consultation" : "Modifier le service"
                : isMedical ? "Nouvelle consultation" : "Nouveau service"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="svc-name"
                label="Nom"
                placeholder={isMedical ? "ex: Consultation générale, Suivi..." : "ex: Coupe homme, Brushing..."}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                id="svc-desc"
                label="Description (optionnel)"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <div className={`grid ${isMedical ? "grid-cols-2" : "grid-cols-3"} gap-4`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Durée (min)
                  </label>
                  <select
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                    className={`block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm focus:ring-2 ${focusRing} transition-colors`}
                  >
                    {[15, 20, 30, 45, 60, 75, 90, 120, 150, 180, 240].map(
                      (d) => (
                        <option key={d} value={d}>
                          {formatDuration(d)}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <Input
                  id="svc-price"
                  label={isMedical ? "Tarif (F CFP)" : "Prix (F CFP)"}
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
                {!isMedical && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      XP gagnés
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      placeholder="Défaut"
                      value={form.xpAmount}
                      onChange={(e) =>
                        setForm({ ...form, xpAmount: e.target.value })
                      }
                      className={`block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm focus:ring-2 ${focusRing} transition-colors placeholder:text-gray-300`}
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Vide = défaut ({`paramètres XP`})
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className={`inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl ${btnGradient} text-white hover:shadow-lg ${btnShadow} transition-all duration-300 disabled:opacity-50`}
                >
                  {saving ? "..." : editingId ? "Modifier" : "Ajouter"}
                </button>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3 stagger-children">
        {services.map((service) => (
          <Card key={service.id} className="rounded-2xl card-hover border-0 shadow-sm">
            <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-medium text-[#0C1B2A] dark:text-white">{service.name}</h3>
                {service.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{service.description}</p>
                )}
                <span className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(service.duration)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {!isMedical && service.xpAmount && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 text-yellow-500" />
                    {service.xpAmount} XP
                  </span>
                )}
                <span className={`font-semibold ${accentText}`}>
                  {formatPrice(service.price)}
                </span>
                <button
                  onClick={() => startEdit(service)}
                  className={`p-2 text-gray-400 ${hoverAccent} rounded-lg transition-colors`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="p-2 text-gray-400 hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/5 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        {services.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            {isMedical
              ? "Aucune consultation. Ajoutez votre première consultation !"
              : "Aucun service. Ajoutez votre premier service !"}
          </p>
        )}
      </div>
    </div>
  );
}
