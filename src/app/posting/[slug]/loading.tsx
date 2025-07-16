export default function Loading() {
  return (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      <p className="ml-4 text-lg">Loading content...</p>
    </div>
  )
}