export default function DrillSessionLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] animate-pulse">
      <div className="h-16 bg-white border-b border-gray-200" />
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-4">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="h-40 bg-white rounded-xl border border-gray-200" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-white rounded-xl border border-gray-200" />
          ))}
        </div>
      </div>
      <div className="h-16 bg-white border-t border-gray-200" />
    </div>
  )
}
