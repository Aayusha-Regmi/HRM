import { useEffect, useState } from 'react'
import { BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { getCompanySettings, updateCompanySettings } from '../../api/hrmApi'
import { useNotification } from '../../context/NotificationContext'

const parseWorkingDays = (value) => (value || '').split(',').map((d) => d.trim()).filter(Boolean)

const Settings = () => {
  const { showNotification } = useNotification()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    working_hours_start: '09:00',
    working_hours_end: '17:00',
    working_days: 'monday,tuesday,wednesday,thursday,friday',
    payroll_frequency: 'monthly',
    currency: 'USD',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCompanySettings()
        setSettings(data)
      } catch {
        showNotification('error', 'Could not load settings.')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [showNotification])

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const toggleWorkingDay = (day) => {
    const current = parseWorkingDays(settings.working_days)
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day]

    handleInputChange('working_days', updated.join(','))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updated = await updateCompanySettings(settings)
      setSettings(updated)
      showNotification('success', 'Settings saved.')
    } catch {
      showNotification('error', 'Failed to save settings.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="text-sm text-slate-600">Loading settings...</div>
  }

  const activeDays = parseWorkingDays(settings.working_days)

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-6 text-gray-900">Settings</h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">Manage persistent company settings.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <BuildingOfficeIcon className="h-5 w-5 text-sky-600" />
          <h2 className="text-lg font-semibold text-slate-900">Company Profile</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Company Email</label>
            <input
              type="email"
              value={settings.company_email}
              onChange={(e) => handleInputChange('company_email', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              value={settings.company_phone || ''}
              onChange={(e) => handleInputChange('company_phone', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Company Address</label>
          <textarea
            rows={3}
            value={settings.company_address || ''}
            onChange={(e) => handleInputChange('company_address', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Working Hours Start</label>
            <input
              type="time"
              value={settings.working_hours_start || '09:00'}
              onChange={(e) => handleInputChange('working_hours_start', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Working Hours End</label>
            <input
              type="time"
              value={settings.working_hours_end || '17:00'}
              onChange={(e) => handleInputChange('working_hours_end', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payroll Frequency</label>
            <select
              value={settings.payroll_frequency || 'monthly'}
              onChange={(e) => handleInputChange('payroll_frequency', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Working Days</label>
          <div className="flex flex-wrap gap-3">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
              <label key={day} className="flex items-center">
                <input
                  type="checkbox"
                  checked={activeDays.includes(day)}
                  onChange={() => toggleWorkingDay(day)}
                  className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{day}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-70"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

export default Settings
