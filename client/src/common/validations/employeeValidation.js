export const employeeValidators = {
  firstName: (value) => {
    if (!value.trim()) return 'First name is required.'
    if (!/^[a-zA-Z\s'-]{2,40}$/.test(value.trim())) {
      return 'Enter a valid first name (2 to 40 alphabetic characters).'
    }
    return ''
  },
  lastName: (value) => {
    if (!value.trim()) return 'Last name is required.'
    if (!/^[a-zA-Z\s'-]{2,40}$/.test(value.trim())) {
      return 'Enter a valid last name (2 to 40 alphabetic characters).'
    }
    return ''
  },
  email: (value) => {
    if (!value.trim()) return 'Official email address is required.'
    if (!/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(value.trim())) {
      return 'Enter a valid official email address.'
    }
    return ''
  },
  phone: (value) => {
    if (!value.trim()) return 'Phone number is required.'
    if (!/^\+?[0-9\s()-]{10,16}$/.test(value.trim())) {
      return 'Enter a valid phone number (10 to 16 digits, optional symbols).'
    }
    return ''
  },
  department: (value) => (!value ? 'Please select a department.' : ''),
  position: (value) => {
    if (!value.trim()) return 'Position is required.'
    if (value.trim().length < 2) return 'Position must be at least 2 characters.'
    return ''
  },
  salary: (value) => {
    if (!String(value).trim()) return 'Annual salary is required.'
    const num = Number(value)
    if (Number.isNaN(num) || num < 12000) return 'Annual salary must be at least 12,000.'
    return ''
  },
  joinDate: (value) => {
    if (!value) return 'Join date is required.'
    const selected = new Date(value)
    if (Number.isNaN(selected.getTime())) return 'Join date is invalid.'
    const today = new Date()
    if (selected > today) return 'Join date cannot be in the future.'
    return ''
  },
  dateOfBirth: (value) => {
    if (!value) return 'Date of birth is required.'
    const dob = new Date(value)
    if (Number.isNaN(dob.getTime())) return 'Date of birth is invalid.'
    const now = new Date()
    const age = now.getFullYear() - dob.getFullYear()
    if (age < 18) return 'Employee must be at least 18 years old.'
    return ''
  },
  emergencyContactPhone: (value) => {
    if (!value) return ''
    if (!/^\+?[0-9\s()-]{10,16}$/.test(value.trim())) {
      return 'Enter a valid emergency contact phone number.'
    }
    return ''
  }
}

export const getEmployeeFormErrors = (formData) => {
  const nextErrors = {}
  Object.entries(employeeValidators).forEach(([key, validator]) => {
    nextErrors[key] = validator(formData[key])
  })
  return nextErrors
}
