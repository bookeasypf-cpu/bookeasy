"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { User, Mail, Phone, Pencil, Check, X, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  image: string | null;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", image: "" });
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);

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
            setForm({ name: data.name || "", phone: data.phone || "", image: data.image || "" });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  function startEdit() {
    if (profile) {
      setForm({ name: profile.name || "", phone: profile.phone || "", image: profile.image || "" });
      setLocalImagePreview(null);
    }
    setEditing(true);
  }

  function cancelEdit() {
    if (profile) {
      setForm({ name: profile.name || "", phone: profile.phone || "", image: profile.image || "" });
      setLocalImagePreview(null);
    }
    setEditing(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = event.target?.result as string;
      setLocalImagePreview(preview);
    };
    reader.readAsDataURL(file);

    // Start upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      console.log("1. Uploading file...", file.name, file.size, file.type);

      console.log("2. Starting fetch to /api/upload");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      console.log("3. Fetch completed, status:", res.status, res.ok);

      console.log("4. Parsing JSON response...");
      const data = await res.json();
      console.log("5. JSON parsed:", data);

      if (!res.ok) {
        console.error("Upload failed:", res.status, data);
        toast.error(data.error || "Erreur d'upload");
        setLocalImagePreview(null);
        setUploading(false);
        return;
      }

      console.log("6. Upload successful, URL:", data.url);
      const imageUrl = data.url;

      // Auto-save to profile immediately after upload
      console.log("Saving to profile...");
      const saveRes = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          image: imageUrl,
        }),
      });

      const savedData = await saveRes.json();

      if (!saveRes.ok) {
        console.error("Profile save failed:", saveRes.status, savedData);
        toast.error("Erreur de sauvegarde");
        setLocalImagePreview(null);
        setUploading(false);
        return;
      }

      console.log("Profile saved successfully:", savedData);
      setProfile(savedData);
      setForm({ ...form, image: savedData.image });
      setLocalImagePreview(null);
      toast.success("Photo mise à jour !");

      // Wait for DB to commit, then reload
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.location.href = window.location.pathname;
    } catch (error) {
      console.error("Upload/save error:", error);
      toast.error("Erreur de connexion");
      setLocalImagePreview(null);
      setUploading(false);
    }
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
        body: JSON.stringify({ name: form.name, phone: form.phone, image: form.image }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setEditing(false);
        setLocalImagePreview(null);
        toast.success("Profil mis à jour !");
        // Update the session so Header shows new name
        await update({ name: data.name, image: data.image });
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

  const displayImage = localImagePreview || form.image || profile.image;

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
            <div className="relative">
              {displayImage ? (
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/20">
                  <img
                    src={displayImage}
                    alt={profile.name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00B4D8] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
                  {(profile.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
              {editing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-6 h-6 bg-[#0066FF] text-white rounded-full flex items-center justify-center hover:bg-[#0052CC] transition-colors shadow-md disabled:opacity-60"
                  title="Changer la photo"
                >
                  {uploading ? (
                    <div className="h-3.5 w-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
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
