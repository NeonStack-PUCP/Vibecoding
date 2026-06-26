import logging
from uuid import UUID
from sqlalchemy.orm import Session
from repositories.report_repository import ReportRepository
from schemas.report import ReportCreate, ReportResponse, ReportsListResponse, SupportCreate, SupportResponse
from workers.tasks import process_report_async

logger = logging.getLogger(__name__)


def create_report(db: Session, payload: ReportCreate) -> ReportResponse:
    repo = ReportRepository(db)
    report_data = {
        "type": payload.type,
        "category": payload.category,
        "title": payload.title,
        "description": payload.description,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "photo_url": payload.photo_url,
        "status": "pending",
        "address": "",
    }
    report = repo.create(report_data)
    logger.info("Report created: %s (type=%s, category=%s)", report.id, report.type, report.category)

    # Enqueue async processing (state data + expediente generation)
    try:
        process_report_async.delay(str(report.id))
    except Exception as exc:
        logger.warning("Celery unavailable (%s) — skipping async processing", exc)

    return ReportResponse.model_validate(report)


def get_report(db: Session, report_id: UUID) -> ReportResponse | None:
    repo = ReportRepository(db)
    report = repo.get_by_id(report_id)
    if not report:
        return None
    return ReportResponse.model_validate(report)


def list_reports(
    db: Session,
    lat: float,
    lng: float,
    radius: float = 5.0,
    category: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> ReportsListResponse:
    repo = ReportRepository(db)
    reports, total = repo.list_by_radius(lat, lng, radius, category, limit, offset)
    return ReportsListResponse(
        reports=[ReportResponse.model_validate(r) for r in reports],
        total=total,
    )


def add_support(db: Session, report_id: UUID, payload: SupportCreate) -> SupportResponse:
    repo = ReportRepository(db)
    report, collective_triggered = repo.add_support(report_id, payload.citizen_name)
    message = None
    if collective_triggered:
        message = (
            f"¡{report.support_count} vecinos apoyan este reporte! "
            "Se ha enviado una solicitud colectiva a la entidad responsable. "
            "Tienen 30 días hábiles para responder según la Ley N° 27806."
        )
        logger.info("Collective request triggered for report %s", report_id)

    return SupportResponse(
        support_count=report.support_count,
        collective_request_sent=report.collective_request_sent,
        message=message,
    )
