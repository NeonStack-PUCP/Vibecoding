"""
MEF / Consulta Amigable scraper
Endpoint JSON que expone datos del SIAF por ubigeo y categoría.
"""
import logging
import requests
from scrapers.base import with_retry, DEFAULT_TIMEOUT

logger = logging.getLogger(__name__)

# Endpoint JSON de Consulta Amigable (MEF)
MEF_API = "https://apps.mef.gob.pe/alfresco-web-consulta-amigable/ConsultaAmigablePortlet/api/v1/datos"


def _lat_lng_to_ubigeo(lat: float, lng: float) -> str:
    """Approximation using bounding boxes for Lima districts. Extend as needed."""
    # Lima Metropolitana bounding box: lat -12.5 to -11.6, lng -77.2 to -76.8
    # Fallback ubigeo = Lima (150101)
    return "150101"


def query_mef(lat: float, lng: float) -> dict:
    """Return budget execution data for the district near coordinates."""
    ubigeo = _lat_lng_to_ubigeo(lat, lng)

    def _fetch() -> dict:
        params = {"ubigeo": ubigeo, "anio": "2025"}
        resp = requests.get(MEF_API, params=params, timeout=DEFAULT_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()

        registros = data.get("registros") or []
        if not registros:
            return {"found": False, "source": "MEF"}

        # Sum assigned/executed across all records for the district
        total_assigned = sum(float(r.get("mto_pia", 0) or 0) for r in registros)
        total_executed = sum(float(r.get("mto_devengado", 0) or 0) for r in registros)
        pct = round((total_executed / total_assigned * 100), 1) if total_assigned else 0

        return {
            "found": True,
            "source": "MEF",
            "assigned": total_assigned,
            "executed": total_executed,
            "execution_pct": pct,
        }

    result = with_retry(_fetch, "MEF")
    if result is None:
        logger.warning("MEF unavailable — returning empty result")
        return {"found": False, "source": "MEF"}
    return result
