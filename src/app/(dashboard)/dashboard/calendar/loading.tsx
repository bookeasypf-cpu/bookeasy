export default function CalendarLoading() {
  return (
    <div className="page-transition animate-pulse">
      <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-7 gap-2 mb-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-6 bg-gray-100 dark:bg-gray-700 rounded" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-50 dark:bg-gray-700/50 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
