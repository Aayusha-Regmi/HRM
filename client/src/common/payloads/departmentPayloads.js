export const buildCreateDepartmentPayload = (form) => ({
  name: form.name.trim(),
  description: form.description.trim(),
  head_of_department: form.headOfDepartment.trim(),
  location: form.location.trim(),
  employee_count: Number(form.employeeCount),
  budget: Number(form.budget)
})

export const buildUpdateDepartmentPayload = (editForm) => ({
  ...editForm,
  employeeCount: Number(editForm.employeeCount),
  budget: Number(editForm.budget)
})
