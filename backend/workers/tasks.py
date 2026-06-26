import logging
from uuid import UUID
from workers.celery_app import celery_app
from database import SessionLocal
from repositories.report_repository import ReportRepository
from services.state_data_service import query_state_data
from services.expediente_service import generate_expediente

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=2, default_retry_delay=5)
def process_report_async(self, report_id: str) -> dict:
    """
    Background task: query state data sources + generate expediente for a report.
    Runs after report creation so the API response is immediate.
    """
    logger.info("Processing report %s", report_id)
    db = SessionLocal()
    try:
        repo = ReportRepository(db)
        report = repo.get_by_id(UUID(report_id))
        if not report:
            logger.error("Report %s not found in process_report_async", report_id)
            return {"status": "error", "message": "Report not found"}

        # 1. Query state data (cache-first)
        state_data = query_state_data(report.latitude, report.longitude, report.category)
        responsible_entity = state_data.get("responsible_entity")
        responsible_channel = state_data.get("responsible_channel")

        # 2. Generate expediente via Claude API
        expediente_text = generate_expediente(
            report_id=report_id,
            report_type=report.type,
            category=report.category,
            address=report.address or f"{report.latitude:.4f}, {report.longitude:.4f}",
            latitude=report.latitude,
            longitude=report.longitude,
            description=report.description,
            photo_url=report.photo_url,
            state_data=state_data,
            responsible_entity=responsible_entity,
        )

        # 3. Store expediente as plain text URL (upload to Cloudinary as raw file)
        expediente_url = None
        try:
            from services.upload_service import upload_pdf
            expediente_url = upload_pdf(expediente_text, report_id)
        except Exception as exc:
            logger.warning("Could not upload expediente for %s: %s", report_id, exc)

        # 4. Update report with all results
        repo.update(UUID(report_id), {
            "state_data": state_data,
            "responsible_entity": responsible_entity,
            "responsible_channel": responsible_channel,
            "expediente_url": expediente_url,
            "status": "active",
        })

        logger.info("Report %s processed successfully", report_id)
        return {"status": "ok", "report_id": report_id}

    except Exception as exc:
        logger.error("Error processing report %s: %s", report_id, exc, exc_info=True)
        # Mark as active anyway so it shows on the map
        try:
            repo.update(UUID(report_id), {"status": "active"})
        except Exception:
            pass
        raise self.retry(exc=exc)
    finally:
        db.close()
