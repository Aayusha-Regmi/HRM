import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeftIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { useHRData } from '../../context/HRDataContext'

const EmployeeDetails = () => {
  const { id } = useParams()
  const { employees, loading, error } = useHRData()

  const employee = employees.find((item) => item.id === Number(id))
  const employeeCode = employee?.employeeId ?? employee?.id ?? '-'
  const joinDateValue = employee?.joinDate ?? employee?.hireDate ?? employee?.hire_date ?? null

  if (loading) return <div>Loading employee...</div>;
  if (error) return <div>{error}</div>;
  if (!employee) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
        Employee details are not available for the selected record.
      </div>
    )
  }

  const getStatusBadge = (status) => {
    const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
    if (status === 'active') return `${base} bg-green-100 text-green-800`
    return `${base} bg-red-100 text-red-800`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/employees" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          Back to Employees
        </Link>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-medium text-gray-700">
                {employee.firstName?.[0]}
                {employee.lastName?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {employee.firstName} {employee.lastName}
                </h1>
                <p className="text-sm text-gray-500">
                  {employee.position} • {employee.department}
                </p>
                <div className="mt-2">
                  <span className={getStatusBadge(employee.status)}>{employee.status}</span>
                </div>
              </div>
            </div>
            <Link
              to={`/employees/${employee.id}/edit`}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <PencilIcon className="-ml-0.5 mr-1.5 h-4 w-4" />
              Edit Employee
            </Link>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <EnvelopeIcon className="h-4 w-4" />
              <span>{employee.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <PhoneIcon className="h-4 w-4" />
              <span>{employee.phone}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <UserIcon className="h-4 w-4" />
              <span>ID: {employeeCode}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
            </div>
            <div className="space-y-4 px-6 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Employee ID</p>
                  <p className="mt-1 text-sm text-gray-900">{employeeCode}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <div className="mt-1 flex items-center space-x-2 text-sm text-gray-900">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <span>{employee.address || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Employment Information</h2>
            </div>
            <div className="space-y-4 px-6 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <div className="mt-1 flex items-center space-x-2 text-sm text-gray-900">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                    <span>{employee.department}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Position</p>
                  <p className="mt-1 text-sm text-gray-900">{employee.position}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Join Date</p>
                  <div className="mt-1 flex items-center space-x-2 text-sm text-gray-900">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span>{joinDateValue ? new Date(joinDateValue).toLocaleDateString() : '-'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Manager</p>
                  <p className="mt-1 text-sm text-gray-900">{employee.manager || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Annual Salary</p>
                  <div className="mt-1 flex items-center space-x-2 text-sm text-gray-900">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                    <span>${Number(employee.salary || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Skills</h2>
            </div>
            <div className="px-6 py-4">
              <div className="flex flex-wrap gap-2">
                {(employee.skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Emergency Contact</h2>
            </div>
            <div className="space-y-3 px-6 py-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="mt-1 text-sm text-gray-900">{employee.emergencyContactName || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Relationship</p>
                <p className="mt-1 text-sm text-gray-900">{employee.emergencyContactRelationship || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="mt-1 text-sm text-gray-900">{employee.emergencyContactPhone || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetails
