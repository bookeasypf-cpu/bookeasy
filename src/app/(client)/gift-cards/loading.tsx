export default function GiftCardsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C1B2A] via-[#132D46] to-[#0C1B2A]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 animate-pulse">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/10 mx-auto mb-4" />
          <div className="h-8 w-48 bg-white/10 rounded-lg mx-auto mb-2" />
          <div className="h-4 w-64 bg-white/5 rounded mx-auto" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 justify-center">
          <div className="h-10 w-28 bg-white/10 rounded-xl" />
          <div className="h-10 w-28 bg-white/5 rounded-xl" />
        </div>

        {/* Amount cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl border border-white/10" />
          ))}
        </div>

        {/* Form fields */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-24 bg-white/10 rounded mb-2" />
              <div className="h-10 bg-white/5 rounded-lg" />
            </div>
          ))}
          <div className="h-12 bg-white/10 rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
}
