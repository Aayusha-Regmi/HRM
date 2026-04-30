import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const renderCustomLabel = ({ name, value, cx, cy, midAngle, outerRadius }) => {
  const RADIAN = Math.PI / 180
  const radius = outerRadius + 60
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="gray"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${name}: ${value}%`}
    </text>
  )
}

const DashboardChartsGrid = ({ hiresExitsData, departmentData, allDepartmentData, getDepartmentColor }) => {
  // Use allDepartmentData for legend (includes 0%), departmentData for pie (only with employees)
  const legendData = Array.isArray(allDepartmentData) ? allDepartmentData : (Array.isArray(departmentData) ? departmentData : [])
  const pieData = Array.isArray(departmentData) ? departmentData : []
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="surface-card min-w-0">
        <div className="p-5">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Hires vs Exits</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Monthly hiring and attrition comparison</p>
            <p className="mt-1 text-xs text-gray-400">Green line = hires. Red line = exits. Both can rise in the same month.</p>
          </div>
        </div>
        <div className="p-5 pt-0">
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
              <LineChart data={hiresExitsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" height={28} />
                <Line type="monotone" dataKey="hires" stroke="#16A34A" strokeWidth={2.5} name="Hires" />
                <Line type="monotone" dataKey="exits" stroke="#DC2626" strokeWidth={2.5} name="Exits" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="surface-card min-w-0">
        <div className="p-5">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Department Distribution</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Employee distribution by department</p>
          </div>
        </div>
        <div className="p-5 pt-0">
          <div className="flex h-80 min-w-0 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={renderCustomLabel}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}-${index}`} fill={getDepartmentColor(index)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {legendData.map((department, index) => (
              <div
                key={department.name}
                className={`flex items-center justify-between rounded-none border-b border-gray-200 px-1 py-2.5 last:border-b-0 ${
                  department.value === 0 ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: getDepartmentColor(index) }}
                    aria-hidden="true"
                  />
                  <p className={`text-sm font-medium ${department.value === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                    {department.name}
                  </p>
                </div>
                <span className={`text-xs font-semibold ${department.value === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                  {department.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardChartsGrid
