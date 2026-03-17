export default function StoreLoading() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8FAFC' }}>
      {/* Sidebar skeleton */}
      <div className="w-[260px] min-w-[260px] bg-white border-r animate-pulse" style={{ borderColor: '#E5E7EB' }}>
        <div className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div className="h-10 w-10 rounded-xl bg-gray-100" />
        </div>
        <div className="px-4 py-4 space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-9 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
      {/* Main skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-white border-b flex items-center justify-between px-8" style={{ borderColor: '#E5E7EB' }}>
          <div className="h-5 w-28 rounded-lg bg-gray-100 animate-pulse" />
          <div className="h-8 w-24 rounded-xl bg-gray-100 animate-pulse" />
        </div>
        <div className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="h-6 w-40 rounded-lg bg-gray-100 animate-pulse mx-auto mb-2" />
            <div className="h-8 w-56 rounded-lg bg-gray-200 animate-pulse mx-auto mb-10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 rounded-xl bg-white border animate-pulse" style={{ borderColor: '#E5E7EB' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
