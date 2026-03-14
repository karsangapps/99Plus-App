export default function DiagnosisLoading() {
  return (
    <div className="lg:ml-64 min-h-screen bg-[#F8FAFC] pb-20 animate-pulse">
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-gray-200 rounded" />
          <div className="h-7 w-72 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-48 bg-gray-200 rounded" />
      </div>
      <div className="px-8 py-8 space-y-8">
        {/* Row 1 */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-5 bg-white rounded-xl border border-gray-200 h-72" />
          <div className="col-span-7 grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 h-32" />
            ))}
          </div>
        </div>
        {/* Leak banner */}
        <div className="h-28 rounded-xl bg-red-100" />
        {/* Heatmap */}
        <div className="h-64 bg-white rounded-xl border border-gray-200" />
        {/* Bottom row */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-7 bg-white rounded-xl border border-gray-200 h-72" />
          <div className="col-span-5 bg-white rounded-xl border border-gray-200 h-72" />
        </div>
      </div>
    </div>
  )
}
