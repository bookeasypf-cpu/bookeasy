export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded mt-2" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="h-4 w-20 bg-gray-100 dark:bg-gray-700 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
          </div>
        ))}
      </div>

      {/* Today's bookings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
                <div className="h-3 w-24 bg-gray-100 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-600 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
