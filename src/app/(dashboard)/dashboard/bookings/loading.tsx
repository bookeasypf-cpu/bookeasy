export default function BookingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-600" />
            <div className="flex-1">
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
              <div className="h-3 w-56 bg-gray-100 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-600 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
