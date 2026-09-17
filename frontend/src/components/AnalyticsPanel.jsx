import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  Legend,
} from 'recharts'

const SEVERITY_COLORS = {
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
}

export default function AnalyticsPanel({ energyTimeseries, traffic }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-200">Energy Demand — 24hr Curve</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={energyTimeseries}>
            <defs>
              <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={2} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit=" MW" width={55} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Area type="monotone" dataKey="demand_mw" stroke="#f59e0b" fill="url(#energyGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-200">Traffic Corridor Volume</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={traffic} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              width={140}
            />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="current_volume" radius={[0, 4, 4, 0]}>
              {traffic.map((entry) => (
                <Cell key={entry.id} fill={SEVERITY_COLORS[entry.severity]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
