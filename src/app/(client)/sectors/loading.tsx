export default function SectorsLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-pulse">
        <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-32 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700" />
          ))}
        </div>
      </div>
    </div>
  );
}
