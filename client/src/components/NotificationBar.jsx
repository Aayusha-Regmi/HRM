import { XMarkIcon } from '@heroicons/react/24/outline'
import { getNotificationStyle, useNotification } from '../context/NotificationContext'

const NotificationBar = () => {
  const { notification, dismiss } = useNotification()

  if (!notification) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-50 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div
          className={`pointer-events-auto flex items-start justify-between rounded-md border px-4 py-3 shadow-sm ${getNotificationStyle(
            notification.type
          )} cursor-pointer`}
          role="status"
          aria-live="polite"
          onClick={() => window.dispatchEvent(new Event('open-notifications-popup'))}
        >
          <div>
            <p className="text-sm font-semibold leading-5">{notification.title}</p>
            <p className="mt-1 text-sm leading-5 opacity-95">{notification.message}</p>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              dismiss()
            }}
            className="ml-4 rounded p-1 hover:bg-black/5"
            aria-label="Dismiss notification"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationBar
