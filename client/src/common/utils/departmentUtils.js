export const getDepartmentTheme = (departmentName) => {
  const name = departmentName.toLowerCase()

  if (name.includes('engineering')) {
    return {
      badge: 'bg-blue-50 text-blue-700 ring-blue-200',
      accent: 'bg-blue-500',
      panel: 'border-blue-200'
    }
  }
  if (name.includes('marketing')) {
    return {
      badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      accent: 'bg-emerald-500',
      panel: 'border-emerald-200'
    }
  }
  if (name.includes('sales')) {
    return {
      badge: 'bg-amber-50 text-amber-700 ring-amber-200',
      accent: 'bg-amber-500',
      panel: 'border-amber-200'
    }
  }
  if (name.includes('hr') || name.includes('human')) {
    return {
      badge: 'bg-rose-50 text-rose-700 ring-rose-200',
      accent: 'bg-rose-500',
      panel: 'border-rose-200'
    }
  }
  if (name.includes('finance')) {
    return {
      badge: 'bg-violet-50 text-violet-700 ring-violet-200',
      accent: 'bg-violet-500',
      panel: 'border-violet-200'
    }
  }

  return {
    badge: 'bg-slate-100 text-slate-700 ring-slate-200',
    accent: 'bg-slate-500',
    panel: 'border-slate-200'
  }
}

export const formatCurrencyNPR = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0
  }).format(Number(value || 0))
