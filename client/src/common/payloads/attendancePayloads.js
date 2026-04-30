export const buildAttendancePayload = ({ selectedDate, selectedEmployee, entry, overtimeHours }) => ({
  date: selectedDate,
  employee_id: selectedEmployee.id,
  status: entry.status,
  clock_in: entry.status === 'absent' ? null : entry.clockIn,
  clock_out: entry.status === 'absent' ? null : entry.clockOut,
  overtime_hours: overtimeHours
})
