import { Zap, Droplets, Car, Users, AlertTriangle, MapPin } from 'lucide-react'

function MetricCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className={`rounded-lg p-2 ${accent}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
        <div className="text-xl font-semibold text-slate-50">{value}</div>
      </div>
    </div>
  )
}

export default function MetricsRow({ summary }) {
  if (!summary) return null
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <MetricCard icon={Zap} label="Energy Load" value={`${summary.total_energy_mw} MW`} accent="bg-amber-600" />
      <MetricCard icon={Droplets} label="Water Demand" value={`${summary.total_water_mgd} MGD`} accent="bg-sky-600" />
      <MetricCard icon={Car} label="Avg Congestion" value={`${summary.avg_congestion_pct}%`} accent="bg-orange-600" />
      <MetricCard icon={AlertTriangle} label="Critical Corridors" value={summary.critical_corridors} accent="bg-red-600" />
      <MetricCard icon={Users} label="Stadium Attendance" value={summary.estimated_stadium_attendance.toLocaleString()} accent="bg-purple-600" />
      <MetricCard icon={MapPin} label="Active Fan Zones" value={summary.active_fan_zones} accent="bg-pink-600" />
    </div>
  )
}
