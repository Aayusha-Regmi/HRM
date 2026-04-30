import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const NotificationContext = createContext(null)

const TYPE_STYLES = {
  success: 'border-green-300 bg-green-50 text-green-800',
  error: 'border-red-300 bg-red-50 text-red-800',
  warning: 'border-orange-300 bg-orange-50 text-orange-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800'
}

const TYPE_LABELS = {
  success: 'Success',
  error: 'Alert',
  warning: 'Warning',
  info: 'Info'
}

const TYPE_DEFAULT_MESSAGES = {
  success: 'Action completed successfully.',
  error: 'Something went wrong. Please try again.',
  warning: 'Please review this before continuing.',
  info: 'Here is an update for you.'
}

const toShortMessage = (value, fallback) => {
  const text = typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
  const source = text || fallback
  const firstSentence = source.split(/[.!?]\s/)[0]?.trim() || source
  return firstSentence.length > 110 ? `${firstSentence.slice(0, 107).trimEnd()}...` : firstSentence
}

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null)

  const dismiss = useCallback(() => {
    setNotification(null)
  }, [])

  const notify = useCallback((type, title, message, timeout = 3500) => {
    const safeType = TYPE_STYLES[type] ? type : 'info'
    const normalizedTitle = toShortMessage(title, TYPE_LABELS[safeType])
    const normalizedMessage = toShortMessage(message, TYPE_DEFAULT_MESSAGES[safeType])

    setNotification({ type: safeType, title: normalizedTitle, message: normalizedMessage })
    if (timeout > 0) {
      window.setTimeout(() => {
        setNotification((current) => (current?.message === normalizedMessage ? null : current))
      }, timeout)
    }
  }, [])

  const value = useMemo(
    () => ({
      notification,
      dismiss,
      showSuccess: (title, message, timeout) => notify('success', title, message, timeout),
      showError: (title, message, timeout) => notify('error', title, message, timeout),
      showWarning: (title, message, timeout) => notify('warning', title, message, timeout),
      showInfo: (title, message, timeout) => notify('info', title, message, timeout)
    }),
    [notification, dismiss, notify]
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

export const getNotificationStyle = (type) => TYPE_STYLES[type] || TYPE_STYLES.info
