import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity, Footprints, Moon, Flame, Weight, Droplets,
  Wind, Gauge, Sparkles, RefreshCw, UploadCloud
} from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/dashboard/StatCard'
import HealthChart from '../components/dashboard/HealthChart'
import { round1, formatDateFull } from '../utils/formatters'

const RANGES = [
  { label: '7 days',  days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [summary, setSummary] = useState({})
  const [range, setRange] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true); setError('')
    try {
      const from = new Date(); from.setDate(from.getDate() - range)
      const [dataRes, sumRes] = await Promise.all([
        api.get(`/health/data?from=${from.toISOString()}&limit=200`),
        api.get('/health/summary')
      ])
      setEntries(dataRes.data.entries || [])
      setSummary(sumRes.data.summary || {})
    } catch (e) {
      setError('Failed to load data')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [range])

  const last = entries[entries.length - 1] || {}
  const avg = summary

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
            Good day, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {entries.length} entries • last updated {entries.length ? formatDateFull(last.date) : 'never'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Range selector */}
          <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
            {RANGES.map(r => (
              <button key={r.days} onClick={() => setRange(r.days)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  range === r.days ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
                }`}>
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={fetchData} className="btn-secondary flex items-center gap-2 text-sm py-2">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* No data CTA */}
      {!loading && entries.length === 0 && (
        <div className="card text-center py-12">
          <UploadCloud size={40} className="text-slate-600 mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-white mb-2">No health data yet</h3>
          <p className="text-slate-400 text-sm mb-5">Upload a CSV or add entries manually to see your dashboard.</p>
          <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
            <UploadCloud size={16} /> Add Health Data
          </Link>
        </div>
      )}

      {entries.length > 0 && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Activity} label="Avg Heart Rate" value={round1(avg.avgHeartRate)} unit="bpm"
              color="text-red-400" bg="bg-red-500/10" />
            <StatCard icon={Footprints} label="Avg Steps/Day" value={avg.avgSteps ? Math.round(avg.avgSteps).toLocaleString() : '—'} unit=""
              color="text-emerald-400" bg="bg-emerald-500/10" />
            <StatCard icon={Moon} label="Avg Sleep" value={round1(avg.avgSleep)} unit="hrs"
              color="text-violet-400" bg="bg-violet-500/10" />
            <StatCard icon={Flame} label="Avg Calories" value={avg.avgCaloriesBurned ? Math.round(avg.avgCaloriesBurned).toLocaleString() : '—'} unit="kcal"
              color="text-orange-400" bg="bg-orange-500/10" />
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Heart Rate */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-white flex items-center gap-2">
                  <Activity size={16} className="text-red-400" /> Heart Rate
                </h3>
                <span className="badge-warning">Normal: 60–100 bpm</span>
              </div>
              <HealthChart data={entries} dataKey="heartRate" color="#ef4444" unit="bpm"
                normalMax={100} normalMin={60} type="area" height={200} />
            </div>

            {/* Steps */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-white flex items-center gap-2">
                  <Footprints size={16} className="text-emerald-400" /> Daily Steps
                </h3>
                <span className="badge-good">Goal: 8,000+</span>
              </div>
              <HealthChart data={entries} dataKey="steps" color="#10b981" unit="steps"
                normalMin={8000} type="bar" height={200} />
            </div>

            {/* Sleep */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-white flex items-center gap-2">
                  <Moon size={16} className="text-violet-400" /> Sleep Duration
                </h3>
                <span className="badge-info">Normal: 7–9 hrs</span>
              </div>
              <HealthChart data={entries} dataKey="sleepHours" color="#8b5cf6" unit="hrs"
                normalMin={7} normalMax={9} type="area" height={200} />
            </div>

            {/* Calories */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-white flex items-center gap-2">
                  <Flame size={16} className="text-orange-400" /> Calories Burned
                </h3>
              </div>
              <HealthChart data={entries} dataKey="caloriesBurned" color="#f97316" unit="kcal"
                type="area" height={200} />
            </div>

            {/* Blood Pressure */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-white flex items-center gap-2">
                  <Gauge size={16} className="text-rose-400" /> Blood Pressure
                </h3>
                <span className="badge-warning">Systolic &lt;120</span>
              </div>
              <HealthChart data={entries} dataKey="bloodPressure" color="#f43f5e" unit="mmHg"
                normalMax={120} type="line" height={200} />
            </div>

            {/* Weight */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-white flex items-center gap-2">
                  <Weight size={16} className="text-cyan-400" /> Weight
                </h3>
              </div>
              <HealthChart data={entries} dataKey="weightKg" color="#06b6d4" unit="kg"
                type="line" height={200} />
            </div>

          </div>

          {/* AI Insights CTA */}
          <div className="card bg-gradient-to-br from-brand-950/60 to-slate-900 border-brand-500/20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-brand-400" />
                </div>
                <div>
                  <p className="font-display font-semibold text-white">AI Health Analysis</p>
                  <p className="text-slate-400 text-sm">Get personalized insights based on your data trends</p>
                </div>
              </div>
              <Link to="/insights" className="btn-primary flex items-center gap-2 text-sm">
                <Sparkles size={15} /> Generate Insights
              </Link>
            </div>
          </div>
        </>
      )}

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
    </div>
  )
}
