"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Copy,
  Check,
  MessageCircle,
  Smartphone,
  Link as LinkIcon,
  Gift,
  Star,
  Trophy,
  UserPlus,
  CalendarCheck,
} from "lucide-react";

interface ReferralData {
  referralCode: string;
  referralLink: string;
  stats: {
    totalReferrals: number;
    activeReferrals: number;
    xpEarned: number;
    nextMilestone: {
      target: number;
      current: number;
      bonus: number;
    } | null;
  };
  referrals: Array<{
    id: string;
    refereeName: string | null;
    refereeEmail: string | null;
    status: string;
    createdAt: string;
  }>;
}

export function ReferralPageClient() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  useEffect(() => {
    fetch("/api/referrals")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const copyToClipboard = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareWhatsApp = () => {
    if (!data) return;
    const text = `Rejoins BookEasy et réserve tes RDV en ligne ! Utilise mon code ${data.referralCode} pour gagner 5 XP 🎁 ${data.referralLink}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const shareSMS = () => {
    if (!data) return;
    const text = `Rejoins BookEasy ! Utilise mon code ${data.referralCode} pour gagner 5 XP : ${data.referralLink}`;
    window.open(`sms:?body=${encodeURIComponent(text)}`, "_blank");
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "REGISTERED":
        return { label: "Inscrit(e)", color: "bg-blue-500/20 text-blue-400" };
      case "FIRST_BOOKING":
        return { label: "1ère réservation faite", color: "bg-green-500/20 text-green-400" };
      case "COMPLETED":
        return { label: "Actif", color: "bg-emerald-500/20 text-emerald-400" };
      default:
        return { label: status, color: "bg-gray-500/20 text-gray-400" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0C1B2A] via-[#132D46] to-[#0C1B2A] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0C1B2A] via-[#132D46] to-[#0C1B2A] flex items-center justify-center">
        <p className="text-white/60">Erreur de chargement</p>
      </div>
    );
  }

  const milestone = data.stats.nextMilestone;
  const progressPercent = milestone
    ? Math.round((milestone.current / milestone.target) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C1B2A] via-[#132D46] to-[#0C1B2A]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 mb-4">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Inviter des amis
          </h1>
          <p className="text-white/60 text-sm sm:text-base">
            Partagez votre code et gagnez des XP pour chaque ami inscrit
          </p>
        </div>

        {/* Referral Code Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <p className="text-white/50 text-xs uppercase tracking-wider mb-3 text-center">
            Votre code de parrainage
          </p>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-white">
              {data.referralCode}
            </span>
            <button
              onClick={() => copyToClipboard(data.referralCode, "code")}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
              title="Copier le code"
            >
              {copied === "code" ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-3 gap-2 text-center mb-6">
            <div className="bg-white/5 rounded-xl p-3">
              <UserPlus className="h-5 w-5 text-blue-400 mx-auto mb-1.5" />
              <p className="text-white/80 text-xs font-medium">Invitez</p>
              <p className="text-white/40 text-[10px]">+5 XP chacun</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <CalendarCheck className="h-5 w-5 text-cyan-400 mx-auto mb-1.5" />
              <p className="text-white/80 text-xs font-medium">1ère résa</p>
              <p className="text-white/40 text-[10px]">+10 XP pour vous</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <Trophy className="h-5 w-5 text-yellow-400 mx-auto mb-1.5" />
              <p className="text-white/80 text-xs font-medium">Paliers</p>
              <p className="text-white/40 text-[10px]">Bonus XP</p>
            </div>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={shareWhatsApp}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 transition-colors group"
            >
              <MessageCircle className="h-6 w-6 text-[#25D366] group-hover:scale-110 transition-transform" />
              <span className="text-[#25D366] text-xs font-medium">WhatsApp</span>
            </button>
            <button
              onClick={shareSMS}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 transition-colors group"
            >
              <Smartphone className="h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-blue-400 text-xs font-medium">SMS</span>
            </button>
            <button
              onClick={() => copyToClipboard(data.referralLink, "link")}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors group"
            >
              {copied === "link" ? (
                <Check className="h-6 w-6 text-green-400" />
              ) : (
                <LinkIcon className="h-6 w-6 text-white/60 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-white/60 text-xs font-medium">
                {copied === "link" ? "Copié !" : "Copier le lien"}
              </span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
            <Users className="h-5 w-5 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {data.stats.totalReferrals}
            </div>
            <p className="text-white/40 text-xs mt-1">Filleuls invités</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
            <Star className="h-5 w-5 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {data.stats.xpEarned}
            </div>
            <p className="text-white/40 text-xs mt-1">XP gagnés</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
            <Trophy className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {milestone ? `${milestone.target}` : "Max"}
            </div>
            <p className="text-white/40 text-xs mt-1">Prochain palier</p>
          </div>
        </div>

        {/* Milestone progress */}
        {milestone && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/70 text-sm font-medium">
                Prochain palier : {milestone.target} filleuls
              </span>
              <span className="text-blue-400 text-sm font-semibold">
                +{milestone.bonus} XP
              </span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-white/40 text-xs mt-2 text-right">
              {milestone.current} / {milestone.target} filleuls
            </p>
          </div>
        )}

        {/* Referrals list */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-blue-400" />
              Mes filleuls
            </h2>
          </div>

          {data.referrals.length === 0 ? (
            <div className="p-8 text-center">
              <UserPlus className="h-10 w-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">
                Aucun filleul pour le moment
              </p>
              <p className="text-white/25 text-xs mt-1">
                Partagez votre code pour commencer !
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {data.referrals.map((referral) => {
                const st = statusLabel(referral.status);
                return (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center text-white/80 text-sm font-semibold shrink-0">
                        {referral.refereeName
                          ? referral.refereeName.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white/90 text-sm font-medium truncate">
                          {referral.refereeName || "Utilisateur"}
                        </p>
                        <p className="text-white/30 text-xs truncate">
                          {new Date(referral.createdAt).toLocaleDateString(
                            "fr-FR",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${st.color}`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
