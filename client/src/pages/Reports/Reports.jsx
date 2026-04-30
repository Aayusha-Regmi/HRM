import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardDocumentListIcon,
  DocumentArrowDownIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import { useHRData } from '../../context/HRDataContext'
import { useNotification } from '../../context/NotificationContext'

const REPORT_CATALOG = [
  { id: 'headcount', name: 'Headcount & Workforce Report', frequency: 'Monthly', owner: 'HR Operations' },
  { id: 'attendance', name: 'Attendance & Absenteeism Report', frequency: 'Weekly', owner: 'HR Operations' },
  { id: 'compensation', name: 'Compensation Summary Report', frequency: 'Monthly', owner: 'HR + Finance' },
  { id: 'recruitment', name: 'Recruitment Pipeline Report', frequency: 'Bi-weekly', owner: 'Talent Acquisition' },
  { id: 'department', name: 'Department Utilization Report', frequency: 'Monthly', owner: 'HR Business Partner' },
  { id: 'compliance', name: 'Compliance & Policy Exceptions Report', frequency: 'Monthly', owner: 'HR Compliance' }
]

const percent = (numerator, denominator) => {
  if (!denominator) return '0%'
  return `${Math.round((numerator / denominator) * 100)}%`
}

const getDepartmentEmployeeCount = (department) =>
  Number(department.employeeCount ?? department.employee_count ?? 0)

const getEmployeeDepartmentId = (employee) =>
  employee.departmentId ?? employee.department_id ?? null

const Reports = () => {
  const { employees, departments, attendanceRecords, loading, error } = useHRData()
  const { showSuccess } = useNotification()
  const [selectedReport, setSelectedReport] = useState('headcount')
  const [dateRange, setDateRange] = useState('month-to-date')

  // Ensure arrays are never undefined before using in reduce/filter
  const safeEmployees = useMemo(() => {
    return Array.isArray(employees) ? employees : []
  }, [employees])

  const safeDepartments = useMemo(() => {
    return Array.isArray(departments) ? departments : []
  }, [departments])

  const safeAttendanceRecords = useMemo(() => {
    return Array.isArray(attendanceRecords) ? attendanceRecords : []
  }, [attendanceRecords])

  const totalPayroll = useMemo(() => {
    if (!Array.isArray(safeEmployees) || safeEmployees.length === 0) return 0
    return safeEmployees.reduce((sum, employee) => sum + Number(employee?.salary || 0), 0)
  }, [safeEmployees])

  const processedCount = useMemo(() => {
    if (!Array.isArray(safeEmployees) || safeEmployees.length === 0) return 0
    return safeEmployees.filter((employee) => Number(employee?.salary || 0) > 0).length
  }, [safeEmployees])

  const attendanceSummary = useMemo(() => {
    if (!Array.isArray(safeAttendanceRecords) || safeAttendanceRecords.length === 0) {
      return { total: 0, present: 0, absent: 0, late: 0 }
    }
    return safeAttendanceRecords.reduce(
      (acc, item) => {
        acc.total += 1
        if (item.status === 'present') acc.present += 1
        if (item.status === 'absent') acc.absent += 1
        if (item.status === 'late') acc.late += 1
        return acc
      },
      { total: 0, present: 0, absent: 0, late: 0 }
    )
  }, [safeAttendanceRecords])

  const headcountByDepartment = useMemo(() => {
    if (!Array.isArray(safeDepartments) || safeDepartments.length === 0) return []
    return safeDepartments.map((department) => {
      const departmentEmployeeCount = getDepartmentEmployeeCount(department)
      const count = Array.isArray(safeEmployees)
        ? safeEmployees.filter((employee) => getEmployeeDepartmentId(employee) === department.id).length
        : 0
      return {
        department: department.name,
        active: count,
        planned: departmentEmployeeCount,
        gap: Math.max(departmentEmployeeCount - count, 0)
      }
    })
  }, [safeDepartments, safeEmployees])

  const handleGenerate = () => {
    const selected = REPORT_CATALOG.find((report) => report.id === selectedReport)
    showSuccess('Report Prepared', `${selected?.name || 'Report'} generated for ${dateRange}.`)
  }

  if (loading) return <div>Loading reports...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-6 text-gray-900">HR Reports</h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Centralized reports an HR manager needs to produce for leadership, operations, and compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Employees" value={safeEmployees.length} icon={UserGroupIcon} tone="blue" />
        <MetricCard title="Attendance Rate" value={percent(attendanceSummary.present, attendanceSummary.total)} icon={ClockIcon} tone="emerald" />
        <MetricCard title="Processed Compensation" value={percent(processedCount, safeEmployees.length)} icon={DocumentCheckIcon} tone="amber" />
        <MetricCard title="Total Net Compensation" value={`$${totalPayroll.toLocaleString()}`} icon={CurrencyDollarIcon} tone="indigo" />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-3">
          <div>
            <label htmlFor="report-select" className="mb-2 block text-sm font-medium text-gray-700">
              Report Template
            </label>
            <select
              id="report-select"
              value={selectedReport}
              onChange={(event) => setSelectedReport(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {REPORT_CATALOG.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="range-select" className="mb-2 block text-sm font-medium text-gray-700">
              Date Range
            </label>
            <select
              id="range-select"
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="this-week">This Week</option>
              <option value="month-to-date">Month to Date</option>
              <option value="quarter-to-date">Quarter to Date</option>
              <option value="year-to-date">Year to Date</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <DocumentArrowDownIcon className="mr-2 h-4 w-4" />
            Generate Report
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Required HR Reporting Checklist</h2>
          <p className="mt-1 text-sm text-gray-500">Use this as the standard output list for monthly and quarterly HR governance.</p>
        </div>
        <div className="divide-y divide-gray-200">
          {REPORT_CATALOG.map((report) => (
            <div key={report.id} className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{report.name}</p>
                <p className="text-sm text-gray-500">Owner: {report.owner}</p>
              </div>
              <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {report.frequency}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-base font-semibold text-gray-900">Department Workforce Position</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Active</th>
                  <th className="px-6 py-3">Planned</th>
                  <th className="px-6 py-3">Gap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                {headcountByDepartment.map((row) => (
                  <tr key={row.department}>
                    <td className="px-6 py-3 font-medium">{row.department}</td>
                    <td className="px-6 py-3">{row.active}</td>
                    <td className="px-6 py-3">{row.planned}</td>
                    <td className="px-6 py-3">{row.gap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900">Operational Snapshot</h3>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <SummaryRow label="Present Employees" value={attendanceSummary.present} />
            <SummaryRow label="Absent Employees" value={attendanceSummary.absent} />
            <SummaryRow label="Late Records" value={attendanceSummary.late} />
            <SummaryRow label="Compensation Records" value={safeEmployees.length} />
            <SummaryRow label="Processed Compensation" value={processedCount} />
          </div>

          <div className="mt-6 rounded-md border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
            <p className="font-semibold">Recommended HR actions</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link to="/recruitment" className="inline-flex items-center rounded-md border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">
                <BriefcaseIcon className="mr-1.5 h-4 w-4" />
                Recruitment Pipeline
              </Link>
              <Link to="/leave-management" className="inline-flex items-center rounded-md border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">
                <CalendarDaysIcon className="mr-1.5 h-4 w-4" />
                Leave Review
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const MetricCard = ({ title, value, icon: Icon, tone }) => {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    indigo: 'bg-indigo-50 text-indigo-700'
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-md p-2 ${toneClass[tone] || toneClass.blue}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

const SummaryRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
      <span>{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  )
}

export default Reports