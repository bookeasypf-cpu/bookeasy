export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header skeleton */}
      <div className="bg-gradient-to-br from-[#0C1B2A] via-[#0C1B2A] to-[#003D99]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-10">
          <div className="h-12 bg-white/10 rounded-xl animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4">
        {/* Results header skeleton */}
        <div className="bg-white rounded-2xl shadow-lg px-5 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-10 w-28 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
                <div className="flex-1">
                  <div className="h-5 w-36 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-2" />
              <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse mb-4" />
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
