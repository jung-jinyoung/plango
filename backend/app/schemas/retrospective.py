import uuid
from datetime import date as date_
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class RetrospectivePeriodType(StrEnum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class DirectionResponse(BaseModel):
    """AI가 제안하는 회고 방향성. 지금은 스텁 — 실제 분석 로직은 후속 작성."""

    period_type: RetrospectivePeriodType
    period_start: date_
    direction: str = Field(description="AI가 제안하는 회고 방향성 텍스트 (지금은 고정 안내 문구)")


class TransformRequest(BaseModel):
    content: str = Field(description="사용자가 직접 작성한 회고 원문")


class TransformResponse(BaseModel):
    """AI가 검토해 변형한 회고 텍스트. 지금은 스텁 — 실제 변형 로직은 후속 작성."""

    content: str = Field(description="AI가 검토·변형한 회고 텍스트 (지금은 원문 그대로 반환)")


class RetrospectiveCreate(BaseModel):
    period_type: RetrospectivePeriodType
    period_start: date_ = Field(
        description="daily=그 날짜, weekly=그 주의 시작일, monthly=그 달 1일로 통일해서 보낸다"
    )
    content: str = Field(description="완료된 최종 회고 텍스트")


class RetrospectiveUpdate(BaseModel):
    content: str = Field(description="회고 내용 수정")


class RetrospectiveRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    period_type: RetrospectivePeriodType
    period_start: date_
    content: str
    created_at: datetime
    updated_at: datetime
