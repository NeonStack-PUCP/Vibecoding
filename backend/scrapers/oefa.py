"""
OEFA Open Data API
https://datosabiertos.oefa.gob.pe/
"""
import logging
import requests
from scrapers.base import with_retry, DEFAULT_TIMEOUT

logger = logging.getLogger(__name__)

OEFA_API = "https://datosabiertos.oefa.gob.pe/api/3/action/datastore_search"
# Resource ID del dataset de supervisiones/fiscalizaciones OEFA
OEFA_RESOURCE_ID = "1c8c40d5-eb96-4ba0-a6e1-1f6b41b7d54a"


def query_oefa(lat: float, lng: float) -> dict:
    """Return OEFA inspection history near coordinates (approx 10km radius)."""

    def _fetch() -> dict:
        # OEFA API accepts SQL-like queries
        sql = (
            f"SELECT * FROM \"{OEFA_RESOURCE_ID}\" "
            f"WHERE latitud > {lat - 0.1} AND latitud < {lat + 0.1} "
            f"AND longitud > {lng - 0.1} AND longitud < {lng + 0.1} "
            f"LIMIT 10"
        )
        params = {"sql": sql}
        resp = requests.get(
            "https://datosabiertos.oefa.gob.pe/api/3/action/datastore_search_sql",
            params=params,
            timeout=DEFAULT_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()
        records = data.get("result", {}).get("records", [])

        if not records:
            return {"found": False, "source": "OEFA"}

        dates = [r.get("fecha_supervision") or r.get("fecha") for r in records if r.get("fecha_supervision") or r.get("fecha")]
        return {
            "found": True,
            "source": "OEFA",
            "previous_inspections": len(records),
            "last_inspection_date": max(dates) if dates else None,
        }

    result = with_retry(_fetch, "OEFA")
    if result is None:
        logger.warning("OEFA unavailable — returning empty result")
        return {"found": False, "source": "OEFA"}
    return result
