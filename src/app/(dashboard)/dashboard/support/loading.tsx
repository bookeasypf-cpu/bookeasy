export default function SupportLoading() {
  return (
    <div className="page-transition animate-pulse">
      <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 max-w-2xl">
        <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg" />
        <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg" />
        <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  );
}
