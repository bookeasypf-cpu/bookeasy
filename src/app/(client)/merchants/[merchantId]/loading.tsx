export default function MerchantLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-[#0C1B2A] to-[#003D99] h-64 relative">
        <div className="absolute bottom-6 left-6 right-6">
          <div className="h-8 w-64 bg-white/20 rounded-lg animate-pulse mb-3" />
          <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">
        {/* Tabs skeleton */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>

        {/* Services skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="text-right">
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
