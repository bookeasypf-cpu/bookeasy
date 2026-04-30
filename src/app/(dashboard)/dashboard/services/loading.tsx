export default function ServicesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="h-5 w-36 bg-gray-200 dark:bg-gray-600 rounded" />
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-600 rounded" />
            </div>
            <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded mb-2" />
            <div className="flex items-center gap-4 mt-3">
              <div className="h-4 w-16 bg-gray-100 dark:bg-gray-700 rounded" />
              <div className="h-4 w-16 bg-gray-100 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
