import { useCallback, useEffect, useState } from 'react'
import Header from './components/Header'
import MetricsRow from './components/MetricsRow'
import UrbanMap from './components/UrbanMap'
import AnalyticsPanel from './components/AnalyticsPanel'
import AIPanel from './components/AIPanel'
import { getSummary, getZones, getTraffic, getTransit, getEnergyTimeseries } from './api'

export default function App() {
  const [peak, setPeak] = useState(false)
  const [summary, setSummary] = useState(null)
  const [zones, setZones] = useState([])
  const [traffic, setTraffic] = useState([])
  const [transitRoutes, setTransitRoutes] = useState([])
  const [energyTimeseries, setEnergyTimeseries] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [selectedZone, setSelectedZone] = useState(null)
  const [selectedCorridor, setSelectedCorridor] = useState(null)

  const loadData = useCallback(async (peakMode) => {
    setLoading(true)
    setLoadError(null)
    try {
      const [summaryData, zonesData, trafficData, transitData, energyData] = await Promise.all([
        getSummary(peakMode),
        getZones(peakMode),
        getTraffic(peakMode),
        getTransit(),
        getEnergyTimeseries(peakMode),
      ])
      setSummary(summaryData)
      setZones(zonesData)
      setTraffic(trafficData)
      setTransitRoutes(transitData)
      setEnergyTimeseries(energyData)
    } catch (err) {
      setLoadError('Could not reach the backend API. Is uvicorn running on port 8010?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(peak)
  }, [peak, loadData])

  function handleSelectZone(zone) {
    setSelectedZone(zone)
  }
  function handleSelectCorridor(corridor) {
    setSelectedCorridor(corridor)
  }
  function handleClearSelection(kind) {
    if (kind === 'zone') setSelectedZone(null)
    if (kind === 'corridor') setSelectedCorridor(null)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <Header peak={peak} onTogglePeak={() => setPeak((p) => !p)} />

      <main className="flex-1 space-y-4 p-4 md:p-6">
        {loadError && (
          <div className="rounded-lg border border-red-800/50 bg-red-950/40 p-3 text-sm text-red-300">
            {loadError}
          </div>
        )}

        <MetricsRow summary={summary} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
          <div className="h-[520px]">
            {!loading && (
              <UrbanMap
                zones={zones}
                traffic={traffic}
                transitRoutes={transitRoutes}
                peak={peak}
                selectedZoneId={selectedZone?.id}
                selectedCorridorId={selectedCorridor?.id}
                onSelectZone={handleSelectZone}
                onSelectCorridor={handleSelectCorridor}
              />
            )}
          </div>
          <div className="h-[520px]">
            <AIPanel
              peak={peak}
              selectedZone={selectedZone}
              selectedCorridor={selectedCorridor}
              onClearSelection={handleClearSelection}
            />
          </div>
        </div>

        <AnalyticsPanel energyTimeseries={energyTimeseries} traffic={traffic} />
      </main>

      <footer className="border-t border-slate-800 px-6 py-3 text-center text-xs text-slate-500">
        Built for the Rice Sustainability Hackathon · World Cup Cities track · Powered locally by Qwen 2.5 Coder via LM Studio
      </footer>
    </div>
  )
}
