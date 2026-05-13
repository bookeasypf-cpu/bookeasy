"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { Card, CardContent } from "@/components/ui/Card";
import { Mail, Phone, Pencil, Check, X, Upload, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

// Compress image before upload. Always resolves (never hangs):
// returns the original file on any failure so the upload still goes through.
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    // Skip compression for small files (<800KB) and unsupported formats
    // that the canvas API can't decode (e.g. HEIC from iPhone).
    const isCanvasFriendly = /image\/(jpeg|jpg|png|webp|gif)/i.test(file.type);
    if (!isCanvasFriendly || file.size < 800 * 1024) {
      resolve(file);
      return;
    }

    // Hard timeout: never hang the upload flow more than 10s on compression.
    const timeoutId = setTimeout(() => resolve(file), 10000);
    const done = (blob: Blob) => {
      clearTimeout(timeoutId);
      resolve(blob);
    };

    const reader = new FileReader();
    reader.onerror = () => done(file);
    reader.onload = (event) => {
      const src = event.target?.result as string | undefined;
      if (!src) return done(file);

      const img = document.createElement("img") as HTMLImageElement;
      img.onerror = () => done(file);
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          if (width > 2000 || height > 2000) {
            const ratio = Math.min(2000 / width, 2000 / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return done(file);
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => done(blob || file),
            "image/jpeg",
            0.7
          );
        } catch {
          done(file);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  image: string | null;
}

export default function ProfilePage() {
  const { status, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>("");
  const [form, setForm] = useState({ name: "", phone: "", image: "" });
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

    // Check original file size (will be compressed)
    const MAX_ORIGINAL_SIZE = 20 * 1024 * 1024; // 20 MB original, will be compressed
    if (file.size > MAX_ORIGINAL_SIZE) {
      toast.error(`L'image est trop grosse (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: 20 MB`);
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
    setUploadStep("Compression de l'image...");
    try {
      // Compress image before uploading
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name, {
        type: "image/jpeg",
      });

      setUploadStep("Upload en cours...");

      // Client-direct upload to Vercel Blob (bypasses Next.js 4.5MB limit)
      let imageUrl: string;
      try {
        const blob = await upload(compressedFile.name, compressedFile, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        imageUrl = blob.url;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        toast.error(`Erreur d'upload : ${message}`);
        setLocalImagePreview(null);
        setUploading(false);
        setUploadStep("");
        return;
      }

      // Auto-save to profile
      setUploadStep("Sauvegarde en cours...");
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
        toast.error("Erreur de sauvegarde");
        setLocalImagePreview(null);
        setUploading(false);
        setUploadStep("");
        return;
      }

      setProfile(savedData);
      setForm({ ...form, image: savedData.image });
      setLocalImagePreview(null);
      setUploadStep("Actualisation en cours...");
      toast.success("Photo mise à jour !");

      // Wait for DB to commit, then reload
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.location.href = window.location.pathname;
    } catch {
      toast.error("Erreur de connexion");
      setLocalImagePreview(null);
      setUploading(false);
      setUploadStep("");
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

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (res.ok) {
        toast.success("Compte supprimé");
        await signOut({ callbackUrl: "/" });
      } else {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la suppression");
      }
    } catch {
      toast.error("Erreur de connexion");
    }
    setDeleting(false);
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={displayImage}
                    alt={profile.name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <div className="text-white text-xs font-medium text-center px-1">
                        {uploadStep}
                      </div>
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

      {/* RGPD — Export des données */}
      <Card className="rounded-2xl border-0 shadow-sm mt-6">
        <CardContent className="py-5">
          <h3 className="text-sm font-semibold text-[#0C1B2A] dark:text-white mb-2">Vos données personnelles</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Conformément au RGPD, vous pouvez télécharger l&apos;ensemble de vos données.
          </p>
          <a
            href="/api/profile/export"
            download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-[#0C1B2A] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Télécharger mes données
          </a>
        </CardContent>
      </Card>

      {/* RGPD — Suppression du compte */}
      <Card className="rounded-2xl border-0 shadow-sm mt-6 border-red-200 dark:border-red-900/30">
        <CardContent className="py-5">
          <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Supprimer mon compte</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Cette action est irréversible. Toutes vos données (réservations, avis, favoris, points XP) seront définitivement supprimées.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer mon compte
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Êtes-vous sûr ? Cette action ne peut pas être annulée.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "Suppression..." : "Oui, supprimer définitivement"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
