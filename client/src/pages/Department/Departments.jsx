import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useHRData } from '../../context/HRDataContext'
import { useNotification } from '../../context/NotificationContext'
import ConfirmationDialog from '../../components/ConfirmationDialog'
import { buildUpdateDepartmentPayload } from '../../common/payloads/departmentPayloads'
import { formatCurrencyNPR, getDepartmentTheme } from '../../common/utils'

const Departments = () => {
  const { departments, updateDepartment, deleteDepartment, loading, error } = useHRData()
  const { showSuccess, showWarning } = useNotification()

  const [editingId, setEditingId] = useState(null)
  const [pendingDeleteDepartment, setPendingDeleteDepartment] = useState(null)
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    headOfDepartment: '',
    employeeCount: '',
    budget: '',
    location: ''
  })

  useEffect(() => {
    if (!departments.length) {
      setSelectedDepartmentId(null)
      setEditingId(null)
      return
    }

    const selectedExists = departments.some((department) => department.id === selectedDepartmentId)
    if (!selectedDepartmentId || !selectedExists) {
      setSelectedDepartmentId(departments[0].id)
    }
  }, [departments, selectedDepartmentId])

  useEffect(() => {
    if (editingId && !departments.some((department) => department.id === editingId)) {
      setEditingId(null)
    }
  }, [departments, editingId])

  const sortedDepartments = useMemo(
    () => [...departments].sort((a, b) => a.name.localeCompare(b.name)),
    [departments]
  )

  const selectedDepartment = useMemo(
    () => sortedDepartments.find((department) => department.id === selectedDepartmentId) || null,
    [sortedDepartments, selectedDepartmentId]
  )

  const totalEmployees = useMemo(
    () => departments.reduce((sum, department) => sum + Number(department.employeeCount || 0), 0),
    [departments]
  )

  const totalBudget = useMemo(
    () => departments.reduce((sum, department) => sum + Number(department.budget || 0), 0),
    [departments]
  )

  const averageTeamSize = departments.length ? Math.round(totalEmployees / departments.length) : 0

  const startEdit = (department) => {
    setEditingId(department.id)
    setSelectedDepartmentId(department.id)
    setEditForm({
      name: department.name,
      description: department.description,
      headOfDepartment: department.headOfDepartment,
      employeeCount: String(department.employeeCount),
      budget: String(department.budget),
      location: department.location
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = (department) => {
    (async () => {
      await updateDepartment(department.id, buildUpdateDepartmentPayload(editForm))
      showSuccess('Department Updated', `${editForm.name} department has been updated.`)
      setEditingId(null)
    })()
  }

  const requestDelete = (department) => {
    setPendingDeleteDepartment(department)
  }

  const confirmDelete = async () => {
    if (!pendingDeleteDepartment) {
      return
    }

    const department = pendingDeleteDepartment
    try {
      await deleteDepartment(department.id)
      showSuccess('Department Deleted', `${department.name} has been removed.`)
      setEditingId(null)
      setSelectedDepartmentId((current) => (current === department.id ? null : current))
      setPendingDeleteDepartment(null)
    } catch (err) {
      showWarning('Delete Failed', err?.response?.data?.detail || 'Unable to delete department.')
    }
  }

  const handleSelectDepartment = (departmentId) => {
    setSelectedDepartmentId(departmentId)
    if (editingId && editingId !== departmentId) {
      setEditingId(null)
    }
  }

  const selectedTheme = selectedDepartment ? getDepartmentTheme(selectedDepartment.name) : null

  if (loading) return <div>Loading departments...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="mt-2 text-sm text-gray-500">
            A formal register of departments, leadership, staffing, and financial allocation across the organization.
          </p>
        </div>
        <Link
          to="/departments/add"
          className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <PlusIcon className="-ml-0.5 mr-2 h-5 w-5" />
          Add Department
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Departments" value={departments.length} helper="Registered business units" />
        <MetricCard label="Employees" value={totalEmployees} helper="Combined workforce size" />
        <MetricCard label="Annual Budget" value={formatCurrencyNPR(totalBudget)} helper="Planned allocation" />
        <MetricCard label="Average Team Size" value={averageTeamSize} helper="Per department" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
        <div className="surface-card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Department register</h2>
              <p className="mt-1 text-sm text-slate-500">Select a department to inspect its details.</p>
            </div>
            <p className="text-sm text-slate-500">{sortedDepartments.length} departments listed</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Head
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Workforce
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Location
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {sortedDepartments.map((department) => {
                  const isSelected = selectedDepartmentId === department.id

                  return (
                    <tr
                      key={department.id}
                      onClick={() => handleSelectDepartment(department.id)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-slate-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-6 py-4 align-top">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{department.name}</p>
                          <p className="mt-1 max-w-sm text-sm text-slate-500">{department.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-700">{department.headOfDepartment}</td>
                      <td className="px-6 py-4 align-top text-sm font-medium text-slate-900">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                          {department.employeeCount} people
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-700">
                        {formatCurrencyNPR(department.budget)}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-700">{department.location}</td>
                      <td className="px-6 py-4 align-top text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              startEdit(department)
                            }}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              requestDelete(department)
                            }}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`surface-card border ${selectedTheme?.panel || 'border-slate-200'} overflow-hidden`}>
          <div className={`h-1 w-full ${selectedTheme?.accent || 'bg-slate-500'}`} />
          <div className="p-6">
            {selectedDepartment ? (
              editingId === selectedDepartment.id ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Editing department</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">{selectedDepartment.name}</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Department Name</label>
                      <input
                        value={editForm.name}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Description</label>
                      <textarea
                        rows={4}
                        value={editForm.description}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Head of Department</label>
                        <input
                          value={editForm.headOfDepartment}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, headOfDepartment: event.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Location</label>
                        <input
                          value={editForm.location}
                          onChange={(event) => setEditForm((prev) => ({ ...prev, location: event.target.value }))}
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Employees</label>
                        <input
                          type="number"
                          value={editForm.employeeCount}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, employeeCount: event.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Budget</label>
                        <input
                          type="number"
                          value={editForm.budget}
                          onChange={(event) => setEditForm((prev) => ({ ...prev, budget: event.target.value }))}
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(selectedDepartment)}
                      className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <XMarkIcon className="mr-2 h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Department profile</p>
                    <div className="mt-3 flex items-start gap-3">
                      <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold ring-1 ${selectedTheme.badge}`}>
                        {selectedDepartment.name.slice(0, 1)}
                      </span>
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-900">{selectedDepartment.name}</h2>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{selectedDepartment.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DetailTile label="Head of Department" value={selectedDepartment.headOfDepartment} />
                    <DetailTile label="Location" value={selectedDepartment.location} />
                    <DetailTile label="Employees" value={String(selectedDepartment.employeeCount)} />
                    <DetailTile label="Budget" value={formatCurrencyNPR(selectedDepartment.budget)} />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Operational note</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      This record is part of the formal department registry. Updates to leadership, staffing, or budget are reflected across the HR dashboard.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(selectedDepartment)}
                      className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <PencilIcon className="mr-2 h-4 w-4" />
                      Edit department
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDelete(selectedDepartment)}
                      className="inline-flex items-center rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Delete department
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="py-10 text-center text-sm text-slate-500">No departments available.</div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={Boolean(pendingDeleteDepartment)}
        title="Delete Department"
        message={
          pendingDeleteDepartment
            ? `Are you sure you want to delete ${pendingDeleteDepartment.name}? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          showWarning('Delete Cancelled', 'Department deletion was cancelled.')
          setPendingDeleteDepartment(null)
        }}
        tone="danger"
      />
    </div>
  )
}

const MetricCard = ({ label, value, helper }) => (
  <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
    <svg className="absolute -right-8 -top-8 h-32 w-32 text-slate-200 opacity-30" fill="currentColor" viewBox="0 0 200 200">
      <path d="M50,50 Q80,20 110,50 Q140,80 110,110 Q80,140 50,110 Q20,80 50,50" />
    </svg>
    <svg className="absolute -bottom-6 -left-6 h-24 w-24 text-slate-200 opacity-20" fill="currentColor" viewBox="0 0 200 200">
      <path d="M50,50 Q80,20 110,50 Q140,80 110,110 Q80,140 50,110 Q20,80 50,50" />
    </svg>
    <div className="relative">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
  </div>
)

const DetailTile = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
    <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
  </div>
)

export default Departments
