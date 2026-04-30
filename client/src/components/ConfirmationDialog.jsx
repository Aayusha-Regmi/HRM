const ConfirmationDialog = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  tone = 'danger'
}) => {
  if (!open) {
    return null
  }

  const confirmBtnClass =
    tone === 'danger'
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gray-900/40" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmBtnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog
