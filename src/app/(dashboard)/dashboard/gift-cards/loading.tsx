export default function DashboardGiftCardsLoading() {
  return (
    <div className="page-transition animate-pulse">
      <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700" />
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-50 dark:bg-gray-700/50 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
