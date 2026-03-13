import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Number */}
        <div className="mb-6">
          <span className="text-8xl sm:text-9xl font-black bg-gradient-to-r from-[#0066FF] to-[#00B4D8] bg-clip-text text-transparent">
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-[#0C1B2A] mb-3">
          Page introuvable
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all text-sm"
          >
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 bg-white text-[#0C1B2A] font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
          >
            <Search className="h-4 w-4" />
            Rechercher
          </Link>
        </div>
      </div>
    </div>
  );
}
