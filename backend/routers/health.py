import logging
from fastapi import APIRouter
import redis
from sqlalchemy import text
from database import SessionLocal
from config import settings

router = APIRouter(tags=["health"])
logger = logging.getLogger(__name__)


@router.get("/health")
def health_check() -> dict:
    status = {"status": "ok", "db": "unknown", "redis": "unknown"}

    # DB check
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        status["db"] = "ok"
    except Exception as exc:
        logger.error("DB health check failed: %s", exc)
        status["db"] = "error"
        status["status"] = "degraded"

    # Redis check
    try:
        r = redis.from_url(settings.redis_url, socket_timeout=2)
        r.ping()
        status["redis"] = "ok"
    except Exception as exc:
        logger.warning("Redis health check failed: %s", exc)
        status["redis"] = "unavailable"

    status["openai"] = "configured" if settings.openai_api_key else "missing"
    status["s3"] = "configured" if settings.aws_s3_bucket else "local_fallback"

    return status
