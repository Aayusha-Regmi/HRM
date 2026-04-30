const Sparkline = ({ data, isPositive }) => {
  if (!Array.isArray(data) || data.length < 2) return null

  const width = 120
  const height = 44
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * (width - 8) + 4
      const y = height - ((value - min) / range) * (height - 10) - 5
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-11 w-28 text-blue-600"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

const MiniAttendanceBars = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) return null

  const width = 120
  const height = 44
  const chartHeight = 34
  const maxTotal = Math.max(...data.map((item) => item.present + item.absent), 1)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-11 w-28" aria-hidden="true">
      <line x1="4" y1="40" x2="116" y2="40" stroke="#CBD5E1" strokeWidth="1" />
      {data.map((item, index) => {
        const groupX = 16 + index * 46
        const presentHeight = (item.present / maxTotal) * chartHeight
        const absentHeight = (item.absent / maxTotal) * chartHeight
        const presentY = 40 - presentHeight
        const absentY = 40 - absentHeight

        return (
          <g key={item.day}>
            <rect x={groupX} y={presentY} width="10" height={presentHeight} rx="2" fill="#3B82F6" />
            <rect x={groupX + 14} y={absentY} width="10" height={absentHeight} rx="2" fill="#1D4ED8" />
            <text x={groupX + 12} y="43" textAnchor="middle" fontSize="6" fill="#64748B">
              {index === 0 ? 'Y' : 'D-2'}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

const MiniStatusProgress = ({ completed, pending, completedLabel, pendingLabel }) => {
  const total = Math.max(completed + pending, 1)
  const completedPercent = (completed / total) * 100

  return (
    <div className="w-28">
      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${completedPercent}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
        <span>{completedLabel}</span>
        <span>{pendingLabel}</span>
      </div>
    </div>
  )
}

const DashboardStatsGrid = ({ stats }) => {
  const safeStats = Array.isArray(stats) ? stats : [];
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {safeStats.map((stat) => {
        const isPositive = String(stat.change || '+').trim().startsWith('+')
        const valueLength = String(stat.value).length
        const metricTextClass = valueLength >= 7
          ? 'text-base leading-none sm:text-lg'
          : valueLength >= 5
            ? 'text-lg leading-none sm:text-xl'
            : 'text-xl leading-none sm:text-2xl'

        return (
          <div
            key={stat.id}
            className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-[#1B2633]/90 to-[#111827]/85 p-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="border-b border-slate-700/60 px-4 py-4 sm:px-5 sm:py-4">
              <div className="flex items-center gap-3">
                <div
                  className="relative inline-flex h-[4.8rem] w-[4.8rem] items-center justify-center sm:h-[5.1rem] sm:w-[5.1rem]"
                  aria-label={`${stat.name} value`}
                >
                  <span aria-hidden="true" className="absolute inset-0 rounded-full border-[3px] border-blue-300/70" />
                  <span aria-hidden="true" className="absolute inset-0 animate-[spin_1.8s_linear_1]">
                    <span className="absolute left-1/2 top-[-0.18rem] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-blue-300 shadow-[0_0_0_3px_rgba(96,165,250,0.28)]" />
                  </span>
                  <span
                    className={`relative z-10 inline-flex h-[3.9rem] w-[3.9rem] items-center justify-center rounded-full border border-slate-600 bg-[#0F172A]/65 font-semibold tracking-tight text-blue-200 shadow-sm sm:h-[4.2rem] sm:w-[4.2rem] ${metricTextClass}`}
                  >
                    {stat.value}
                  </span>
                </div>

                <div className="min-w-0 flex-1 text-right">
                  <p className="text-xl font-semibold tracking-tight text-slate-100">
                    {stat.name}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-400">vs previous period</p>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between px-4 py-4 sm:px-5 sm:py-5">
              {stat.type === 'attendance' ? (
                <>
                  <div>
                    <span className="text-2xl font-bold tracking-tight text-red-600 sm:text-3xl">
                      {stat.absenteesToday}
                    </span>
                    <p className="mt-1 text-xs tracking-wide text-slate-400">
                      {stat.growthLabel}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-800/35 p-1.5 ring-1 ring-slate-600/70">
                    <MiniAttendanceBars data={stat.attendanceMiniData} />
                  </div>
                </>
              ) : stat.type === 'status' ? (
                <>
                  <div>
                    <span className="text-2xl font-bold tracking-tight text-amber-600 sm:text-3xl">
                      {stat.statusValue}
                    </span>
                    <p className="mt-1 text-xs tracking-wide text-slate-400">
                      {stat.statusLabel}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-800/35 p-1.5 ring-1 ring-slate-600/70">
                    <MiniStatusProgress
                      completed={stat.progress.completed}
                      pending={stat.progress.pending}
                      completedLabel={stat.progress.completedLabel}
                      pendingLabel={stat.progress.pendingLabel}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className={`text-2xl font-bold tracking-tight sm:text-3xl ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <p className="mt-1 text-xs tracking-wide text-slate-400">
                      {stat.growthLabel}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-800/35 p-1.5 ring-1 ring-slate-600/70">
                    <Sparkline data={stat.trendData} isPositive={isPositive} />
                  </div>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default DashboardStatsGrid
