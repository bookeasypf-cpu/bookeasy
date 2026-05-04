"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, LayoutDashboard, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DASHBOARD-ERROR]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-5">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-[#0C1B2A] dark:text-white mb-2">
        Erreur du tableau de bord
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md text-center mb-6">
        Une erreur est survenue lors du chargement de cette page. Si le problème persiste, contactez le support.
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
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-[#0C1B2A] dark:text-white font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          Tableau de bord
        </Link>
      </div>
    </div>
  );
}
