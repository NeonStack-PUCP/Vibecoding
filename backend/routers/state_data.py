import logging
from fastapi import APIRouter, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.state_data_service import query_state_data

router = APIRouter(tags=["state-data"])
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)


@router.get("/state-data/query")
@limiter.limit("30/minute")
def query_state_data_endpoint(
    request: Request,
    lat: float = Query(..., ge=-18.5, le=0.0),
    lng: float = Query(..., ge=-81.5, le=-68.5),
    category: str = Query(...),
) -> dict:
    logger.info("State data query: lat=%s lng=%s cat=%s", lat, lng, category)
    return query_state_data(lat, lng, category)
