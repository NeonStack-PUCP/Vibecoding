import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Float, Integer, Boolean, Text, DateTime, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String(20), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    status = Column(String(30), nullable=False, default="pending", index=True)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(Text, default="")
    photo_url = Column(Text, nullable=False)
    expediente_url = Column(Text)
    responsible_entity = Column(Text)
    responsible_channel = Column(Text)
    support_count = Column(Integer, default=0)
    collective_request_sent = Column(Boolean, default=False)
    state_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Support(Base):
    __tablename__ = "supports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    citizen_name = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
