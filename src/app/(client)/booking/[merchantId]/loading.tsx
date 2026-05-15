export default function BookingLoading() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-3" />
          <div className="h-8 w-2/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>

        {/* Steps skeleton */}
        <div className="flex items-center gap-3 mb-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
              {i < 2 && <div className="h-px w-12 bg-gray-200 dark:bg-gray-800" />}
            </div>
          ))}
        </div>

        {/* Card skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-md shadow-gray-200/40 dark:shadow-none p-6 space-y-4">
          <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
