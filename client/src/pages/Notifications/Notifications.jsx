import { Link } from 'react-router-dom'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline'

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

export default function Notifications() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-6 text-gray-900 flex items-center gap-3">
          <BellAlertIcon className="h-8 w-8 text-indigo-600" />
          Notifications
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Review recent HR updates and jump directly to the relevant page.
        </p>
      </div>

      <div className="space-y-4">
        {notifications.map((item) => {
          const style = typeStyles[item.type] || typeStyles.info
          const Icon = style.icon

          return (
            <div
              key={item.id}
              className={`rounded-lg border bg-white p-5 shadow-sm ${style.border}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 ${style.iconColor}`} />
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">{item.title}</h2>
                    <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}>
                      {item.time}
                    </span>
                  </div>
                </div>

                <Link
                  to={item.actionTo}
                  className="shrink-0 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  {item.actionLabel}
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
