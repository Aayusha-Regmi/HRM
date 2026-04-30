import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useHRData } from '../../context/HRDataContext'
import { useNotification } from '../../context/NotificationContext'
import { buildEmployeePayload } from '../../common/payloads/employeePayloads'
import { employeeValidators, getEmployeeFormErrors } from '../../common/validations/employeeValidation'

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  department: '',
  position: '',
  salary: '',
  joinDate: '',
  dateOfBirth: '',
  manager: '',
  bankName: '',
  bankBranchName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankSwiftCode: '',
  emergencyContactName: '',
  emergencyContactRelationship: '',
  emergencyContactPhone: '',
  skills: [],
  status: 'active'
}

const requiredLabel = 'text-sm font-medium text-gray-700'
const requiredStar = 'ml-1 text-red-900'

const AddEmployee = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { employees, departments, addEmployee, updateEmployee, loading, error } = useHRData()
  const { showError, showSuccess, showWarning } = useNotification()

  const currentEmployee = useMemo(
    () => employees.find((item) => item.id === Number(id)),
    [employees, id]
  )

  const [formData, setFormData] = useState(() => {
    if (!currentEmployee) {
      return emptyForm
    }

    return {
      ...emptyForm,
      firstName: currentEmployee.firstName || '',
      lastName: currentEmployee.lastName || '',
      email: currentEmployee.email || '',
      phone: currentEmployee.phone || '',
      address: currentEmployee.address || '',
      department: currentEmployee.department || '',
      position: currentEmployee.position || '',
      salary: String(currentEmployee.salary ?? ''),
      joinDate: currentEmployee.hireDate || currentEmployee.joinDate || '',
      dateOfBirth: currentEmployee.dateOfBirth || '',
      manager: currentEmployee.manager || '',
      bankName: currentEmployee.bankName || '',
      bankBranchName: currentEmployee.bankBranchName || '',
      bankAccountName: currentEmployee.bankAccountName || '',
      bankAccountNumber: currentEmployee.bankAccountNumber || '',
      bankSwiftCode: currentEmployee.bankSwiftCode || '',
      emergencyContactName: currentEmployee.emergencyContactName || '',
      emergencyContactRelationship: currentEmployee.emergencyContactRelationship || '',
      emergencyContactPhone: currentEmployee.emergencyContactPhone || '',
      skills: currentEmployee.skills || [],
      status: currentEmployee.status || 'active'
    }
  })

  const [touched, setTouched] = useState({})
  const [skillInput, setSkillInput] = useState('')

  const managers = useMemo(
    () => employees.map((employee) => `${employee.firstName} ${employee.lastName}`),
    [employees]
  )

  const errors = useMemo(() => {
    return getEmployeeFormErrors(formData)
  }, [formData])

  const hasErrors = Object.values(errors).some(Boolean)

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setField(name, value)
    markTouched(name)
  }

  const handleAddSkill = (event) => {
    event.preventDefault()
    const normalized = skillInput.trim()
    if (!normalized) return
    if (formData.skills.some((skill) => skill.toLowerCase() === normalized.toLowerCase())) {
      showWarning('Duplicate Skill', 'This skill has already been added to the employee profile.')
      return
    }
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, normalized] }))
    setSkillInput('')
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove)
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const allTouched = Object.keys(employeeValidators).reduce((acc, field) => {
      acc[field] = true
      return acc
    }, {})
    setTouched(allTouched)

    if (hasErrors) {
      showError('Form Validation Failed', 'Please correct the highlighted errors and submit again.')
      return
    }

    const payload = buildEmployeePayload(formData, departments)

    try {
      if (isEdit && currentEmployee) {
        await updateEmployee(currentEmployee.id, payload)
        showSuccess(
          'Employee Updated Successfully',
          `${payload.first_name} ${payload.last_name} has been updated successfully.`
        )
        navigate(`/employees/${currentEmployee.id}`)
      } else {
        await addEmployee(payload)
        showSuccess(
          'Employee Added Successfully',
          `${payload.first_name} ${payload.last_name} has been added to the organization records.`
        )
        navigate('/employees')
      }
    } catch (err) {
      showError('Server Error', err?.response?.data?.detail || 'Failed to save employee. Please check your input.')
    }
  }


  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (isEdit && !currentEmployee) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
        Employee record not found. Please return to the employee list.
      </div>
    );
  }


  const inputClass = (field) =>
    `mt-1 block w-full rounded-md border py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-1 ${
      touched[field] && errors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
    }`

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/employees"
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Employees
        </Link>
      </div>

      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-6 text-gray-900">
          {isEdit ? 'Edit Employee' : 'Add New Employee'}
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Complete all required fields to {isEdit ? 'update the employee profile' : 'add a new employee'}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className={requiredLabel}>
                      First Name<span className={requiredStar}>*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      onBlur={() => markTouched('firstName')}
                      className={inputClass('firstName')}
                    />
                    {touched.firstName && errors.firstName && (
                      <p className="mt-1 text-xs text-red-700">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className={requiredLabel}>
                      Last Name<span className={requiredStar}>*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      onBlur={() => markTouched('lastName')}
                      className={inputClass('lastName')}
                    />
                    {touched.lastName && errors.lastName && (
                      <p className="mt-1 text-xs text-red-700">{errors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className={requiredLabel}>
                      Official Email<span className={requiredStar}>*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => markTouched('email')}
                      className={inputClass('email')}
                    />
                    {touched.email && errors.email && (
                      <p className="mt-1 text-xs text-red-700">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className={requiredLabel}>
                      Phone Number<span className={requiredStar}>*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={() => markTouched('phone')}
                      className={inputClass('phone')}
                    />
                    {touched.phone && errors.phone && (
                      <p className="mt-1 text-xs text-red-700">{errors.phone}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={inputClass('address')}
                    />
                  </div>

                  <div>
                    <label htmlFor="dateOfBirth" className={requiredLabel}>
                      Date of Birth<span className={requiredStar}>*</span>
                    </label>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      onBlur={() => markTouched('dateOfBirth')}
                      className={inputClass('dateOfBirth')}
                    />
                    {touched.dateOfBirth && errors.dateOfBirth && (
                      <p className="mt-1 text-xs text-red-700">{errors.dateOfBirth}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Employment Information</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="department" className={requiredLabel}>
                      Department<span className={requiredStar}>*</span>
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      onBlur={() => markTouched('department')}
                      className={inputClass('department')}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {touched.department && errors.department && (
                      <p className="mt-1 text-xs text-red-700">{errors.department}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="position" className={requiredLabel}>
                      Position<span className={requiredStar}>*</span>
                    </label>
                    <input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      onBlur={() => markTouched('position')}
                      className={inputClass('position')}
                    />
                    {touched.position && errors.position && (
                      <p className="mt-1 text-xs text-red-700">{errors.position}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="salary" className={requiredLabel}>
                      Annual Salary<span className={requiredStar}>*</span>
                    </label>
                    <input
                      id="salary"
                      name="salary"
                      type="number"
                      value={formData.salary}
                      onChange={handleInputChange}
                      onBlur={() => markTouched('salary')}
                      className={inputClass('salary')}
                    />
                    {touched.salary && errors.salary && (
                      <p className="mt-1 text-xs text-red-700">{errors.salary}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="joinDate" className={requiredLabel}>
                      Join Date<span className={requiredStar}>*</span>
                    </label>
                    <input
                      id="joinDate"
                      name="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={handleInputChange}
                      onBlur={() => markTouched('joinDate')}
                      className={inputClass('joinDate')}
                    />
                    {touched.joinDate && errors.joinDate && (
                      <p className="mt-1 text-xs text-red-700">{errors.joinDate}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="manager" className="text-sm font-medium text-gray-700">
                      Manager
                    </label>
                    <select
                      id="manager"
                      name="manager"
                      value={formData.manager}
                      onChange={handleInputChange}
                      className={inputClass('manager')}
                    >
                      <option value="">Select Manager</option>
                      {managers.map((manager) => (
                        <option key={manager} value={manager}>
                          {manager}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Skills</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(event) => setSkillInput(event.target.value)}
                    placeholder="Add a skill"
                    className="flex-1 rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleAddSkill(event)
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 text-blue-700 hover:text-blue-900"
                        aria-label={`Remove ${skill}`}
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Emergency Contact</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="emergencyContactName" className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    className={inputClass('emergencyContactName')}
                  />
                </div>

                <div>
                  <label
                    htmlFor="emergencyContactRelationship"
                    className="text-sm font-medium text-gray-700"
                  >
                    Relationship
                  </label>
                  <input
                    id="emergencyContactRelationship"
                    name="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={handleInputChange}
                    className={inputClass('emergencyContactRelationship')}
                  />
                </div>

                <div>
                  <label htmlFor="emergencyContactPhone" className="text-sm font-medium text-gray-700">
                    Contact Phone
                  </label>
                  <input
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    onBlur={() => markTouched('emergencyContactPhone')}
                    className={inputClass('emergencyContactPhone')}
                  />
                  {touched.emergencyContactPhone && errors.emergencyContactPhone && (
                    <p className="mt-1 text-xs text-red-700">{errors.emergencyContactPhone}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Bank Details</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="bankName" className="text-sm font-medium text-gray-700">
                    Bank Name
                  </label>
                  <input
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="Enter bank name"
                    className={inputClass('bankName')}
                  />
                </div>

                <div>
                  <label htmlFor="bankBranchName" className="text-sm font-medium text-gray-700">
                    Branch Name
                  </label>
                  <input
                    id="bankBranchName"
                    name="bankBranchName"
                    value={formData.bankBranchName}
                    onChange={handleInputChange}
                    placeholder="Enter branch name"
                    className={inputClass('bankBranchName')}
                  />
                </div>

                <div>
                  <label htmlFor="bankAccountName" className="text-sm font-medium text-gray-700">
                    Account Name
                  </label>
                  <input
                    id="bankAccountName"
                    name="bankAccountName"
                    value={formData.bankAccountName}
                    onChange={handleInputChange}
                    placeholder="Enter account name"
                    className={inputClass('bankAccountName')}
                  />
                </div>

                <div>
                  <label htmlFor="bankAccountNumber" className="text-sm font-medium text-gray-700">
                    Account Number
                  </label>
                  <input
                    id="bankAccountNumber"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleInputChange}
                    placeholder="Enter account number"
                    className={inputClass('bankAccountNumber')}
                  />
                </div>

                <div>
                  <label htmlFor="bankSwiftCode" className="text-sm font-medium text-gray-700">
                    Swift Code
                  </label>
                  <input
                    id="bankSwiftCode"
                    name="bankSwiftCode"
                    value={formData.bankSwiftCode}
                    onChange={handleInputChange}
                    placeholder="Enter swift code"
                    className={inputClass('bankSwiftCode')}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 space-y-3">
                <button
                  type="submit"
                  className="w-full rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  {isEdit ? 'Update Employee' : 'Add Employee'}
                </button>
                <Link
                  to="/employees"
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddEmployee
