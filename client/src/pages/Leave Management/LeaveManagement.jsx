import { useMemo, useState, useEffect } from 'react';
import { CalendarDaysIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import * as api from '../../api/hrmApi';
import { useHRData } from '../../context/HRDataContext';

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
}

const mapLeaveFromApi = (leave, employeeMap, departmentMap) => {
  const employeeId = leave.employee_id ?? leave.employeeId ?? null
  const employee = employeeMap.get(employeeId)
  const department = employee ? departmentMap.get(employee.departmentId) : null

  return {
    ...leave,
    employeeName: employee ? `${employee.firstName} ${employee.lastName}`.trim() : `Employee #${employeeId ?? leave.id}`,
    departmentName: department?.name || 'N/A',
    leaveType: leave.leaveType ?? leave.leave_type ?? 'vacation',
    from: leave.from ?? leave.start_date ?? null,
    to: leave.to ?? leave.end_date ?? null,
    status: leave.status ?? 'pending',
    _raw: leave,
  }
}


const LeaveManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { employees, departments } = useHRData();

  const employeeMap = useMemo(
    () => new Map((Array.isArray(employees) ? employees : []).map((employee) => [employee.id, employee])),
    [employees]
  )

  const departmentMap = useMemo(
    () => new Map((Array.isArray(departments) ? departments : []).map((department) => [department.id, department])),
    [departments]
  )

  useEffect(() => {
    api.getLeaves()
      .then((data) => {
        const normalized = Array.isArray(data)
          ? data.map((leave) => mapLeaveFromApi(leave, employeeMap, departmentMap))
          : []
        setRequests(normalized);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load leave requests.');
        setLoading(false);
      });
  }, [employeeMap, departmentMap]);

  const pendingCount = useMemo(
    () => requests.filter((item) => item.status === 'pending').length,
    [requests]
  );

  const approvedCount = useMemo(
    () => requests.filter((item) => item.status === 'approved').length,
    [requests]
  );

  const updateStatus = async (id, status) => {
    const leave = requests.find((item) => item.id === id);
    if (!leave) return;
    try {
      const payload = {
        ...leave._raw,
        employee_id: leave.employee_id ?? leave.employeeId ?? leave._raw?.employee_id ?? leave._raw?.employeeId,
        leave_type: leave.leave_type ?? leave.leaveType ?? leave._raw?.leave_type ?? leave._raw?.leaveType,
        start_date: leave.start_date ?? leave.from ?? leave._raw?.start_date ?? leave._raw?.from,
        end_date: leave.end_date ?? leave.to ?? leave._raw?.end_date ?? leave._raw?.to,
        reason: leave.reason ?? leave._raw?.reason ?? null,
        status,
      }

      await api.updateLeave(id, payload);
      setRequests((prev) => prev.map((item) => (item.id === id ? { ...item, status, _raw: { ...item._raw, status } } : item)));
    } catch (e) {
      setError('Failed to update leave status.');
    }
  };

  if (loading) return <div>Loading leave requests...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-6 text-gray-900">Leave Management</h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Review leave requests and maintain staffing continuity across departments.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <LeaveCard title="Total Requests" value={requests.length} icon={CalendarDaysIcon} tone="blue" />
        <LeaveCard title="Pending Approval" value={pendingCount} icon={ClockIcon} tone="amber" />
        <LeaveCard title="Approved" value={approvedCount} icon={CheckCircleIcon} tone="emerald" />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Leave Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Dates</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
              {requests.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-3 font-medium text-gray-900">{item.employeeName}</td>
                  <td className="px-6 py-3">{item.departmentName}</td>
                  <td className="px-6 py-3">{item.leaveType}</td>
                  <td className="px-6 py-3">{formatDate(item.from)} to {formatDate(item.to)}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {item.status === 'pending' ? (
                      <button
                        type="button"
                        onClick={() => updateStatus(item.id, 'approved')}
                        className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">No action required</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const LeaveCard = ({ title, value, icon: Icon, tone }) => {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700'
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

export default LeaveManagement
