import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { formatDate } from '../../utils/formatters'

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 shadow-xl text-sm">
      <p className="text-slate-400 mb-1">{formatDate(label)}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.value?.toFixed(1)} {unit || ''}
        </p>
      ))}
    </div>
  )
}

export default function HealthChart({
  data, dataKey, color = '#289eff', label, unit,
  type = 'area', normalMax, normalMin, height = 200
}) {
  if (!data?.length) return (
    <div className="h-40 flex items-center justify-center text-slate-600 text-sm">No data available</div>
  )

  const formatted = data.map(d => ({
    date: d.date,
    value: typeof d[dataKey] === 'object' ? d[dataKey]?.avg : d[dataKey]
  })).filter(d => d.value != null)

  const common = {
    data: formatted,
    margin: { top: 4, right: 4, bottom: 0, left: -20 }
  }

  const axisProps = {
    stroke: 'transparent',
    tick: { fill: '#475569', fontSize: 11, fontFamily: 'DM Sans' }
  }

  const tooltipEl = <Tooltip content={<CustomTooltip unit={unit} />} />

  const gridEl = <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart {...common}>
            {gridEl}
            <XAxis dataKey="date" tickFormatter={formatDate} {...axisProps} />
            <YAxis {...axisProps} />
            {tooltipEl}
            {normalMax && <ReferenceLine y={normalMax} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />}
            {normalMin && <ReferenceLine y={normalMin} stroke="#f97316" strokeDasharray="4 4" strokeWidth={1} />}
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={20} />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart {...common}>
            {gridEl}
            <XAxis dataKey="date" tickFormatter={formatDate} {...axisProps} />
            <YAxis {...axisProps} />
            {tooltipEl}
            {normalMax && <ReferenceLine y={normalMax} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />}
            {normalMin && <ReferenceLine y={normalMin} stroke="#f97316" strokeDasharray="4 4" strokeWidth={1} />}
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2}
              dot={false} activeDot={{ r: 4, fill: color }} />
          </LineChart>
        ) : (
          <AreaChart {...common}>
            <defs>
              <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {gridEl}
            <XAxis dataKey="date" tickFormatter={formatDate} {...axisProps} />
            <YAxis {...axisProps} />
            {tooltipEl}
            {normalMax && <ReferenceLine y={normalMax} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />}
            {normalMin && <ReferenceLine y={normalMin} stroke="#f97316" strokeDasharray="4 4" strokeWidth={1} />}
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
              fill={`url(#grad-${dataKey})`} activeDot={{ r: 4, fill: color }} />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
