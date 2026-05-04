"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CLIENT-ERROR]", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 bg-[#F8FAFC] dark:bg-gray-950">
      <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-5">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-[#0C1B2A] dark:text-white mb-2">
        Une erreur est survenue
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md text-center mb-6">
        Désolé, quelque chose ne s&apos;est pas passé comme prévu. Vous pouvez réessayer ou revenir à l&apos;accueil.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0066FF] text-white font-semibold text-sm hover:bg-[#0052CC] transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-[#0C1B2A] dark:text-white font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Home className="h-4 w-4" />
          Accueil
        </Link>
      </div>
    </div>
  );
}
