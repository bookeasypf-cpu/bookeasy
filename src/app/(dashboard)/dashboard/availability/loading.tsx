export default function AvailabilityLoading() {
  return (
    <div className="page-transition animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-10 flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
