export const formatHours = (clockIn, clockOut) => {
  if (!clockIn || !clockOut) return 0

  const [inHour, inMin] = clockIn.split(':').map(Number)
  const [outHour, outMin] = clockOut.split(':').map(Number)
  const start = inHour * 60 + inMin
  const end = outHour * 60 + outMin
  if (end <= start) return 0
  return Number(((end - start) / 60).toFixed(2))
}

export const to12Hour = (value) => {
  if (!value) return '-'
  const [hours, minutes] = value.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const normalized = hours % 12 || 12
  return `${normalized}:${String(minutes).padStart(2, '0')} ${period}`
}

export const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatSelectedDate = (value) => {
  if (!value) return 'No date selected'

  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
