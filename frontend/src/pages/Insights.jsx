import { useState, useEffect } from 'react'
import {
  Sparkles, RefreshCw, AlertTriangle, TrendingUp, TrendingDown,
  Minus, CheckCircle, Info, XCircle, Lightbulb, UploadCloud
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { formatDateFull, trendColor, trendIcon } from '../utils/formatters'
import clsx from 'clsx'

const severityIcon = { critical: XCircle, warning: AlertTriangle, info: Info, good: CheckCircle }
const severityStyle = {
  critical: 'bg-red-500/10 border-red-500/20 text-red-300',
  warning:  'bg-amber-500/10 border-amber-500/20 text-amber-300',
  info:     'bg-brand-500/10 border-brand-500/20 text-brand-300',
  good:     'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
}
const severityBadge = {
  critical: 'badge-critical',
  warning:  'badge-warning',
  info:     'badge-info',
  good:     'badge-good',
}

const trendDirIcon = { improving: TrendingUp, declining: TrendingDown, stable: Minus }

export default function Insights() {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [days, setDays] = useState(30)

  useEffect(() => {
    api.get('/insights/latest')
      .then(r => setInsight(r.data.insight))
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const generate = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get(`/insights/generate?days=${days}`)
      setInsight(res.data.insight)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate insights')
    } finally { setLoading(false) }
  }

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Sparkles size={26} className="text-brand-400" /> AI Health Insights
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Python-powered anomaly detection & trend analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select value={days} onChange={e => setDays(+e.target.value)} className="input-field w-auto py-2 text-sm">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={generate} disabled={loading}
            className="btn-primary flex items-center gap-2 text-sm">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Analysing…</>
              : <><RefreshCw size={15} /> {insight ? 'Regenerate' : 'Generate'}</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
          {error.includes('enough data') && (
            <Link to="/upload" className="ml-auto text-red-300 underline hover:no-underline">Add data →</Link>
          )}
        </div>
      )}

      {/* No insights yet */}
      {!insight && !loading && !error && (
        <div className="card text-center py-14">
          <Sparkles size={40} className="text-slate-600 mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-white mb-2">No insights yet</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
            Add at least 3 days of health data, then click Generate to run your AI analysis.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/upload" className="btn-secondary flex items-center gap-2 text-sm">
              <UploadCloud size={15} /> Add Data
            </Link>
            <button onClick={generate} disabled={loading} className="btn-primary flex items-center gap-2 text-sm">
              <Sparkles size={15} /> Generate Insights
            </button>
          </div>
        </div>
      )}

      {insight && (
        <>
          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Analysis from {formatDateFull(insight.period?.from)} to {formatDateFull(insight.period?.to)}</span>
            <span>Generated {formatDateFull(insight.generatedAt)}</span>
          </div>

          {/* Summary */}
          <div className="card bg-gradient-to-br from-brand-950/40 to-slate-900 border-brand-500/20">
            <h2 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-brand-400" /> Health Summary
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">{insight.summary}</p>
          </div>

          {/* Alerts */}
          {insight.alerts?.length > 0 && (
            <section>
              <h2 className="font-display font-semibold text-white mb-3">
                🚨 Alerts & Anomalies
                <span className="ml-2 text-sm font-normal text-slate-400">({insight.alerts.length})</span>
              </h2>
              <div className="space-y-2.5">
                {insight.alerts.map((alert, i) => {
                  const Icon = severityIcon[alert.severity] || Info
                  return (
                    <div key={i} className={clsx('flex items-start gap-3 px-4 py-3 rounded-xl border text-sm', severityStyle[alert.severity])}>
                      <Icon size={17} className="flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p>{alert.message}</p>
                        {alert.date && <p className="text-xs opacity-60 mt-0.5">{formatDateFull(alert.date)}</p>}
                      </div>
                      <span className={clsx('flex-shrink-0', severityBadge[alert.severity])}>
                        {alert.severity}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Trends */}
          {insight.trends?.length > 0 && (
            <section>
              <h2 className="font-display font-semibold text-white mb-3">📈 Trends</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {insight.trends.map((t, i) => {
                  const DirIcon = trendDirIcon[t.direction] || Minus
                  return (
                    <div key={i} className="card-hover flex items-center gap-3">
                      <div className={clsx(
                        'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                        t.direction === 'improving' ? 'bg-emerald-500/10' :
                        t.direction === 'declining' ? 'bg-red-500/10' : 'bg-slate-700'
                      )}>
                        <DirIcon size={16} className={trendColor(t.direction)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-200 text-sm font-medium leading-snug">{t.message}</p>
                        <span className={clsx('text-xs font-semibold', trendColor(t.direction))}>
                          {trendIcon(t.direction)} {t.direction}
                          {t.changePercent != null && ` (${t.changePercent > 0 ? '+' : ''}${t.changePercent}%)`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Recommendations */}
          {insight.recommendations?.length > 0 && (
            <section>
              <h2 className="font-display font-semibold text-white mb-3">💡 Recommendations</h2>
              <div className="space-y-2.5">
                {insight.recommendations.map((rec, i) => (
                  <div key={i} className="card-hover flex items-start gap-3">
                    <div className="w-7 h-7 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lightbulb size={14} className="text-amber-400" />
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Stats table */}
          {insight.rawAnalysis?.stats && (
            <section>
              <h2 className="font-display font-semibold text-white mb-3">📊 Metric Statistics</h2>
              <div className="card overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {['Metric', 'Mean', 'Min', 'Max', 'Std Dev'].map(h => (
                        <th key={h} className="pb-3 text-slate-400 font-semibold text-xs uppercase tracking-wider pr-6">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(insight.rawAnalysis.stats).map(([key, s]) => (
                      <tr key={key} className="border-b border-slate-800/60 last:border-0">
                        <td className="py-2.5 pr-6 text-slate-300 font-medium capitalize">{key.replace(/_/g, ' ')}</td>
                        <td className="py-2.5 pr-6 text-white font-mono">{s.mean}</td>
                        <td className="py-2.5 pr-6 text-slate-400 font-mono">{s.min}</td>
                        <td className="py-2.5 pr-6 text-slate-400 font-mono">{s.max}</td>
                        <td className="py-2.5 text-slate-500 font-mono">±{s.std}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
