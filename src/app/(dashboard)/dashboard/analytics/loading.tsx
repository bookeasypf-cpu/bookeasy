export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-700 rounded mb-3" />
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-600 rounded" />
          </div>
        ))}
      </div>
      {/* Chart placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
        <div className="h-64 bg-gray-50 dark:bg-gray-700/50 rounded-xl" />
      </div>
    </div>
  );
}
