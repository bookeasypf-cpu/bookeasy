export default function MapLoading() {
  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-900 flex items-center justify-center animate-pulse">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 mx-auto mb-3" />
        <div className="h-4 w-40 bg-gray-300 dark:bg-gray-700 rounded mx-auto" />
      </div>
    </div>
  );
}
