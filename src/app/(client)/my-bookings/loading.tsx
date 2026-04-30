export default function MyBookingsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C1B2A] via-[#132D46] to-[#0C1B2A]">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 animate-pulse">
        <div className="h-8 w-48 bg-white/10 rounded-lg mb-8" />

        {/* Upcoming section */}
        <div className="h-5 w-36 bg-white/10 rounded mb-4" />
        <div className="space-y-3 mb-10">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10" />
                <div className="flex-1">
                  <div className="h-5 w-40 bg-white/10 rounded mb-2" />
                  <div className="h-3 w-56 bg-white/5 rounded" />
                </div>
                <div className="h-6 w-24 bg-white/10 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Past section */}
        <div className="h-5 w-32 bg-white/10 rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10" />
                <div className="flex-1">
                  <div className="h-5 w-36 bg-white/10 rounded mb-2" />
                  <div className="h-3 w-48 bg-white/5 rounded" />
                </div>
                <div className="h-6 w-20 bg-white/10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
