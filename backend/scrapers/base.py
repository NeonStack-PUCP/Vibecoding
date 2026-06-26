import logging
import time
from typing import TypeVar, Callable, Any

logger = logging.getLogger(__name__)

T = TypeVar("T")

RETRY_DELAYS = [1, 3]
DEFAULT_TIMEOUT = 8


def with_retry(fn: Callable[[], T], source_name: str) -> T | None:
    """Call fn up to 3 times with 1s then 3s delay between retries."""
    last_exc: Exception | None = None
    attempts = len(RETRY_DELAYS) + 1
    for attempt in range(attempts):
        try:
            return fn()
        except Exception as exc:
            last_exc = exc
            if attempt < len(RETRY_DELAYS):
                delay = RETRY_DELAYS[attempt]
                logger.warning(
                    "%s attempt %d failed: %s — retrying in %ds",
                    source_name,
                    attempt + 1,
                    exc,
                    delay,
                )
                time.sleep(delay)
            else:
                logger.error("%s failed after %d attempts: %s", source_name, attempts, exc)
    return None
