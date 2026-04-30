export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C1B2A] via-[#132D46] to-[#0C1B2A]">
      <div className="max-w-lg mx-auto px-4 py-8 sm:py-12 animate-pulse">
        <div className="h-8 w-32 bg-white/10 rounded-lg mb-8" />
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-white/10" />
          </div>
          {/* Fields */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 w-16 bg-white/10 rounded mb-2" />
                <div className="h-10 bg-white/5 rounded-lg border border-white/10" />
              </div>
            ))}
          </div>
          <div className="h-12 bg-white/10 rounded-xl mt-6" />
        </div>
      </div>
    </div>
  );
}
