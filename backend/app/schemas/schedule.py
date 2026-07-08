import uuid
from datetime import date as date_
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class ScheduleSource(StrEnum):
    MANUAL = "manual"
    AI = "ai"


class ScheduleCreate(BaseModel):
    todo_id: uuid.UUID = Field(description="타임라인에 배치할 todo ID")
    scheduled_time: int = Field(ge=0, le=1439, description="배치할 시각(자정 기준 분)")
    source: ScheduleSource = Field(description="'manual'(직접 드래그) 또는 'ai'(추천 수락)")
    auto_resolve: bool = Field(
        default=False,
        description="같은 날짜에 겹치는 항목이 있을 때, false면 409로 거부하고 "
        "true면 다음 빈 시간을 찾아 자동으로 배치한다",
    )


class ScheduleUpdate(BaseModel):
    scheduled_time: int | None = Field(default=None, ge=0, le=1439, description="이동할 시각(분)")
    note: str | None = Field(default=None, description="메모")
    auto_resolve: bool = Field(
        default=False, description="scheduled_time 이동 시 겹치면 자동으로 다음 빈 시간을 찾을지"
    )


class ScheduleRead(BaseModel):
    """Schedule과 그 부모 Todo의 필드를 합쳐서 구성한다 (라우터에서 명시적으로 조립)."""

    todo_id: uuid.UUID = Field(description="배치된 todo의 ID")
    title: str
    date: date_
    scheduled_time: int = Field(description="배치된 시각(자정 기준 분)")
    estimated_minutes: int = Field(description="소요 시간(분) — 배치 구간의 길이로 쓰인다")
    note: str | None
    reason: str | None
    source: str
    is_done: bool = Field(description="완료 여부 (todo 쪽 값을 그대로 보여줌, 여기서 수정은 불가)")
    weekly_goal_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
