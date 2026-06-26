import logging
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from database import get_db
from schemas.report import ReportCreate, ReportResponse, ReportsListResponse, SupportCreate, SupportResponse
from services import report_service

router = APIRouter(tags=["reports"])
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)


@router.get("/reports", response_model=ReportsListResponse, response_model_by_alias=True)
def list_reports(
    lat: float = Query(..., ge=-18.5, le=0.0),
    lng: float = Query(..., ge=-81.5, le=-68.5),
    radius: float = Query(5.0, ge=0.1, le=50.0),
    category: str | None = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> ReportsListResponse:
    return report_service.list_reports(db, lat, lng, radius, category, limit, offset)


@router.get("/reports/{report_id}", response_model=ReportResponse, response_model_by_alias=True)
def get_report(report_id: UUID, db: Session = Depends(get_db)) -> ReportResponse:
    report = report_service.get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.post("/reports", response_model=ReportResponse, status_code=201, response_model_by_alias=True)
@limiter.limit("10/minute")
def create_report(
    request: Request,
    payload: ReportCreate,
    db: Session = Depends(get_db),
) -> ReportResponse:
    logger.info("Creating report type=%s category=%s", payload.type, payload.category)
    return report_service.create_report(db, payload)


@router.post("/reports/{report_id}/support", response_model=SupportResponse, response_model_by_alias=True)
@limiter.limit("20/minute")
def support_report(
    request: Request,
    report_id: UUID,
    payload: SupportCreate,
    db: Session = Depends(get_db),
) -> SupportResponse:
    try:
        return report_service.add_support(db, report_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
