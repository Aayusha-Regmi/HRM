export const ROLE_NAMES = {
  ADMIN: 'admin',
  HR_MANAGER: 'hr_manager',
  EMPLOYEE: 'employee',
}

export const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', roles: [ROLE_NAMES.ADMIN, ROLE_NAMES.HR_MANAGER, ROLE_NAMES.EMPLOYEE] },
  { name: 'Employees', href: '/employees', roles: [ROLE_NAMES.ADMIN, ROLE_NAMES.HR_MANAGER] },
  { name: 'Departments', href: '/departments', roles: [ROLE_NAMES.ADMIN, ROLE_NAMES.HR_MANAGER] },
  { name: 'Attendance', href: '/attendance', roles: [ROLE_NAMES.ADMIN, ROLE_NAMES.HR_MANAGER, ROLE_NAMES.EMPLOYEE] },
  { name: 'Recruitment', href: '/recruitment', roles: [ROLE_NAMES.ADMIN, ROLE_NAMES.HR_MANAGER] },
  { name: 'Leave Management', href: '/leave-management', roles: [ROLE_NAMES.ADMIN, ROLE_NAMES.HR_MANAGER] },
  { name: 'Reports', href: '/reports', roles: [ROLE_NAMES.ADMIN, ROLE_NAMES.HR_MANAGER] },
  { name: 'Settings', href: '/settings', roles: [ROLE_NAMES.ADMIN] },
]

export const getUserRole = (user) => {
  if (!user) return ROLE_NAMES.EMPLOYEE
  if (user.is_admin) return ROLE_NAMES.ADMIN
  if (user.role) return user.role
  return ROLE_NAMES.EMPLOYEE
}

export const canAccessPath = (user, path) => {
  const role = getUserRole(user)
  const item = NAV_ITEMS.find((entry) => entry.href === path)
  if (!item) return true
  return item.roles.includes(role)
}

export const filterNavByAccess = (user, items) => {
  const role = getUserRole(user)
  return (Array.isArray(items) ? items : []).filter((item) =>
    Array.isArray(item.roles) ? item.roles.includes(role) : true
  )
}
