"""
GeoPerú / IDEPerú WFS — territorial responsibility lookup
https://www.geoidep.gob.pe/
"""
import logging
import requests
from scrapers.base import with_retry, DEFAULT_TIMEOUT

logger = logging.getLogger(__name__)

GEOPERU_WFS = "https://www.geoidep.gob.pe/geoserver/ows"


def query_geo(lat: float, lng: float) -> dict:
    """Return responsible entity (municipality/government) for coordinates."""

    def _fetch() -> dict:
        params = {
            "service": "WFS",
            "version": "2.0.0",
            "request": "GetFeature",
            "typeName": "GN:peru_distritos",
            "outputFormat": "application/json",
            "CQL_FILTER": f"CONTAINS(the_geom, POINT({lng} {lat}))",
            "maxFeatures": 1,
        }
        resp = requests.get(GEOPERU_WFS, params=params, timeout=DEFAULT_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        features = data.get("features", [])
        if not features:
            return {"found": False, "source": "GeoPerú"}

        props = features[0].get("properties", {})
        district = props.get("nombdist") or props.get("distrito")
        province = props.get("nombprov") or props.get("provincia")
        region = props.get("nombdep") or props.get("departamento")

        entity = f"Municipalidad Distrital de {district}" if district else None

        # Determine official channel based on entity type
        channel = _get_channel(entity, district, province)

        return {
            "found": bool(district),
            "source": "GeoPerú",
            "entity": entity,
            "district": district,
            "province": province,
            "region": region,
            "responsible_channel": channel,
        }

    result = with_retry(_fetch, "GeoPerú")
    if result is None:
        logger.warning("GeoPerú unavailable — returning empty result")
        return {"found": False, "source": "GeoPerú"}
    return result


def _get_channel(entity: str | None, district: str | None, province: str | None) -> str | None:
    if not entity:
        return None
    # Lima Metropolitana — direct to MML
    if district and "LIMA" in district.upper():
        return "https://www.munlima.gob.pe/solicitudes"
    return "https://www.gob.pe/municipalidades"
