from __future__ import annotations
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, field_validator
from pydantic.alias_generators import to_camel


class StateDataResult(BaseModel):
    found: bool
    source: str
    data: Optional[dict] = None


class InfobrasResult(StateDataResult):
    code: Optional[str] = None
    name: Optional[str] = None
    budget: Optional[float] = None
    progress_pct: Optional[float] = None
    days_without_movement: Optional[int] = None
    contractor: Optional[str] = None


class MefResult(StateDataResult):
    assigned: Optional[float] = None
    executed: Optional[float] = None
    execution_pct: Optional[float] = None


class OefaResult(StateDataResult):
    previous_inspections: Optional[int] = None
    last_inspection_date: Optional[str] = None


class GeoResult(StateDataResult):
    entity: Optional[str] = None
    district: Optional[str] = None
    province: Optional[str] = None
    region: Optional[str] = None


class StateData(BaseModel):
    infobras: Optional[InfobrasResult] = None
    mef: Optional[MefResult] = None
    oefa: Optional[OefaResult] = None
    geo: Optional[GeoResult] = None
    responsible_entity: Optional[str] = None
    responsible_channel: Optional[str] = None

    model_config = {"populate_by_name": True}


class ReportCreate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    type: str
    category: str
    title: str
    description: str
    latitude: float
    longitude: float
    photo_url: str

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v: float) -> float:
        if not (-18.5 <= v <= -0.0):
            raise ValueError("Latitude out of Peru bounds")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v: float) -> float:
        if not (-81.5 <= v <= -68.5):
            raise ValueError("Longitude out of Peru bounds")
        return v

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ("denuncia", "propuesta"):
            raise ValueError("type must be 'denuncia' or 'propuesta'")
        return v


class ReportResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: UUID
    type: str
    category: str
    status: str
    title: str
    description: str
    latitude: float
    longitude: float
    address: str
    photo_url: str
    expediente_url: Optional[str] = None
    responsible_entity: Optional[str] = None
    responsible_channel: Optional[str] = None
    support_count: int
    collective_request_sent: bool
    state_data: Optional[dict] = None
    created_at: datetime


class ReportsListResponse(BaseModel):
    reports: list[ReportResponse]
    total: int


class SupportCreate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    citizen_name: str

    @field_validator("citizen_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Name must be at least 3 characters")
        if len(v) > 200:
            raise ValueError("Name too long")
        return v


class SupportResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    support_count: int
    collective_request_sent: bool
    message: Optional[str] = None
