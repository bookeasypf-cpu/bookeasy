export default function LoyaltyLoading() {
  return (
    <div className="page-transition animate-pulse">
      <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-32" />
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 h-64" />
    </div>
  );
}
