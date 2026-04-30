export const getDepartmentFormErrors = (form, departments) => {
  const next = {}

  if (!form.name.trim()) {
    next.name = 'Department name is required.'
  } else if (
    departments.some((item) => item.name.toLowerCase() === form.name.trim().toLowerCase())
  ) {
    next.name = 'Department name already exists.'
  }

  if (!form.description.trim()) next.description = 'Description is required.'
  if (!form.headOfDepartment.trim()) next.headOfDepartment = 'Head of department is required.'

  const count = Number(form.employeeCount)
  if (!form.employeeCount.trim()) {
    next.employeeCount = 'Employee count is required.'
  } else if (Number.isNaN(count) || count < 0) {
    next.employeeCount = 'Employee count must be zero or more.'
  }

  const budget = Number(form.budget)
  if (!form.budget.trim()) {
    next.budget = 'Budget is required.'
  } else if (Number.isNaN(budget) || budget <= 0) {
    next.budget = 'Budget must be greater than zero.'
  }

  if (!form.location.trim()) next.location = 'Location is required.'

  return next
}
