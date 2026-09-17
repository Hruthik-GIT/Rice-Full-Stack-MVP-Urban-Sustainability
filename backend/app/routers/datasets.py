from fastapi import APIRouter, Query

from app.data import mock_data

router = APIRouter(prefix="/api", tags=["datasets"])


@router.get("/summary")
def summary(peak: bool = Query(False, description="Peak FIFA 2026 event-day simulation toggle")):
    return mock_data.get_city_summary(peak)


@router.get("/zones")
def zones(peak: bool = Query(False)):
    return mock_data.get_zones_with_consumption(peak)


@router.get("/traffic")
def traffic(peak: bool = Query(False)):
    return mock_data.get_traffic_bottlenecks(peak)


@router.get("/transit")
def transit():
    return mock_data.get_transit_routes()


@router.get("/fan-zones")
def fan_zones():
    return mock_data.get_fan_zones()


@router.get("/energy-timeseries")
def energy_timeseries(peak: bool = Query(False)):
    return mock_data.get_energy_timeseries(peak)
