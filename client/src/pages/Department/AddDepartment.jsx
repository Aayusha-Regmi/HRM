import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useHRData } from '../../context/HRDataContext'
import { useNotification } from '../../context/NotificationContext'
import { buildCreateDepartmentPayload } from '../../common/payloads/departmentPayloads'
import { getDepartmentFormErrors } from '../../common/validations/departmentValidation'

const AddDepartment = () => {
  const navigate = useNavigate()
  const { departments, addDepartment, loading, error } = useHRData()
  const { showError, showSuccess } = useNotification()

  const [form, setForm] = useState({
    name: '',
    description: '',
    headOfDepartment: '',
    employeeCount: '',
    budget: '',
    location: ''
  })

  const [touched, setTouched] = useState({})

  const errors = useMemo(() => {
    return getDepartmentFormErrors(form, departments)
  }, [form, departments])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const allTouched = {
      name: true,
      description: true,
      headOfDepartment: true,
      employeeCount: true,
      budget: true,
      location: true
    }
    setTouched(allTouched)

    if (Object.keys(errors).length > 0) {
      showError('Department Form Validation Failed', 'Please resolve all highlighted errors.')
      return
    }

    (async () => {
      try {
        const department = await addDepartment(buildCreateDepartmentPayload(form))
        showSuccess('Department Added', `${department.name} department has been created successfully.`)
        navigate('/departments')
      } catch (err) {
        showError('Server Error', err?.response?.data?.detail || 'Failed to save department. Please check your input.')
      }
    })()
  }

  const inputClass = (field) =>
    `mt-1 block w-full rounded-md border py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-1 ${
      touched[field] && errors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
    }`

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/departments"
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          Back to Departments
        </Link>
      </div>

      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-6 text-gray-900">Add Department</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter department details to create a new organizational unit.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="max-w-3xl space-y-4 rounded-lg bg-white p-6 shadow">
        <div>
          <label className="text-sm font-medium text-gray-700">Department Name</label>
          <input name="name" value={form.name} onChange={handleChange} className={inputClass('name')} />
          {touched.name && errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={3}
            name="description"
            value={form.description}
            onChange={handleChange}
            className={inputClass('description')}
          />
          {touched.description && errors.description && (
            <p className="mt-1 text-xs text-red-700">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">Head of Department</label>
            <input
              name="headOfDepartment"
              value={form.headOfDepartment}
              onChange={handleChange}
              className={inputClass('headOfDepartment')}
            />
            {touched.headOfDepartment && errors.headOfDepartment && (
              <p className="mt-1 text-xs text-red-700">{errors.headOfDepartment}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className={inputClass('location')}
            />
            {touched.location && errors.location && (
              <p className="mt-1 text-xs text-red-700">{errors.location}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Employee Count</label>
            <input
              type="number"
              name="employeeCount"
              value={form.employeeCount}
              onChange={handleChange}
              className={inputClass('employeeCount')}
            />
            {touched.employeeCount && errors.employeeCount && (
              <p className="mt-1 text-xs text-red-700">{errors.employeeCount}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Budget</label>
            <input
              type="number"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              className={inputClass('budget')}
            />
            {touched.budget && errors.budget && (
              <p className="mt-1 text-xs text-red-700">{errors.budget}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <Link
            to="/departments"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Add Department
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddDepartment
