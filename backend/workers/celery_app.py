from celery import Celery
from config import settings

celery_app = Celery(
    "reportape",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Lima",
    enable_utc=True,
    task_soft_time_limit=60,
    task_time_limit=90,
    worker_prefetch_multiplier=1,
)

