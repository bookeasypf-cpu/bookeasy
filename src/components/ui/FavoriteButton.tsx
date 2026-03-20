"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface FavoriteButtonProps {
  merchantId: string;
  className?: string;
  size?: "sm" | "md";
}

export function FavoriteButton({ merchantId, className, size = "md" }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if this merchant is favorited
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        if (data.favorites?.includes(merchantId)) {
          setIsFavorited(true);
        }
      })
      .catch(() => {});
  }, [merchantId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId }),
      });

      if (res.status === 401) {
        toast.error("Connectez-vous pour ajouter aux favoris");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setIsFavorited(data.favorited);
      toast.success(data.favorited ? "Ajouté aux favoris" : "Retiré des favoris");
    } catch {
      toast.error("Erreur");
    }
    setLoading(false);
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={cn(
        "group p-2 rounded-full transition-all duration-200 disabled:opacity-50",
        isFavorited
          ? "bg-red-50 hover:bg-red-100"
          : "bg-white/80 hover:bg-white shadow-sm",
        className
      )}
      title={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        className={cn(
          iconSize,
          "transition-all duration-200",
          isFavorited
            ? "fill-red-500 text-red-500 scale-110"
            : "text-gray-400 group-hover:text-red-400 group-hover:scale-110"
        )}
      />
    </button>
  );
}
