import clsx from 'clsx'

export default function StatCard({ icon: Icon, label, value, unit, color, bg, trend, note }) {
  return (
    <div className="card-hover flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
          <Icon size={20} className={color} />
        </div>
        {trend && (
          <span className={clsx(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            trend > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
          )}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium">{label}</p>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="font-display text-2xl font-bold text-white">{value ?? '—'}</span>
          {unit && <span className="text-slate-400 text-sm">{unit}</span>}
        </div>
        {note && <p className="text-slate-500 text-xs mt-1">{note}</p>}
      </div>
    </div>
  )
}
