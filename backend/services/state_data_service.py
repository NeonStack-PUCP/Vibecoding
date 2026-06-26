import json
import logging
from typing import Optional
import redis
from config import settings
from scrapers.infobras import query_infobras
from scrapers.mef import query_mef
from scrapers.oefa import query_oefa
from scrapers.geo import query_geo

logger = logging.getLogger(__name__)

CACHE_TTL_SECONDS = 86400  # 24h

CATEGORY_SOURCES = {
    "obra": ["infobras", "mef", "geo"],
    "pista": ["mef", "geo"],
    "parque": ["mef", "geo"],
    "agua": ["mef", "geo"],
    "luz": ["mef", "geo"],
    "basura": ["geo"],
    "ambiente": ["oefa", "geo"],
    "seguridad": ["geo"],
    "propuesta": ["mef", "geo"],
    "otro": ["geo"],
}


def _cache_key(lat: float, lng: float, category: str) -> str:
    return f"state_data:{category}:{round(lat, 3)}:{round(lng, 3)}"


def _get_redis() -> Optional[redis.Redis]:
    try:
        r = redis.from_url(settings.redis_url, decode_responses=True, socket_timeout=2)
        r.ping()
        return r
    except Exception as exc:
        logger.warning("Redis unavailable: %s", exc)
        return None


def query_state_data(lat: float, lng: float, category: str) -> dict:
    """
    Query relevant state data sources for a given location and category.
    Cache-first: checks Redis before calling external APIs.
    Degrades gracefully if individual sources fail.
    """
    cache_key = _cache_key(lat, lng, category)
    r = _get_redis()

    # Cache hit
    if r:
        cached = r.get(cache_key)
        if cached:
            logger.info("Cache HIT for %s", cache_key)
            return json.loads(cached)

    logger.info("Cache MISS — querying state data for (%s, %s) cat=%s", lat, lng, category)
    sources = CATEGORY_SOURCES.get(category, ["geo"])
    result: dict = {}

    if "infobras" in sources:
        result["infobras"] = query_infobras(lat, lng)

    if "mef" in sources:
        result["mef"] = query_mef(lat, lng)

    if "oefa" in sources:
        result["oefa"] = query_oefa(lat, lng)

    # Always include geo to determine responsible entity
    geo = query_geo(lat, lng)
    result["geo"] = geo

    # Bubble responsible entity/channel to top level
    if geo and geo.get("found"):
        result["responsible_entity"] = geo.get("entity")
        result["responsible_channel"] = geo.get("responsible_channel")

    # Cache result
    if r:
        try:
            r.setex(cache_key, CACHE_TTL_SECONDS, json.dumps(result))
        except Exception as exc:
            logger.warning("Failed to cache state data: %s", exc)

    return result
