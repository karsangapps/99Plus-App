interface DrillStatsRowProps {
  pendingCount: number
  completedToday: number
  avgAccuracy: number
  sealedCount: number
}

export function DrillStatsRow({ pendingCount, completedToday, avgAccuracy, sealedCount }: DrillStatsRowProps) {
  const stats = [
    {
      label: 'Pending Drills',
      value: pendingCount,
      sub: pendingCount > 0 ? `${pendingCount} from diagnosis` : 'All clear',
      subColor: pendingCount > 0 ? 'text-red-500' : 'text-emerald-500',
      icon: 'fa-list-check', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500',
    },
    {
      label: 'Completed Today',
      value: completedToday,
      sub: completedToday > 0 ? `${completedToday * 20} min invested` : 'Start your first drill',
      subColor: 'text-emerald-500',
      icon: 'fa-check-double', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500',
    },
    {
      label: 'Avg Accuracy',
      value: `${avgAccuracy}%`,
      sub: null,
      bar: avgAccuracy,
      icon: 'fa-crosshairs', iconBg: 'bg-yellow-50', iconColor: 'text-yellow-600',
    },
    {
      label: 'Mark Leaks Sealed',
      value: sealedCount,
      sub: sealedCount > 0 ? `${sealedCount} weakness conquered` : 'Seal your first leak',
      subColor: 'text-emerald-500',
      icon: 'fa-shield-halved', iconBg: 'bg-red-50', iconColor: 'text-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {stats.map(stat => (
        <div
          key={stat.label}
          className="bg-white border border-gray-200 p-5 rounded-xl hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</span>
            <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
              <i className={`fa-solid ${stat.icon} text-sm ${stat.iconColor}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          {stat.sub && (
            <p className={`text-xs mt-1 font-medium ${stat.subColor}`}>
              <i className="fa-solid fa-circle-arrow-right mr-1 text-[10px]" />{stat.sub}
            </p>
          )}
          {stat.bar !== undefined && (
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
              <div
                className="bg-yellow-400 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${stat.bar}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
