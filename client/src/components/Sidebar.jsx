import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ClockIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  CogIcon,
  XMarkIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { filterNavByAccess } from '../common/access/roleAccess'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'hr_manager', 'employee'] },
  { name: 'Employees', href: '/employees', icon: UsersIcon, roles: ['admin', 'hr_manager'] },
  { name: 'Departments', href: '/departments', icon: BuildingOfficeIcon, roles: ['admin', 'hr_manager'] },
  { name: 'Attendance', href: '/attendance', icon: ClockIcon, roles: ['admin', 'hr_manager', 'employee'] },
  { name: 'Recruitment', href: '/recruitment', icon: BriefcaseIcon, roles: ['admin', 'hr_manager'] },
  { name: 'Leave Management', href: '/leave-management', icon: CalendarDaysIcon, roles: ['admin', 'hr_manager'] },
  { name: 'Reports', href: '/reports', icon: DocumentTextIcon, roles: ['admin', 'hr_manager'] },
  { name: 'Settings', href: '/settings', icon: CogIcon, roles: ['admin'] },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Sidebar = ({ open, setOpen, collapsed, onLogout }) => {
  const location = useLocation()
  const { user } = useAuth()
  const visibleNavigation = filterNavByAccess(user, navigation)
  const profileLabel = user?.username || 'User'

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div
        className={classNames(
          'fixed inset-0 z-50 lg:hidden',
          open ? 'block' : 'hidden'
        )}
        onClick={() => setOpen(false)}
      >
        <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
      </div>

      {/* Sidebar */}
      <div
        className={classNames(
          'fixed inset-y-0 left-0 z-50 bg-gray-900 transition-all duration-300 ease-in-out',
          collapsed ? 'w-20 lg:w-20' : 'w-64 lg:w-64',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        <div className={classNames('flex h-16 items-center justify-between px-4', collapsed ? 'lg:justify-center' : 'lg:justify-start')}>
          <div className="flex items-center">
            <h1 className={classNames('text-xl font-bold text-white transition-opacity duration-300', collapsed ? 'lg:hidden' : 'lg:block')}>
              HR Manager
            </h1>
            <h1 className={classNames('text-xl font-bold text-white transition-opacity duration-300', collapsed ? 'hidden lg:block' : 'hidden')}>
              HR
            </h1>
          </div>
          <button
            type="button"
            className="text-gray-300 hover:text-white lg:hidden"
            onClick={() => setOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(100%-4rem)] flex-col justify-between px-3 pb-4">
          <nav className="mt-8">
            <ul role="list" className="space-y-2">
              {(Array.isArray(visibleNavigation) ? visibleNavigation : []).map((item) => {
                const isActive =
                  location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      title={collapsed ? item.name : ''}
                      className={classNames(
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'group flex items-center rounded-md p-2 text-sm leading-6 font-semibold',
                        collapsed ? 'justify-center' : 'gap-x-3'
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <item.icon className="h-6 w-6 shrink-0" />
                      <span className={classNames(collapsed ? 'hidden' : 'block')}>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="space-y-2 border-t border-gray-800 pt-4">
            <button
              type="button"
              title={collapsed ? 'Profile' : ''}
              className={classNames(
                'w-full rounded-md p-2 text-gray-300 transition hover:bg-gray-800 hover:text-white',
                collapsed ? 'flex justify-center' : 'flex items-center gap-x-3'
              )}
            >
              <UserCircleIcon className="h-6 w-6 shrink-0" />
              <span className={classNames('text-sm font-semibold', collapsed ? 'hidden' : 'block')}>{profileLabel}</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              title={collapsed ? 'Logout' : ''}
              className={classNames(
                'w-full rounded-md p-2 text-rose-200 transition hover:bg-rose-500/20 hover:text-rose-100',
                collapsed ? 'flex justify-center' : 'flex items-center gap-x-3'
              )}
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6 shrink-0" />
              <span className={classNames('text-sm font-semibold', collapsed ? 'hidden' : 'block')}>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar