"""Synthetic open-data pipeline for Houston FIFA World Cup 2026 corridors.

Mimics the shape of real open datasets (City of Houston Open Data traffic
counts, GTFS transit feeds, utility energy/water consumption profiles) using
seeded pandas-generated data so the dashboard has realistic, stable numbers
without any network calls.
"""
import numpy as np
import pandas as pd

RNG = np.random.default_rng(seed=2026)

ZONES = [
    {"id": "nrg-stadium", "name": "NRG Stadium District", "lat": 29.6847, "lon": -95.4107, "type": "stadium"},
    {"id": "downtown", "name": "Downtown Fan Zone", "lat": 29.7604, "lon": -95.3698, "type": "fan_zone"},
    {"id": "eado", "name": "East Downtown (EaDo)", "lat": 29.7489, "lon": -95.3502, "type": "fan_zone"},
    {"id": "midtown", "name": "Midtown", "lat": 29.7382, "lon": -95.3775, "type": "residential"},
    {"id": "museum-district", "name": "Museum District", "lat": 29.7233, "lon": -95.3906, "type": "cultural"},
    {"id": "medical-center", "name": "Texas Medical Center", "lat": 29.7070, "lon": -95.4009, "type": "medical"},
    {"id": "uptown-galleria", "name": "Uptown / Galleria", "lat": 29.7401, "lon": -95.4620, "type": "commercial"},
    {"id": "washington-corridor", "name": "Washington Ave Corridor", "lat": 29.7654, "lon": -95.4046, "type": "entertainment"},
]

TRAFFIC_CORRIDORS = [
    {"id": "kirby-dr", "name": "Kirby Dr @ NRG Pkwy", "lat": 29.6885, "lon": -95.4184, "baseline_volume": 3200},
    {"id": "610-loop-south", "name": "I-610 Loop (South) @ Fannin", "lat": 29.6912, "lon": -95.4051, "baseline_volume": 8100},
    {"id": "main-st-downtown", "name": "Main St @ Downtown Tunnel", "lat": 29.7589, "lon": -95.3625, "baseline_volume": 4300},
    {"id": "us59-eado", "name": "US-59 @ EaDo Exit", "lat": 29.7465, "lon": -95.3555, "baseline_volume": 6700},
    {"id": "richmond-ave", "name": "Richmond Ave @ Kirby", "lat": 29.7361, "lon": -95.4192, "baseline_volume": 2800},
    {"id": "washington-ave", "name": "Washington Ave @ Sabine", "lat": 29.7651, "lon": -95.3897, "baseline_volume": 2100},
    {"id": "610-loop-west", "name": "I-610 Loop (West) @ San Felipe", "lat": 29.7548, "lon": -95.4581, "baseline_volume": 7400},
]

TRANSIT_ROUTES = [
    {
        "id": "red-line",
        "name": "METRORail Red Line",
        "mode": "light_rail",
        "path": [[29.7604, -95.3698], [29.7489, -95.3796], [29.7382, -95.3775], [29.7233, -95.3906], [29.6847, -95.4107]],
        "stops": ["Downtown Transit Center", "Midtown Station", "Museum District", "NRG Park"],
    },
    {
        "id": "purple-line",
        "name": "METRORail Purple Line",
        "mode": "light_rail",
        "path": [[29.7604, -95.3698], [29.7489, -95.3502], [29.7350, -95.3400]],
        "stops": ["Downtown Transit Center", "EaDo/Stadium", "Palm Center"],
    },
    {
        "id": "shuttle-a",
        "name": "FIFA Fan Shuttle A (Event Day)",
        "mode": "bus_shuttle",
        "path": [[29.7401, -95.4620], [29.7361, -95.4192], [29.6912, -95.4051], [29.6847, -95.4107]],
        "stops": ["Uptown/Galleria Park & Ride", "Richmond/Kirby", "610 Loop South", "NRG Stadium"],
    },
]

_PEAK_MULTIPLIERS = {
    "nrg-stadium": 4.2,
    "downtown": 2.1,
    "eado": 2.6,
    "midtown": 1.6,
    "museum-district": 1.4,
    "medical-center": 1.1,
    "uptown-galleria": 1.3,
    "washington-corridor": 1.8,
}

_TRAFFIC_PEAK_MULTIPLIERS = {
    "kirby-dr": 3.8,
    "610-loop-south": 2.4,
    "main-st-downtown": 1.7,
    "us59-eado": 2.2,
    "richmond-ave": 1.5,
    "washington-ave": 1.6,
    "610-loop-west": 1.9,
}


def get_zones_with_consumption(peak: bool) -> list[dict]:
    rows = []
    for zone in ZONES:
        base_energy = RNG.uniform(8, 22) if zone["type"] != "stadium" else RNG.uniform(14, 18)
        base_water = RNG.uniform(0.6, 2.4) if zone["type"] != "stadium" else RNG.uniform(1.2, 1.8)
        multiplier = _PEAK_MULTIPLIERS[zone["id"]] if peak else 1.0
        rows.append(
            {
                **zone,
                "energy_mw": round(float(base_energy) * multiplier, 2),
                "water_mgd": round(float(base_water) * multiplier, 3),
                "crowd_density_index": round(min(100, float(RNG.uniform(10, 35)) * multiplier), 1),
                "peak_multiplier": multiplier,
            }
        )
    return rows


def get_traffic_bottlenecks(peak: bool) -> list[dict]:
    rows = []
    for c in TRAFFIC_CORRIDORS:
        multiplier = _TRAFFIC_PEAK_MULTIPLIERS[c["id"]] if peak else 1.0
        volume = int(c["baseline_volume"] * multiplier)
        capacity = c["baseline_volume"] * 2.3
        congestion_ratio = volume / capacity
        if congestion_ratio >= 0.9:
            severity = "critical"
        elif congestion_ratio >= 0.7:
            severity = "high"
        elif congestion_ratio >= 0.5:
            severity = "moderate"
        else:
            severity = "low"
        rows.append(
            {
                **c,
                "current_volume": volume,
                "congestion_ratio": round(congestion_ratio, 2),
                "severity": severity,
            }
        )
    return rows


def get_transit_routes() -> list[dict]:
    return TRANSIT_ROUTES


def get_fan_zones() -> list[dict]:
    return [z for z in ZONES if z["type"] in ("stadium", "fan_zone")]


def get_city_summary(peak: bool) -> dict:
    zones = get_zones_with_consumption(peak)
    traffic = get_traffic_bottlenecks(peak)
    total_energy = round(sum(z["energy_mw"] for z in zones), 1)
    total_water = round(sum(z["water_mgd"] for z in zones), 2)
    avg_congestion = round(sum(t["congestion_ratio"] for t in traffic) / len(traffic) * 100, 1)
    critical_corridors = sum(1 for t in traffic if t["severity"] in ("high", "critical"))
    est_attendance = 72000 if peak else 0
    return {
        "mode": "peak_event_day" if peak else "baseline",
        "total_energy_mw": total_energy,
        "total_water_mgd": total_water,
        "avg_congestion_pct": avg_congestion,
        "critical_corridors": critical_corridors,
        "estimated_stadium_attendance": est_attendance,
        "active_fan_zones": len(get_fan_zones()) if peak else 0,
    }


def get_energy_timeseries(peak: bool) -> list[dict]:
    hours = list(range(6, 24))
    series = []
    for h in hours:
        event_curve = np.exp(-((h - 19) ** 2) / 8.0) if peak else 0.0
        base = 55 + 10 * np.sin((h - 6) / 17 * np.pi)
        value = base + (event_curve * 140 if peak else 0)
        series.append({"hour": f"{h:02d}:00", "demand_mw": round(float(value), 1)})
    return series
