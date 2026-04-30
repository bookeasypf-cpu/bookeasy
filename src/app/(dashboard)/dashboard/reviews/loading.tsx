export default function ReviewsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600" />
              <div>
                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-600 rounded mb-1" />
                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
