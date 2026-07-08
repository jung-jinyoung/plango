import uuid
from datetime import date as date_
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class PriorityLevel(StrEnum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


PRIORITY_VALUES: dict[PriorityLevel, float] = {
    PriorityLevel.HIGH: 1.0,
    PriorityLevel.MEDIUM: 0.5,
    PriorityLevel.LOW: 0.0,
}


class TodoCreate(BaseModel):
    title: str = Field(description="할 일 제목")
    date: date_ = Field(description="이 할 일이 속한 날짜")
    estimated_minutes: int = Field(default=30, ge=0, description="예상 소요 시간(분). 기본 30분")
    fixed_time: int | None = Field(
        default=None,
        ge=0,
        le=1439,
        description="고정 시간(자정 기준 분). 있으면 그 시간대에 반드시 배치되어야 하고, "
        "priority를 별도로 안 주면 자동으로 high가 된다",
    )
    scheduled_time: int | None = Field(
        default=None, ge=0, le=1439, description="실제 배치된 시각(자정 기준 분). 더미 상태면 null"
    )
    priority: PriorityLevel | None = Field(
        default=None, description="상/중/하. 생략하면 기본 low(0), fixed_time이 있으면 high(1)"
    )
    weekly_goal_id: uuid.UUID | None = Field(default=None, description="연결할 주간 목표 ID")
    is_scheduled: bool = Field(default=False, description="할 일 더미(False)/일정에 배치됨(True)")


class TodoUpdate(BaseModel):
    title: str | None = None
    date: date_ | None = Field(default=None, description="날짜만 바꾸면 이월(carry-over)이 된다")
    estimated_minutes: int | None = Field(default=None, ge=0)
    fixed_time: int | None = Field(default=None, ge=0, le=1439)
    scheduled_time: int | None = Field(default=None, ge=0, le=1439)
    priority: PriorityLevel | None = None
    weekly_goal_id: uuid.UUID | None = None
    is_done: bool | None = None
    is_scheduled: bool | None = None
    note: str | None = Field(default=None, description="메모")


class TodoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    date: date_
    estimated_minutes: int
    fixed_time: int | None
    scheduled_time: int | None
    priority: float = Field(description="0~1 사이 float. 상/중/하는 1.0/0.5/0.0으로 저장된다")
    weekly_goal_id: uuid.UUID | None
    is_done: bool
    is_scheduled: bool
    note: str | None = Field(description="메모")
    reason: str | None = Field(
        description="AI가 이 시간대를 추천한 근거 (source=ai일 때만 의미 있음)"
    )
    source: str | None = Field(
        description="'manual' 또는 'ai' — 어떻게 배치됐는지. 배치 전이면 null"
    )
    created_at: datetime
    updated_at: datetime
