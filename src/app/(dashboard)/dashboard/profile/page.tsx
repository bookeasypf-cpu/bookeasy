"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ProBadge } from "@/components/ui/ProBadge";
import {
  BadgeCheck,
  Zap,
  Camera,
  Upload,
  X,
  Plus,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { PushNotificationToggle } from "@/components/ui/PushNotificationToggle";
import { UpgradeButton } from "@/components/ui/UpgradeButton";
import Image from "next/image";

interface Sector {
  id: string;
  name: string;
}

interface MerchantPhoto {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
}

export default function DashboardProfilePage() {
  const router = useRouter();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [plan, setPlan] = useState<string>("FREE");
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [isMedical, setIsMedical] = useState(false);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [form, setForm] = useState({
    businessName: "",
    description: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    sectorId: "",
  });

  // Photo state
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<MerchantPhoto[]>([]);
  const [coverUploading, setCoverUploading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [coverDragOver, setCoverDragOver] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Load profile data
  useEffect(() => {
    fetch("/api/dashboard/profile")
      .then((r) => r.json())
      .then((profile) => {
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
          setPlanExpiresAt(profile.planExpiresAt || null);
          setIsMedical(profile.isMedical || false);
          setMerchantId(profile.id || null);

          const medicalParam = profile.isMedical ? "?medical=true" : "";
          return fetch(`/api/sectors${medicalParam}`).then((r) => r.json());
        }
        return fetch("/api/sectors").then((r) => r.json());
      })
      .then((sectorsData) => {
        setSectors(sectorsData || []);
        setInitialLoading(false);
      });
  }, []);

  // Load photos
  useEffect(() => {
    fetch("/api/dashboard/photos")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setCoverImage(data.coverImage || null);
          setPhotos(data.photos || []);
        }
      });
  }, []);

  // Upload helper
  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data.error) {
      toast.error(data.error);
      return null;
    }
    return data.url;
  }

  // Cover image upload
  async function handleCoverUpload(file: File) {
    setCoverUploading(true);
    const url = await uploadFile(file);
    if (url) {
      const res = await fetch("/api/dashboard/photos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImage: url }),
      });
      const data = await res.json();
      if (!data.error) {
        setCoverImage(url);
        toast.success("Photo de couverture mise à jour !");
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    }
    setCoverUploading(false);
  }

  // Remove cover image
  async function handleRemoveCover() {
    const res = await fetch("/api/dashboard/photos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverImage: null }),
    });
    const data = await res.json();
    if (!data.error) {
      setCoverImage(null);
      toast.success("Photo de couverture supprimee !");
    }
  }

  // Gallery photo upload
  async function handlePhotoUpload(file: File) {
    setPhotoUploading(true);
    const url = await uploadFile(file);
    if (url) {
      const res = await fetch("/api/dashboard/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!data.error) {
        setPhotos((prev) => [...prev, data]);
        toast.success("Photo ajoutee !");
      } else {
        toast.error("Erreur lors de l'ajout");
      }
    }
    setPhotoUploading(false);
  }

  // Remove gallery photo
  async function handleRemovePhoto(photoId: string) {
    const res = await fetch(`/api/dashboard/photos?id=${photoId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      toast.success("Photo supprimee !");
    } else {
      toast.error("Erreur lors de la suppression");
    }
  }

  // Drag & drop handlers for cover
  const handleCoverDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setCoverDragOver(true);
    },
    []
  );

  const handleCoverDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setCoverDragOver(false);
    },
    []
  );

  const handleCoverDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setCoverDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        handleCoverUpload(file);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // File input handlers
  function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleCoverUpload(file);
    e.target.value = "";
  }

  function handlePhotoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handlePhotoUpload(file);
    e.target.value = "";
  }

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
      toast.success("Profil mis a jour !");
      router.refresh();
    }
    setLoading(false);
  }

  const accentGradient = isMedical
    ? "from-emerald-500 to-teal-500"
    : "from-[#0066FF] to-[#00B4D8]";

  const accentShadow = isMedical
    ? "hover:shadow-emerald-500/25"
    : "hover:shadow-[#0066FF]/25";

  const accentRing = isMedical
    ? "ring-emerald-500/30"
    : "ring-[#0066FF]/30";

  const accentBg = isMedical
    ? "bg-emerald-50"
    : "bg-blue-50";

  const accentText = isMedical
    ? "text-emerald-600"
    : "text-[#0066FF]";

  const accentBorder = isMedical
    ? "border-emerald-300"
    : "border-[#0066FF]/30";

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-[#0C1B2A]">
          {isMedical ? "Mon cabinet" : "Mon commerce"}
        </h1>
        {merchantId && (
          <a
            href={`/merchants/${merchantId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 hover:shadow-md ${accentBorder} ${accentText} ${accentBg}`}
          >
            <ExternalLink className="h-4 w-4" />
            Voir ma vitrine
          </a>
        )}
      </div>

      {/* Cover Image Section */}
      <Card className="rounded-2xl border-0 shadow-sm mb-6 animate-fade-in-up overflow-hidden">
        <div
          className={`relative w-full h-48 sm:h-56 md:h-64 cursor-pointer group transition-all duration-200 ${
            coverDragOver ? `ring-4 ${accentRing}` : ""
          }`}
          onClick={() => coverInputRef.current?.click()}
          onDragOver={handleCoverDragOver}
          onDragLeave={handleCoverDragLeave}
          onDrop={handleCoverDrop}
        >
          {coverImage ? (
            <>
              <Image
                src={coverImage}
                alt="Photo de couverture"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />
            </>
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${accentGradient} opacity-10`}
            />
          )}

          {/* Upload overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {coverUploading ? (
              <Spinner className="h-8 w-8 text-white" />
            ) : (
              <>
                <div
                  className={`w-14 h-14 rounded-2xl bg-white/90 backdrop-blur flex items-center justify-center mb-2 shadow-lg`}
                >
                  <Camera className={`h-6 w-6 ${accentText}`} />
                </div>
                <p className={`text-sm font-medium ${coverImage ? "text-white" : "text-gray-600"}`}>
                  {coverImage
                    ? "Cliquez ou glissez pour changer"
                    : "Ajouter une photo de couverture"}
                </p>
              </>
            )}
          </div>

          {/* Placeholder when no cover */}
          {!coverImage && !coverUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className={`w-16 h-16 rounded-2xl ${accentBg} flex items-center justify-center mb-3`}
              >
                <ImageIcon className={`h-8 w-8 ${accentText} opacity-60`} />
              </div>
              <p className="text-sm text-gray-400 font-medium">
                Photo de couverture
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Cliquez ou glissez-deposez une image
              </p>
            </div>
          )}

          {/* Remove button */}
          {coverImage && !coverUploading && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveCover();
              }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-red-500 text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Uploading spinner overlay */}
          {coverUploading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <Spinner className="h-8 w-8" />
            </div>
          )}

          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleCoverFileChange}
          />
        </div>
      </Card>

      {/* Gallery Section */}
      <Card className="rounded-2xl border-0 shadow-sm mb-6 animate-fade-in-up">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-[#0C1B2A]">Galerie photos</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Ajoutez des photos pour mettre en valeur votre{" "}
                {isMedical ? "cabinet" : "commerce"}
              </p>
            </div>
            <span className="text-xs text-gray-400">{photos.length} photo{photos.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100"
              >
                <Image
                  src={photo.url}
                  alt={photo.caption || "Photo"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-red-500 text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {/* Add photo button */}
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={photoUploading}
              className={`aspect-square rounded-xl border-2 border-dashed ${accentBorder} flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:shadow-md ${accentBg} hover:${accentBg} group`}
            >
              {photoUploading ? (
                <Spinner className="h-6 w-6" />
              ) : (
                <>
                  <div
                    className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm`}
                  >
                    <Plus className={`h-5 w-5 ${accentText}`} />
                  </div>
                  <span className={`text-xs font-medium ${accentText}`}>
                    Ajouter
                  </span>
                </>
              )}
            </button>
          </div>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoFileChange}
          />
        </CardContent>
      </Card>

      {/* Subscription Status Card */}
      <Card className="rounded-2xl border-0 shadow-sm mb-6 animate-fade-in-up">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  plan === "PRO"
                    ? `bg-gradient-to-br ${accentGradient}`
                    : "bg-gray-100"
                }`}
              >
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
                    ? isMedical
                      ? "Consultations illimitees, badge Pro verifie, mise en avant dans les recherches"
                      : "Services illimites, badge Pro verifie, mise en avant dans les recherches"
                    : isMedical
                    ? "1 type de consultation, fonctionnalites de base"
                    : "1 service, fonctionnalites de base"}
                </p>
              </div>
            </div>
            {plan === "PRO" ? (
              <div className="text-right shrink-0">
                {planExpiresAt && (
                  <p className="text-xs text-gray-400">
                    Valide jusqu&apos;au{" "}
                    {new Date(planExpiresAt).toLocaleDateString("fr-FR")}
                  </p>
                )}
                <UpgradeButton className="!w-auto mt-1" />
              </div>
            ) : (
              <UpgradeButton className="!w-auto" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="rounded-2xl border-0 shadow-sm mb-6 animate-fade-in-up">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#0C1B2A]">
                Notifications push
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {isMedical
                  ? "Recevez des alertes instantanees pour les nouvelles prises de rendez-vous"
                  : "Recevez des alertes instantanees pour les nouvelles reservations"}
              </p>
            </div>
            <PushNotificationToggle />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            <Input
              id="businessName"
              label={isMedical ? "Nom du cabinet" : "Nom du commerce"}
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
                {isMedical ? "Specialite" : "Secteur"}
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
                <option value="">
                  {isMedical
                    ? "Choisir une specialite"
                    : "Choisir un secteur"}
                </option>
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
                placeholder={
                  isMedical
                    ? "Decrivez votre pratique, vos specialites..."
                    : "Decrivez votre activite..."
                }
              />
            </div>
            <Input
              id="phone"
              label="Telephone"
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
              className={`inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-xl text-white hover:shadow-lg transition-all duration-300 disabled:opacity-50 bg-gradient-to-r ${accentGradient} ${accentShadow}`}
            >
              {loading ? "..." : "Enregistrer"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
