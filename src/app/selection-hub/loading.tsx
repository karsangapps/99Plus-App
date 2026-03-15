export default function SelectionHubLoading() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8FAFC' }}>
      <div className="w-[260px] min-w-[260px] bg-white border-r animate-pulse" style={{ borderColor: '#E5E7EB' }}>
        <div className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div className="h-10 w-10 rounded-xl bg-gray-100" />
        </div>
        <div className="px-4 py-4 space-y-2">
          {Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-9 rounded-xl bg-gray-100" />)}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-white border-b px-8 flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
          <div className="h-5 w-36 rounded-lg bg-gray-100 animate-pulse" />
        </div>
        <div className="flex-1 p-8 space-y-4 max-w-5xl mx-auto w-full">
          <div className="h-28 rounded-2xl bg-indigo-100 animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-white border animate-pulse" style={{ borderColor: '#E5E7EB' }} />)}
          </div>
          <div className="h-11 rounded-xl bg-white border animate-pulse" style={{ borderColor: '#E5E7EB' }} />
          {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-xl bg-white border animate-pulse" style={{ borderColor: '#E5E7EB' }} />)}
        </div>
      </div>
    </div>
  )
}
