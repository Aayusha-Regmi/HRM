import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useHRData } from '../../context/HRDataContext'
import ConfirmationDialog from '../../components/ConfirmationDialog'

const Employees = () => {
  const { employees, departments, deleteEmployee } = useHRData()
  const { loading, error } = useHRData()
  const location = useLocation()
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [pageMessage, setPageMessage] = useState(null)
  const [pendingDeleteEmployee, setPendingDeleteEmployee] = useState(null)

  useEffect(() => {
    if (location.state?.flash) {
      setPageMessage(location.state.flash)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const firstName = employee.firstName ?? employee.first_name ?? ''
      const lastName = employee.lastName ?? employee.last_name ?? ''
      const email = employee.email ?? ''
      const position = employee.position ?? ''
      const department = employee.department ?? ''
      const status = employee.status ?? 'inactive'
      const fullName = `${firstName} ${lastName}`.toLowerCase()
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDepartment =
        selectedDepartment === 'all' || department === selectedDepartment
      const matchesStatus = selectedStatus === 'all' || status === selectedStatus

      return matchesSearch && matchesDepartment && matchesStatus
    })
  }, [employees, searchTerm, selectedDepartment, selectedStatus])

  const getStatusBadge = (status) => {
    const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
    if (status === 'active') return `${base} bg-green-100 text-green-800`
    return `${base} bg-red-100 text-red-800`
  }

  const requestDelete = (employee) => {
    setPendingDeleteEmployee(employee)
  }

  const confirmDelete = async () => {
    if (!pendingDeleteEmployee) {
      return
    }

    await deleteEmployee(pendingDeleteEmployee.id)
    setPendingDeleteEmployee(null)
    setPageMessage({ type: 'success', text: 'Employee deleted successfully.' })
  }

  const dismissPageMessage = () => setPageMessage(null)

  if (loading) return <div>Loading employees...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-6 text-gray-900">Employees</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Manage your organization's employees and their profile information.
          </p>
        </div>
        <div className="mt-3 sm:ml-4 sm:mt-0">
          <Link
            to="/employees/add"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Add Employee
          </Link>
        </div>
      </div>

      {pageMessage?.type === 'success' && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold">{pageMessage.title}</p>
              <p className="mt-1 text-sm">{pageMessage.message}</p>
            </div>
            <button
              type="button"
              onClick={dismissPageMessage}
              className="ml-4 rounded p-1 hover:bg-black/5"
              aria-label="Dismiss message"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4 sm:flex sm:items-center sm:space-x-4 sm:space-y-0">
        <div className="max-w-lg flex-1">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Search employees"
            />
          </div>
        </div>

        <select
          value={selectedDepartment}
          onChange={(event) => setSelectedDepartment(event.target.value)}
          className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value)}
          className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <p className="text-sm text-gray-700">
        Showing {filteredEmployees.length} of {employees.length} employees
      </p>

      <div className="overflow-hidden shadow ring-1 ring-black/5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Join Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Salary
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {(employee.firstName ?? employee.first_name ?? '-')} {(employee.lastName ?? employee.last_name ?? '')}
                    </p>
                    <p className="text-sm text-gray-500">{employee.email ?? '-'}</p>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{employee.department || '-'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{employee.position || '-'}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={getStatusBadge(employee.status || 'inactive')}>{employee.status || 'inactive'}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {(employee.joinDate || employee.hireDate || employee.hire_date)
                    ? new Date(employee.joinDate || employee.hireDate || employee.hire_date).toLocaleDateString()
                    : '-'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  ${Number(employee.salary || 0).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Link to={`/employees/${employee.id}`} className="text-indigo-600 hover:text-indigo-900" title="View Details">
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/employees/${employee.id}/edit`}
                      className="text-gray-600 hover:text-gray-900"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => requestDelete(employee)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEmployees.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="text-lg font-medium text-gray-900">No employees found</p>
          <p className="mt-2 text-sm text-gray-500">Try adjusting your search terms or filters.</p>
        </div>
      )}

      <ConfirmationDialog
        open={Boolean(pendingDeleteEmployee)}
        title="Delete Employee"
        message={
          pendingDeleteEmployee
            ? `Are you sure you want to delete ${pendingDeleteEmployee.firstName} ${pendingDeleteEmployee.lastName}? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteEmployee(null)}
        tone="danger"
      />
    </div>
  )
}

export default Employees
