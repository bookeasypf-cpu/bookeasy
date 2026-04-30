export default function FavoritesLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-pulse">
        <div className="h-8 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-600" />
                <div className="flex-1">
                  <div className="h-5 w-36 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
                  <div className="h-3 w-20 bg-gray-100 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
