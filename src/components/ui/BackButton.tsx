"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`btn-press inline-flex items-center gap-1.5 glass-dark text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Retour
    </button>
  );
}
