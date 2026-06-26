import logging
import math
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from models.report import Report, Support

MAX_SUPPORT_THRESHOLD = 15

logger = logging.getLogger(__name__)


def _bbox(lat: float, lng: float, radius_km: float) -> tuple[float, float, float, float]:
    """Return (lat_min, lat_max, lng_min, lng_max) bounding box for a radius."""
    lat_delta = radius_km / 111.0
    lng_delta = radius_km / (111.0 * max(math.cos(math.radians(abs(lat))), 0.01))
    return lat - lat_delta, lat + lat_delta, lng - lng_delta, lng + lng_delta


class ReportRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: dict) -> Report:
        report = Report(**data)
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def get_by_id(self, report_id: UUID) -> Optional[Report]:
        return self.db.get(Report, report_id)

    def list_by_radius(
        self,
        lat: float,
        lng: float,
        radius_km: float = 5,
        category: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[Report], int]:
        lat_min, lat_max, lng_min, lng_max = _bbox(lat, lng, radius_km)
        query = self.db.query(Report).filter(
            Report.latitude.between(lat_min, lat_max),
            Report.longitude.between(lng_min, lng_max),
        )
        if category:
            query = query.filter(Report.category == category)
        total = query.count()
        reports = query.order_by(Report.created_at.desc()).offset(offset).limit(limit).all()
        return reports, total

    def update(self, report_id: UUID, data: dict) -> Optional[Report]:
        report = self.get_by_id(report_id)
        if not report:
            return None
        for key, value in data.items():
            setattr(report, key, value)
        self.db.commit()
        self.db.refresh(report)
        return report

    def add_support(self, report_id: UUID, citizen_name: str) -> tuple[Report, bool]:
        report = self.get_by_id(report_id)
        if not report:
            raise ValueError("Report not found")

        support = Support(report_id=report_id, citizen_name=citizen_name)
        self.db.add(support)
        report.support_count += 1

        collective_triggered = False
        if report.support_count >= MAX_SUPPORT_THRESHOLD and not report.collective_request_sent:
            report.collective_request_sent = True
            collective_triggered = True
            logger.info(
                "Collective request triggered for report %s (%d supporters)",
                report_id,
                report.support_count,
            )

        self.db.commit()
        self.db.refresh(report)
        return report, collective_triggered
