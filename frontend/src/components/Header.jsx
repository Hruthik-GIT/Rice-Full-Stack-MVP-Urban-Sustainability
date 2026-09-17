import { Activity, Flame } from 'lucide-react'

export default function Header({ peak, onTogglePeak }) {
  return (
    <header className="flex flex-col gap-3 border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-900/60 p-2">
          <Activity size={22} className="text-blue-300" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-50">Rice Urban Sustainability Dashboard</h1>
          <p className="text-xs text-slate-400">Houston Host City · FIFA World Cup 2026 · Rice Sustainability Hackathon</p>
        </div>
      </div>

      <button
        onClick={onTogglePeak}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
          peak
            ? 'border-red-600 bg-red-600/20 text-red-300 hover:bg-red-600/30'
            : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
        }`}
      >
        <Flame size={16} className={peak ? 'text-red-400' : 'text-slate-500'} />
        {peak ? 'Peak Event Simulation: ON' : 'Peak Event Simulation: OFF'}
      </button>
    </header>
  )
}
