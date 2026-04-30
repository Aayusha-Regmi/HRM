import { UserPlusIcon } from '@heroicons/react/24/outline'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const DashboardBottomSection = ({ attendanceData, recentHires }) => {
  const safeRecentHires = Array.isArray(recentHires) ? recentHires : [];
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="surface-card min-w-0">
        <div className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Weekly Attendance</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Present vs absent employees this week</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500" aria-hidden="true" />
                Present
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden="true" />
                Absent
              </span>
            </div>
          </div>
        </div>
        <div className="p-5 pt-0">
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
              <BarChart data={attendanceData} barCategoryGap="16%" barGap={10}>
                <defs>
                  <linearGradient id="presentBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14B8A6" />
                    <stop offset="100%" stopColor="#0F766E" />
                  </linearGradient>
                  <linearGradient id="absentBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#cbd5e1" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                  contentStyle={{
                    borderRadius: '0.75rem',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
                  }}
                />
                <Bar
                  dataKey="present"
                  fill="url(#presentBarGradient)"
                  barSize={28}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="absent"
                  fill="url(#absentBarGradient)"
                  barSize={28}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="surface-card">
        <div className="p-5">
          <h3 className="flex items-center text-lg font-medium leading-6 text-gray-900">
            <UserPlusIcon className="mr-2 h-5 w-5" />
            Recent Hires
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Latest employees to join the company</p>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {safeRecentHires.map((person) => (
              <li key={person.name} className="px-5 py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-700">
                      {person.avatar}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{person.name}</p>
                    <p className="truncate text-sm text-gray-500">{person.department}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {new Date(person.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DashboardBottomSection
