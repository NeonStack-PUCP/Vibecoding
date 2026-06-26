"""
INFOBRAS scraper — Contraloría General de la República
API pública: https://apps.contraloria.gob.pe/wginfobras/api/v1/infobras
"""
import logging
from datetime import datetime
import requests
from scrapers.base import with_retry, DEFAULT_TIMEOUT

logger = logging.getLogger(__name__)

INFOBRAS_API = "https://apps.contraloria.gob.pe/wginfobras/api/v1/infobras"


def _calculate_days_without_movement(last_update_str: str | None) -> int | None:
    if not last_update_str:
        return None
    try:
        last_update = datetime.fromisoformat(last_update_str.replace("Z", "+00:00"))
        return (datetime.utcnow() - last_update.replace(tzinfo=None)).days
    except Exception:
        return None


def query_infobras(lat: float, lng: float) -> dict | None:
    """Return first matching obra within ~2km of coordinates, or None on failure."""

    def _fetch() -> dict | None:
        params = {
            "latitud": lat,
            "longitud": lng,
            "radio": 2000,
            "pagina": 1,
            "cantidad": 1,
        }
        resp = requests.get(INFOBRAS_API, params=params, timeout=DEFAULT_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()

        items = data.get("data") or data.get("obras") or []
        if not items:
            return {"found": False, "source": "INFOBRAS"}

        obra = items[0]
        days = _calculate_days_without_movement(obra.get("fec_ult_act"))
        return {
            "found": True,
            "source": "INFOBRAS",
            "code": str(obra.get("cod_obra", "")),
            "name": obra.get("nom_obra"),
            "budget": obra.get("mto_presupuesto_total"),
            "progress_pct": obra.get("avance_fisico"),
            "days_without_movement": days,
            "contractor": obra.get("nom_empresa"),
        }

    result = with_retry(_fetch, "INFOBRAS")
    if result is None:
        logger.warning("INFOBRAS unavailable — returning empty result")
        return {"found": False, "source": "INFOBRAS"}
    return result
