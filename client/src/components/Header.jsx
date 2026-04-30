import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bars3Icon,
  BellIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BellAlertIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { canAccessPath } from '../common/access/roleAccess'

const notifications = [
  {
    id: 1,
    type: 'success',
    title: 'Compensation Snapshot Ready',
    message: 'Monthly compensation metrics are ready in Reports.',
    time: '10 minutes ago',
    actionLabel: 'Open Reports',
    actionTo: '/reports'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Attendance Incomplete',
    message: '6 employees are still missing clock-out records for today.',
    time: '35 minutes ago',
    actionLabel: 'Review Attendance',
    actionTo: '/attendance'
  },
  {
    id: 3,
    type: 'info',
    title: 'New Department Request',
    message: 'A request for a Customer Success department is awaiting review.',
    time: '1 hour ago',
    actionLabel: 'Open Departments',
    actionTo: '/departments'
  }
]

const typeStyles = {
  success: {
    icon: CheckCircleIcon,
    border: 'border-green-200',
    iconColor: 'text-green-600',
    badge: 'bg-green-100 text-green-800'
  },
  warning: {
    icon: ExclamationTriangleIcon,
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-800'
  },
  info: {
    icon: InformationCircleIcon,
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800'
  }
}

const Header = ({ setSidebarOpen, isFullscreen, onToggleFullscreen }) => {
  const { user } = useAuth()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const searchInputRef = useRef(null)
  const visibleNotifications = (Array.isArray(notifications) ? notifications : []).filter((item) =>
    canAccessPath(user, item.actionTo)
  )

  useEffect(() => {
    const openNotifications = () => {
      setNotificationsOpen(true)
    }

    const focusSearch = () => {
      searchInputRef.current?.focus()
      searchInputRef.current?.select()
    }

    window.addEventListener('open-notifications-popup', openNotifications)
    window.addEventListener('focus-global-search', focusSearch)
    return () => {
      window.removeEventListener('open-notifications-popup', openNotifications)
      window.removeEventListener('focus-global-search', focusSearch)
    }
  }, [])

  const FullscreenIcon = isFullscreen ? ArrowsPointingInIcon : ArrowsPointingOutIcon

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          className="text-gray-500 hover:text-gray-600 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Search bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search employees, departments..."
              className="block w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm leading-5 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Right side items */}
        <div className="flex items-center space-x-4">
          {/* Fullscreen */}
          <button
            type="button"
            className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen (Shift+F)' : 'Enter fullscreen (Shift+F)'}
          >
            <FullscreenIcon className="h-6 w-6" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            aria-label="Open notifications"
          >
            <BellIcon className="h-6 w-6" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {visibleNotifications.length}
            </span>
          </button>
        </div>
      </div>

      {notificationsOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black /20"
            onClick={() => setNotificationsOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed right-4 top-20 z-50 w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-white sm:right-6 lg:right-8">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <BellAlertIcon className="h-5 w-5 text-indigo-600" />
                Notifications
              </h2>
              <button
                type="button"
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setNotificationsOpen(false)}
                aria-label="Close notifications"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-3 overflow-y-auto p-4">
              {visibleNotifications.map((item) => {
                const style = typeStyles[item.type] || typeStyles.info
                const Icon = style.icon

                return (
                  <div
                    key={item.id}
                    className={`rounded-lg border bg-white p-4 shadow-sm ${style.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`mt-0.5 h-5 w-5 ${style.iconColor}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}>
                            {item.time}
                          </span>
                          <Link
                            to={item.actionTo}
                            onClick={() => setNotificationsOpen(false)}
                            className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                          >
                            {item.actionLabel}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </header>
  )
}

export default Header