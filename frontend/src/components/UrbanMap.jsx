import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, Pane } from 'react-leaflet'

const SEVERITY_COLORS = {
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
}

const ZONE_TYPE_COLORS = {
  stadium: '#a855f7',
  fan_zone: '#ec4899',
  residential: '#38bdf8',
  cultural: '#14b8a6',
  medical: '#f43f5e',
  commercial: '#fbbf24',
  entertainment: '#84cc16',
}

const TRANSIT_COLORS = {
  light_rail: '#60a5fa',
  bus_shuttle: '#f59e0b',
}

const HOUSTON_CENTER = [29.735, -95.39]

export default function UrbanMap({
  zones,
  traffic,
  transitRoutes,
  peak,
  selectedZoneId,
  selectedCorridorId,
  onSelectZone,
  onSelectCorridor,
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-800">
      <MapContainer
        center={HOUSTON_CENTER}
        zoom={12}
        className="h-full w-full"
      >
        <TileLayer
          className="map-tiles-dark"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <Pane name="transit" style={{ zIndex: 410 }}>
          {transitRoutes.map((route) => (
            <Polyline
              key={route.id}
              positions={route.path}
              pathOptions={{
                color: TRANSIT_COLORS[route.mode] || '#94a3b8',
                weight: route.mode === 'bus_shuttle' ? 3 : 4,
                dashArray: route.mode === 'bus_shuttle' ? '6 6' : undefined,
                opacity: 0.85,
              }}
            >
              <Tooltip sticky>
                <div className="text-xs">
                  <div className="font-semibold">{route.name}</div>
                  <div>{route.stops.join(' → ')}</div>
                </div>
              </Tooltip>
            </Polyline>
          ))}
        </Pane>

        <Pane name="zones" style={{ zIndex: 420 }}>
          {zones.map((zone) => (
            <CircleMarker
              key={zone.id}
              center={[zone.lat, zone.lon]}
              radius={Math.max(8, Math.min(26, zone.energy_mw / 2))}
              pathOptions={{
                color: zone.id === selectedZoneId ? '#ffffff' : ZONE_TYPE_COLORS[zone.type] || '#94a3b8',
                fillColor: ZONE_TYPE_COLORS[zone.type] || '#94a3b8',
                fillOpacity: 0.55,
                weight: zone.id === selectedZoneId ? 3 : 1.5,
              }}
              eventHandlers={{ click: () => onSelectZone(zone) }}
            >
              <Tooltip>
                <div className="text-xs">
                  <div className="font-semibold">{zone.name}</div>
                  <div>Energy: {zone.energy_mw} MW</div>
                  <div>Water: {zone.water_mgd} MGD</div>
                  <div>Crowd density: {zone.crowd_density_index}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </Pane>

        <Pane name="traffic" style={{ zIndex: 430 }}>
          {traffic.map((corridor) => (
            <CircleMarker
              key={corridor.id}
              center={[corridor.lat, corridor.lon]}
              radius={corridor.id === selectedCorridorId ? 12 : 9}
              pathOptions={{
                color: corridor.id === selectedCorridorId ? '#ffffff' : SEVERITY_COLORS[corridor.severity],
                fillColor: SEVERITY_COLORS[corridor.severity],
                fillOpacity: 0.85,
                weight: corridor.id === selectedCorridorId ? 3 : 1.5,
              }}
              eventHandlers={{ click: () => onSelectCorridor(corridor) }}
            >
              <Tooltip>
                <div className="text-xs">
                  <div className="font-semibold">{corridor.name}</div>
                  <div>Volume: {corridor.current_volume.toLocaleString()} veh/day</div>
                  <div>Severity: {corridor.severity}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </Pane>
      </MapContainer>

      <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] space-y-1 rounded-lg bg-slate-950/85 p-3 text-[11px] text-slate-200 backdrop-blur">
        <div className="mb-1 font-semibold text-slate-100">Legend</div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: SEVERITY_COLORS.critical }} />
          Traffic bottleneck (critical → low)
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: ZONE_TYPE_COLORS.stadium }} />
          Resource zone (size = energy load)
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-3" style={{ background: TRANSIT_COLORS.light_rail }} />
          METRORail
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-3 border-b-2 border-dashed" style={{ borderColor: TRANSIT_COLORS.bus_shuttle }} />
          Fan shuttle (event day)
        </div>
      </div>

      {peak && (
        <div className="absolute right-3 top-3 z-[1000] animate-pulse rounded-full bg-red-600/90 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          ● LIVE PEAK EVENT SIMULATION
        </div>
      )}
    </div>
  )
}
