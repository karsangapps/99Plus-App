export default function NtaTestLoading() {
  return (
    <div className="flex flex-col h-screen bg-[#eef2f7] animate-pulse">
      {/* Header skeleton */}
      <div className="h-14 bg-[#1a3c6e] w-full" />
      {/* Section tabs skeleton */}
      <div className="h-9 bg-[#e0e8f0] border-b border-gray-300 w-full flex gap-2 px-4 py-2">
        <div className="h-5 w-24 bg-gray-300 rounded" />
        <div className="h-5 w-28 bg-gray-300 rounded" />
        <div className="h-5 w-24 bg-gray-300 rounded" />
      </div>
      {/* Body skeleton */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 p-6 gap-4">
          <div className="h-6 w-1/2 bg-gray-200 rounded" />
          <div className="h-24 w-full bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-100 rounded" />
          <div className="h-10 w-full bg-gray-100 rounded" />
          <div className="h-10 w-full bg-gray-100 rounded" />
          <div className="h-10 w-full bg-gray-100 rounded" />
        </div>
        <div className="w-64 bg-[#f5f7fa] border-l border-gray-200" />
      </div>
    </div>
  )
}
