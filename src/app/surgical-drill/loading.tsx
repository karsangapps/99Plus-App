export default function DrillHubLoading() {
  return (
    <div className="lg:ml-64 min-h-screen bg-[#F8FAFC] pb-20 animate-pulse">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-5 h-20" />
      <div className="px-8 py-8 space-y-6">
        <div className="h-32 bg-indigo-100 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white border border-gray-200 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-56 bg-white border border-gray-200 rounded-2xl" />)}
        </div>
      </div>
    </div>
  )
}
