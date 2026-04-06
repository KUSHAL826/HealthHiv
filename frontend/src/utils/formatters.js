import { format, parseISO } from 'date-fns'

export const formatDate = (d) => {
  try { return format(typeof d === 'string' ? parseISO(d) : new Date(d), 'MMM d') }
  catch { return d }
}

export const formatDateFull = (d) => {
  try { return format(typeof d === 'string' ? parseISO(d) : new Date(d), 'MMM d, yyyy') }
  catch { return d }
}

export const round1 = (v) => v != null ? Math.round(v * 10) / 10 : '—'

export const METRIC_META = {
  heart_rate_avg: { label: 'Heart Rate', unit: 'bpm',  color: '#ef4444', normalMin: 60, normalMax: 100 },
  steps:          { label: 'Steps',      unit: '',     color: '#10b981', normalMin: 8000, normalMax: null },
  sleep_hours:    { label: 'Sleep',      unit: 'hrs',  color: '#8b5cf6', normalMin: 7, normalMax: 9 },
  calories_burned:{ label: 'Calories Burned', unit: 'kcal', color: '#f97316', normalMin: 1600, normalMax: null },
  weight_kg:      { label: 'Weight',     unit: 'kg',   color: '#06b6d4', normalMin: null, normalMax: null },
  bp_systolic:    { label: 'Systolic BP',unit: 'mmHg', color: '#f43f5e', normalMin: 90, normalMax: 120 },
  bp_diastolic:   { label: 'Diastolic BP',unit:'mmHg', color: '#fb7185', normalMin: 60, normalMax: 80 },
  oxygen_saturation:{ label: 'SpO₂',    unit: '%',    color: '#22d3ee', normalMin: 95, normalMax: null },
  blood_glucose:  { label: 'Blood Glucose', unit: 'mg/dL', color: '#a78bfa', normalMin: 70, normalMax: 140 },
  water_litres:   { label: 'Water',      unit: 'L',    color: '#38bdf8', normalMin: 2, normalMax: null },
}

export const severityColor = (s) => ({
  critical: 'text-red-400',
  warning:  'text-amber-400',
  info:     'text-brand-400',
  good:     'text-emerald-400',
}[s] || 'text-slate-400')

export const trendIcon = (dir) => ({
  improving: '↑',
  declining: '↓',
  stable:    '→',
}[dir] || '→')

export const trendColor = (dir) => ({
  improving: 'text-emerald-400',
  declining: 'text-red-400',
  stable:    'text-slate-400',
}[dir] || 'text-slate-400')
