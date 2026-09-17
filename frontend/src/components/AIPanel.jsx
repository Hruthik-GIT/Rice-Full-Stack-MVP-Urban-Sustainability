import { useState } from 'react'
import { Sparkles, Loader2, AlertCircle, MapPin, Car, X } from 'lucide-react'
import { analyzeSustainability } from '../api'

const RISK_COLORS = {
  low: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/40',
  moderate: 'bg-yellow-600/20 text-yellow-300 border-yellow-600/40',
  high: 'bg-orange-600/20 text-orange-300 border-orange-600/40',
  critical: 'bg-red-600/20 text-red-300 border-red-600/40',
  unknown: 'bg-slate-600/20 text-slate-300 border-slate-600/40',
}

const CATEGORY_LABEL = {
  traffic: 'Traffic',
  energy: 'Energy',
  water: 'Water',
  transit: 'Transit',
  safety: 'Safety',
}

export default function AIPanel({ peak, selectedZone, selectedCorridor, onClearSelection }) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const hasSelection = Boolean(selectedZone || selectedCorridor)

  async function handleAnalyze() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const payload = {
        peak_mode: peak,
        notes: notes || null,
        selected_zone: selectedZone
          ? {
              zone_id: selectedZone.id,
              zone_name: selectedZone.name,
              zone_type: selectedZone.type,
              energy_mw: selectedZone.energy_mw,
              water_mgd: selectedZone.water_mgd,
              crowd_density_index: selectedZone.crowd_density_index,
            }
          : null,
        selected_corridor: selectedCorridor
          ? {
              corridor_id: selectedCorridor.id,
              corridor_name: selectedCorridor.name,
              current_volume: selectedCorridor.current_volume,
              congestion_ratio: selectedCorridor.congestion_ratio,
              severity: selectedCorridor.severity,
            }
          : null,
      }
      const data = await analyzeSustainability(payload)
      setResult(data)
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Failed to reach the sustainability assistant. Check that the backend and LM Studio are running.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={18} className="text-purple-400" />
        <h3 className="text-sm font-semibold text-slate-100">Qwen 2.5 Sustainability Assistant</h3>
      </div>

      {!hasSelection && (
        <p className="text-xs text-slate-400">
          Click a resource zone or traffic corridor on the map to select it, then run an analysis
          for AI-generated planning recommendations.
        </p>
      )}

      {hasSelection && (
        <div className="mb-3 space-y-2">
          {selectedZone && (
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <MapPin size={14} className="text-pink-400" />
                <span className="font-medium">{selectedZone.name}</span>
              </div>
              <button onClick={() => onClearSelection('zone')} className="text-slate-500 hover:text-slate-200">
                <X size={14} />
              </button>
            </div>
          )}
          {selectedCorridor && (
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <Car size={14} className="text-orange-400" />
                <span className="font-medium">{selectedCorridor.name}</span>
              </div>
              <button onClick={() => onClearSelection('corridor')} className="text-slate-500 hover:text-slate-200">
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional context for the planner assistant (e.g. 'match ends at 9pm, expecting rain')..."
        className="mb-3 h-16 w-full resize-none rounded-lg border border-slate-700 bg-slate-950/60 p-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
      />

      <button
        onClick={handleAnalyze}
        disabled={!hasSelection || loading}
        className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Analyzing with Qwen 2.5...
          </>
        ) : (
          <>
            <Sparkles size={16} /> Generate Recommendations
          </>
        )}
      </button>

      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-800/50 bg-red-950/40 p-3 text-xs text-red-300">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase ${RISK_COLORS[result.risk_level] || RISK_COLORS.unknown}`}>
              {result.risk_level} risk
            </div>
            <p className="text-sm text-slate-200">{result.summary}</p>

            {result.recommendations?.length > 0 && (
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-100">{rec.title}</span>
                      <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] uppercase text-slate-300">
                        {CATEGORY_LABEL[rec.category] || rec.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{rec.detail}</p>
                  </div>
                ))}
              </div>
            )}

            {result.projected_impact && (
              <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/30 p-3 text-xs text-emerald-300">
                <span className="font-semibold">Projected impact: </span>
                {result.projected_impact}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
