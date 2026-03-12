"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import {
  Star,
  Plus,
  Pencil,
  Trash2,
  Gift,
  TrendingUp,
  Users,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";

interface Reward {
  id: string;
  name: string;
  description: string | null;
  xpCost: number;
  type: string;
  value: number | null;
  isActive: boolean;
  maxUses: number | null;
  usedCount: number;
  _count: { redemptions: number };
}

interface XpSettings {
  xpPerBooking: number;
  activeRewards: number;
  totalTransactions: number;
  totalXpDistributed: number;
  totalRedemptions: number;
}

export default function DashboardLoyaltyPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [settings, setSettings] = useState<XpSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [xpPerBooking, setXpPerBooking] = useState("10");
  const [savingSettings, setSavingSettings] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    xpCost: "50",
    type: "DISCOUNT",
    value: "10",
  });

  async function fetchData() {
    const [rewardsRes, settingsRes] = await Promise.all([
      fetch("/api/dashboard/xp-rewards"),
      fetch("/api/dashboard/xp-settings"),
    ]);
    const rewardsData = await rewardsRes.json();
    const settingsData = await settingsRes.json();

    if (Array.isArray(rewardsData)) setRewards(rewardsData);
    if (settingsData.xpPerBooking !== undefined) {
      setSettings(settingsData);
      setXpPerBooking(String(settingsData.xpPerBooking));
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function resetForm() {
    setForm({
      name: "",
      description: "",
      xpCost: "50",
      type: "DISCOUNT",
      value: "10",
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(reward: Reward) {
    setForm({
      name: reward.name,
      description: reward.description || "",
      xpCost: String(reward.xpCost),
      type: reward.type,
      value: String(reward.value || ""),
    });
    setEditingId(reward.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name,
      description: form.description || null,
      xpCost: Number(form.xpCost),
      type: form.type,
      value: form.value ? Number(form.value) : null,
    };

    const url = editingId
      ? `/api/dashboard/xp-rewards?id=${editingId}`
      : "/api/dashboard/xp-rewards";

    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(
        editingId ? "Récompense modifiée" : "Récompense créée"
      );
      resetForm();
      fetchData();
    } else {
      const data = await res.json();
      toast.error(data.error || "Erreur");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette récompense ?")) return;
    const res = await fetch(`/api/dashboard/xp-rewards?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Récompense supprimée");
      fetchData();
    }
  }

  async function handleToggle(reward: Reward) {
    await fetch(`/api/dashboard/xp-rewards?id=${reward.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...reward, isActive: !reward.isActive }),
    });
    toast.success(
      reward.isActive ? "Récompense désactivée" : "Récompense activée"
    );
    fetchData();
  }

  async function saveXpSettings() {
    setSavingSettings(true);
    const res = await fetch("/api/dashboard/xp-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xpPerBooking: Number(xpPerBooking) }),
    });
    if (res.ok) {
      toast.success("Paramètres XP mis à jour");
      fetchData();
    } else {
      const data = await res.json();
      toast.error(data.error || "Erreur");
    }
    setSavingSettings(false);
  }

  const typeLabels: Record<string, string> = {
    DISCOUNT: "Réduction (%)",
    FREE_SERVICE: "Prestation gratuite",
    GIFT: "Cadeau",
  };

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
        <div>
          <h1 className="text-2xl font-bold text-[#0C1B2A] animate-fade-in-up">
            Programme Fidélité XP
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Récompensez vos clients fidèles avec des points XP
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white hover:shadow-lg hover:shadow-[#0066FF]/25 transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Nouvelle récompense
        </button>
      </div>

      {/* Stats */}
      {settings && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 stagger-children">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="py-4 text-center">
              <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#0C1B2A]">
                {settings.xpPerBooking}
              </p>
              <p className="text-xs text-gray-500">XP / réservation</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="py-4 text-center">
              <TrendingUp className="h-5 w-5 text-[#0066FF] mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#0C1B2A]">
                {settings.totalXpDistributed}
              </p>
              <p className="text-xs text-gray-500">XP distribués</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="py-4 text-center">
              <Gift className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#0C1B2A]">
                {settings.activeRewards}
              </p>
              <p className="text-xs text-gray-500">Récompenses actives</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="py-4 text-center">
              <Users className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#0C1B2A]">
                {settings.totalRedemptions}
              </p>
              <p className="text-xs text-gray-500">Échanges effectués</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* XP Settings */}
      <Card className="rounded-2xl border-0 shadow-sm mb-6 animate-fade-in-up">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-[#0C1B2A]">Paramètres XP</h3>
          </div>
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                XP gagnés par réservation
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={xpPerBooking}
                onChange={(e) => setXpPerBooking(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-colors"
              />
            </div>
            <button
              onClick={saveXpSettings}
              disabled={savingSettings}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {savingSettings ? "..." : "Enregistrer"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Chaque client gagnera ce nombre d&apos;XP à chaque réservation
            confirmée. En cas d&apos;annulation, les XP sont automatiquement
            révoqués.
          </p>
        </CardContent>
      </Card>

      {/* Reward Form */}
      {showForm && (
        <Card className="mb-6 rounded-2xl border-0 shadow-sm animate-fade-in-up">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[#0C1B2A] mb-4">
              {editingId
                ? "Modifier la récompense"
                : "Nouvelle récompense"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="reward-name"
                label="Nom de la récompense"
                placeholder="ex: 10% de réduction, Coupe gratuite..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                id="reward-desc"
                label="Description (optionnel)"
                placeholder="Détails sur la récompense..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Input
                  id="reward-xp"
                  label="Coût en XP"
                  type="number"
                  min="1"
                  value={form.xpCost}
                  onChange={(e) =>
                    setForm({ ...form, xpCost: e.target.value })
                  }
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value })
                    }
                    className="block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-colors"
                  >
                    <option value="DISCOUNT">Réduction (%)</option>
                    <option value="FREE_SERVICE">Prestation gratuite</option>
                    <option value="GIFT">Cadeau</option>
                  </select>
                </div>
                {form.type === "DISCOUNT" && (
                  <Input
                    id="reward-value"
                    label="Valeur (%)"
                    type="number"
                    min="1"
                    max="100"
                    value={form.value}
                    onChange={(e) =>
                      setForm({ ...form, value: e.target.value })
                    }
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white hover:shadow-lg hover:shadow-[#0066FF]/25 transition-all duration-300 disabled:opacity-50"
                >
                  {saving
                    ? "..."
                    : editingId
                      ? "Modifier"
                      : "Créer la récompense"}
                </button>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Rewards List */}
      <div className="space-y-3 stagger-children">
        {rewards.map((reward) => (
          <Card
            key={reward.id}
            className={`rounded-2xl card-hover border-0 shadow-sm ${!reward.isActive ? "opacity-60" : ""}`}
          >
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-400/20 flex items-center justify-center">
                  <Gift className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[#0C1B2A]">
                      {reward.name}
                    </h3>
                    {!reward.isActive && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Désactivée
                      </span>
                    )}
                  </div>
                  {reward.description && (
                    <p className="text-sm text-gray-500">
                      {reward.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">
                      {typeLabels[reward.type] || reward.type}
                      {reward.type === "DISCOUNT" && reward.value
                        ? ` (${reward.value}%)`
                        : ""}
                    </span>
                    <span className="text-xs text-gray-400">
                      {reward._count.redemptions} échange
                      {reward._count.redemptions !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="font-bold text-[#0066FF]">
                    {reward.xpCost} XP
                  </span>
                </div>
                <button
                  onClick={() => handleToggle(reward)}
                  className={`p-2 rounded-lg transition-colors ${
                    reward.isActive
                      ? "text-green-500 hover:bg-green-50"
                      : "text-gray-400 hover:bg-gray-50"
                  }`}
                  title={
                    reward.isActive ? "Désactiver" : "Activer"
                  }
                >
                  <Star className="h-4 w-4" />
                </button>
                <button
                  onClick={() => startEdit(reward)}
                  className="p-2 text-gray-400 hover:text-[#0066FF] hover:bg-[#0066FF]/5 rounded-lg transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(reward.id)}
                  className="p-2 text-gray-400 hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/5 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        {rewards.length === 0 && (
          <div className="text-center py-12">
            <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">Aucune récompense créée</p>
            <p className="text-sm text-gray-400">
              Créez votre première récompense pour fidéliser vos clients !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
