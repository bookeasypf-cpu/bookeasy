export default function ReservationLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        <div className="h-10 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
        <div className="h-4 w-full max-w-xl bg-gray-100 dark:bg-gray-800 rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700" />
          ))}
        </div>
      </div>
    </div>
  );
}
