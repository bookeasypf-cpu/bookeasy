export default function ProfileLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gray-200 dark:bg-gray-600" />
          <div>
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-20 bg-gray-100 dark:bg-gray-700 rounded mb-2" />
              <div className="h-10 w-full bg-gray-100 dark:bg-gray-700 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
