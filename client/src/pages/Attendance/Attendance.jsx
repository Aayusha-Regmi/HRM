import { useMemo, useState } from 'react'
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { useHRData } from '../../context/HRDataContext'
import { useNotification } from '../../context/NotificationContext'
import { buildAttendancePayload } from '../../common/payloads/attendancePayloads'
import {
  formatHours,
  formatSelectedDate,
  getLocalDateString,
  to12Hour
} from '../../common/utils'

const Attendance = () => {
  const { employees, departments, attendanceRecords, markAttendance, loading, error } = useHRData()
  const { showSuccess } = useNotification()

  const today = getLocalDateString()
  const [selectedDate, setSelectedDate] = useState(today)
  const [filterStatus, setFilterStatus] = useState('all')
  const [entry, setEntry] = useState({
    employeeId: '',
    status: 'present',
    clockIn: '09:00',
    clockOut: '18:00'
  })

  const recordsForDate = useMemo(
    () => attendanceRecords.filter((record) => record.date === selectedDate),
    [attendanceRecords, selectedDate]
  )

  const filteredData = useMemo(
    () => recordsForDate.filter((record) => filterStatus === 'all' || record.status === filterStatus),
    [recordsForDate, filterStatus]
  )

  const summary = useMemo(
    () => ({
      present: recordsForDate.filter((record) => record.status === 'present').length,
      absent: recordsForDate.filter((record) => record.status === 'absent').length,
      late: recordsForDate.filter((record) => record.status === 'late').length,
      overtime: recordsForDate.reduce((sum, record) => sum + Number(record.overtime_hours || 0), 0)
    }),
    [recordsForDate]
  )

  const getStatusIcon = (status) => {
    if (status === 'present') return <CheckCircleIcon className="h-5 w-5 text-green-500" />
    if (status === 'late') return <ClockIcon className="h-5 w-5 text-yellow-500" />
    return <XCircleIcon className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = (status) => {
    const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
    if (status === 'present') return `${base} bg-green-100 text-green-800`
    if (status === 'late') return `${base} bg-yellow-100 text-yellow-800`
    return `${base} bg-red-100 text-red-800`
  }

  const handleMarkAttendance = async (event) => {
    event.preventDefault()

    const selectedEmployee = employees.find((employee) => employee.id === Number(entry.employeeId))
    if (!selectedEmployee) {
      return
    }

    const totalHours = formatHours(entry.clockIn, entry.clockOut)
    const overtimeHours = totalHours > 8 ? Number((totalHours - 8).toFixed(2)) : 0

    await markAttendance(
      buildAttendancePayload({
        selectedDate,
        selectedEmployee,
        entry,
        overtimeHours
      })
    )

    showSuccess(
      'Attendance Saved',
      `Attendance for ${selectedEmployee.firstName} ${selectedEmployee.lastName} has been recorded.`
    )
  }

  if (loading) return <div>Loading attendance data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold leading-6 text-gray-900">Attendance</h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Review attendance by date, log time entries, and keep daily workforce records consistent.
        </p>
      </div>

      <div className="surface-card p-6">
        <form onSubmit={handleMarkAttendance} className="grid grid-cols-1 gap-5 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-slate-700">Attendance Date</label>
              <button
                type="button"
                onClick={() => setSelectedDate(today)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Reset to today
              </button>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value || today)}
              max={today}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-2 text-xs text-slate-500">Use the calendar to move between daily attendance logs.</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Employee</label>
            <select
              value={entry.employeeId}
              onChange={(event) => setEntry((prev) => ({ ...prev, employeeId: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            >
              <option value="">Select Employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              value={entry.status}
              onChange={(event) => setEntry((prev) => ({ ...prev, status: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Clock In</label>
            <input
              type="time"
              value={entry.clockIn}
              onChange={(event) => setEntry((prev) => ({ ...prev, clockIn: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={entry.status === 'absent'}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Clock Out</label>
            <input
              type="time"
              value={entry.clockOut}
              onChange={(event) => setEntry((prev) => ({ ...prev, clockOut: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={entry.status === 'absent'}
            />
          </div>

          <div className="md:col-span-5 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Save Attendance
            </button>
          </div>
        </form>
      </div>

      <div className="surface-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-slate-700">Selected Date:</span>
            <span className="text-sm text-slate-900">{formatSelectedDate(selectedDate)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Present" value={summary.present} icon={<CheckCircleIcon className="h-8 w-8 text-green-500" />} />
        <SummaryCard title="Absent" value={summary.absent} icon={<XCircleIcon className="h-8 w-8 text-red-500" />} />
        <SummaryCard title="Late" value={summary.late} icon={<ClockIcon className="h-8 w-8 text-yellow-500" />} />
        <SummaryCard title="Overtime Hours" value={summary.overtime} icon={<ClockIcon className="h-8 w-8 text-blue-500" />} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Clock In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Clock Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Total Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  No attendance records match this date and filter.
                </td>
              </tr>
            ) : (
              filteredData.map((record) => {
                const employee = employees.find((item) => item.id === record.employee_id)
                const department = departments.find((dep) => dep.id === employee?.departmentId)
                const clockIn = record.clock_in || ''
                const clockOut = record.clock_out || ''
                const totalHours = formatHours(clockIn, clockOut)
                return (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(record.status)}
                        <span className="ml-3 text-sm font-medium text-slate-900">
                          {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                      {department?.name || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">{to12Hour(clockIn)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">{to12Hour(clockOut)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                      {record.status === 'absent' ? '-' : `${totalHours}h`}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={getStatusBadge(record.status)}>{record.status}</span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const SummaryCard = ({ title, value, icon }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-5 w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-500">{title}</p>
          <p className="text-lg font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  </div>
)

export default Attendance
