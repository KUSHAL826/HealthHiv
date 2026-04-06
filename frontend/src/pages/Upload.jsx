import { useState, useRef } from 'react'
import { UploadCloud, FilePlus, CheckCircle, AlertCircle, Download } from 'lucide-react'
import api from '../utils/api'

const INITIAL_FORM = {
  date: new Date().toISOString().split('T')[0],
  heartRateAvg: '', steps: '', sleepHours: '', caloriesBurned: '',
  weightKg: '', systolic: '', diastolic: '', activeMinutes: '',
  caloriesConsumed: '', waterLitres: '', oxygenSaturation: '', bloodGlucose: '',
  notes: ''
}

export default function Upload() {
  const [tab, setTab] = useState('manual')
  const [form, setForm] = useState(INITIAL_FORM)
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState(null) // { type: 'success'|'error', msg }
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleManualSubmit = async e => {
    e.preventDefault()
    setLoading(true); setStatus(null)
    try {
      const payload = {
        date: form.date,
        heartRate: form.heartRateAvg ? { avg: +form.heartRateAvg } : undefined,
        steps: form.steps ? +form.steps : undefined,
        sleepHours: form.sleepHours ? +form.sleepHours : undefined,
        caloriesBurned: form.caloriesBurned ? +form.caloriesBurned : undefined,
        weightKg: form.weightKg ? +form.weightKg : undefined,
        bloodPressure: (form.systolic || form.diastolic) ? {
          systolic: +form.systolic || undefined,
          diastolic: +form.diastolic || undefined
        } : undefined,
        activeMinutes: form.activeMinutes ? +form.activeMinutes : undefined,
        caloriesConsumed: form.caloriesConsumed ? +form.caloriesConsumed : undefined,
        waterLitres: form.waterLitres ? +form.waterLitres : undefined,
        oxygenSaturation: form.oxygenSaturation ? +form.oxygenSaturation : undefined,
        bloodGlucose: form.bloodGlucose ? +form.bloodGlucose : undefined,
        notes: form.notes || undefined
      }
      // Remove undefined keys
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])

      await api.post('/health/entry', payload)
      setStatus({ type: 'success', msg: `Entry saved for ${form.date}` })
      setForm({ ...INITIAL_FORM, date: form.date })
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || 'Failed to save entry' })
    } finally { setLoading(false) }
  }

  const handleFileUpload = async e => {
    e.preventDefault()
    if (!file) return setStatus({ type: 'error', msg: 'Please select a CSV file' })
    setLoading(true); setStatus(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/health/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setStatus({ type: 'success', msg: res.data.message })
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || 'Upload failed' })
    } finally { setLoading(false) }
  }

  const downloadSample = () => {
    const csv = `date,heart_rate_avg,steps,calories_burned,sleep_hours,weight_kg,systolic,diastolic,active_minutes,calories_consumed,water_litres,oxygen_saturation,blood_glucose
2024-01-01,68,7823,2145,7.2,71.2,118,76,42,2100,2.1,97,92
2024-01-02,71,6234,1987,6.8,71.4,120,78,35,2300,1.8,98,95
2024-01-03,65,9456,2312,7.5,71.1,115,74,58,1950,2.4,97,88`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'sample_health_data.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const Field = ({ label, name, type = 'number', placeholder, unit, span = 1 }) => (
    <div className={span === 2 ? 'md:col-span-2' : ''}>
      <label className="label">{label}{unit && <span className="text-slate-600 ml-1 normal-case font-normal">({unit})</span>}</label>
      <input name={name} type={type} value={form[name]} onChange={handleChange}
        placeholder={placeholder} step="any" min="0"
        className="input-field" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Add Health Data</h1>
        <p className="text-slate-400 text-sm mt-1">Log metrics manually or upload a CSV export from your wearable</p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-slate-800 rounded-xl p-1">
        <button onClick={() => setTab('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'manual' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
          <FilePlus size={16} /> Manual Entry
        </button>
        <button onClick={() => setTab('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'upload' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
          <UploadCloud size={16} /> CSV Upload
        </button>
      </div>

      {/* Status message */}
      {status && (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${
          status.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {status.type === 'success'
            ? <CheckCircle size={17} className="flex-shrink-0 mt-0.5" />
            : <AlertCircle size={17} className="flex-shrink-0 mt-0.5" />}
          {status.msg}
        </div>
      )}

      {/* Manual Entry Tab */}
      {tab === 'manual' && (
        <div className="card">
          <form onSubmit={handleManualSubmit} className="space-y-5">
            <div>
              <label className="label">Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange}
                required className="input-field" />
            </div>

            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">❤️ Cardiovascular</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Heart Rate" name="heartRateAvg" placeholder="72" unit="bpm" />
                <Field label="Systolic BP" name="systolic" placeholder="120" unit="mmHg" />
                <Field label="Diastolic BP" name="diastolic" placeholder="80" unit="mmHg" />
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">🏃 Activity</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Steps" name="steps" placeholder="8000" unit="steps" />
                <Field label="Active Minutes" name="activeMinutes" placeholder="45" unit="min" />
                <Field label="Calories Burned" name="caloriesBurned" placeholder="2200" unit="kcal" />
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">🌙 Sleep</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Sleep Duration" name="sleepHours" placeholder="7.5" unit="hrs" />
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">⚖️ Body & Nutrition</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Weight" name="weightKg" placeholder="70.5" unit="kg" />
                <Field label="Calories Consumed" name="caloriesConsumed" placeholder="2000" unit="kcal" />
                <Field label="Water Intake" name="waterLitres" placeholder="2.5" unit="litres" />
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">🩸 Vitals</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Blood Glucose" name="bloodGlucose" placeholder="95" unit="mg/dL" />
                <Field label="SpO₂" name="oxygenSaturation" placeholder="98" unit="%" />
              </div>
            </div>

            <div>
              <label className="label">Notes (optional)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange}
                placeholder="How are you feeling today?" rows={2}
                className="input-field resize-none" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Saving…' : 'Save Entry'}
            </button>
          </form>
        </div>
      )}

      {/* CSV Upload Tab */}
      {tab === 'upload' && (
        <div className="card space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-300 text-sm font-medium">CSV Format Requirements</p>
              <button onClick={downloadSample}
                className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 text-xs font-medium">
                <Download size={13} /> Download Sample
              </button>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 font-mono text-xs text-slate-400 overflow-x-auto">
              date, heart_rate_avg, steps, calories_burned, sleep_hours,<br />
              weight_kg, systolic, diastolic, active_minutes,<br />
              calories_consumed, water_litres, oxygen_saturation, blood_glucose
            </div>
            <p className="text-slate-500 text-xs mt-2">All columns except <code className="text-slate-400">date</code> are optional. Date format: YYYY-MM-DD</p>
          </div>

          <form onSubmit={handleFileUpload} className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                file ? 'border-brand-500/60 bg-brand-500/5' : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/40'
              }`}>
              <UploadCloud size={32} className={`mx-auto mb-2 ${file ? 'text-brand-400' : 'text-slate-600'}`} />
              {file
                ? <p className="text-brand-400 font-medium text-sm">{file.name}</p>
                : <>
                    <p className="text-slate-300 text-sm font-medium">Click to select a CSV file</p>
                    <p className="text-slate-500 text-xs mt-1">Max 5MB</p>
                  </>
              }
              <input ref={fileRef} type="file" accept=".csv"
                className="hidden"
                onChange={e => setFile(e.target.files[0] || null)} />
            </div>

            <button type="submit" disabled={loading || !file} className="btn-primary w-full">
              {loading ? 'Uploading…' : 'Upload CSV'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
