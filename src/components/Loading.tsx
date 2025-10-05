export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-lg text-gray-600 font-medium">Loading events...</p>
    </div>
  );
}