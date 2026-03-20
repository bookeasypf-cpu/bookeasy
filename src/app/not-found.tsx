import Link from "next/link";
import { Home, Search, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C1B2A] to-[#132D46] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] to-[#00B4D8] mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Page introuvable
        </h1>
        <p className="text-white/50 mb-8 max-w-md mx-auto">
          Oups ! La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Home className="h-4 w-4" />
            Accueil
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
          >
            <Search className="h-4 w-4" />
            Rechercher
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            Carte
          </Link>
        </div>
      </div>
    </div>
  );
}
