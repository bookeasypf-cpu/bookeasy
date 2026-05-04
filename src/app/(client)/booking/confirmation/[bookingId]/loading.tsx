export default function BookingConfirmationLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex flex-col items-center justify-center px-4 py-12 animate-pulse">
      <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 mb-6" />
      <div className="h-7 w-56 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      <div className="h-4 w-72 bg-gray-100 dark:bg-gray-800 rounded mb-8" />
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
