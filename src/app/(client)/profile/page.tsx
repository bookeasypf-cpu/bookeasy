"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { User, Mail, Phone, Pencil, Check, X } from "lucide-react";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data.id) {
            setProfile(data);
            setForm({ name: data.name || "", phone: data.phone || "" });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  function startEdit() {
    if (profile) {
      setForm({ name: profile.name || "", phone: profile.phone || "" });
    }
    setEditing(true);
  }

  function cancelEdit() {
    if (profile) {
      setForm({ name: profile.name || "", phone: profile.phone || "" });
    }
    setEditing(false);
  }

  async function handleSave() {
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error("Le nom doit contenir au moins 2 caractères");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setEditing(false);
        toast.success("Profil mis à jour !");
        // Update the session so Header shows new name
        await update({ name: data.name });
      } else {
        toast.error(data.error || "Erreur");
      }
    } catch {
      toast.error("Erreur de connexion");
    }
    setSaving(false);
  }

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0C1B2A] dark:text-white">Mon profil</h1>
        {!editing && (
          <button
            onClick={startEdit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#0066FF] bg-[#0066FF]/5 hover:bg-[#0066FF]/10 rounded-xl transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </button>
        )}
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-6">
          {/* Avatar + Role */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00B4D8] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
              {(profile.name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              {editing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="text-lg font-semibold text-[#0C1B2A] dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-colors w-full"
                  placeholder="Votre nom"
                  autoFocus
                />
              ) : (
                <h2 className="text-lg font-semibold text-[#0C1B2A] dark:text-white">
                  {profile.name || "Utilisateur"}
                </h2>
              )}
              <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0066FF]/10 text-[#0066FF]">
                {profile.role === "MERCHANT" ? "Professionnel" : "Client"}
              </span>
            </div>
          </div>

          {/* Info fields */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-medium">Email</p>
                <p className="text-sm text-[#0C1B2A] dark:text-white">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <Phone className="h-4 w-4 text-gray-400 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-medium">Téléphone</p>
                {editing ? (
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="text-sm text-[#0C1B2A] dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-colors w-full mt-0.5"
                    placeholder="+689 87 00 00 00"
                  />
                ) : (
                  <p className="text-sm text-[#0C1B2A] dark:text-white">
                    {profile.phone || "Non renseigné"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Edit buttons */}
          {editing && (
            <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white hover:shadow-lg hover:shadow-[#0066FF]/25 transition-all disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {saving ? "..." : "Enregistrer"}
              </button>
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Annuler
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
