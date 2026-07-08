import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WeeklyGoalCreate(BaseModel):
    title: str = Field(description="주간 목표 제목")
    monthly_goal_id: uuid.UUID | None = Field(
        default=None, description="연결할 월간 목표 ID. 없으면 미분류(고아) 상태로 생성된다"
    )


class WeeklyGoalUpdate(BaseModel):
    title: str | None = Field(default=None, description="주간 목표 제목")
    monthly_goal_id: uuid.UUID | None = Field(
        default=None, description="연결할 월간 목표 ID. null로 보내면 연결을 해제한다"
    )


class WeeklyGoalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(description="주간 목표 ID")
    title: str = Field(description="주간 목표 제목")
    monthly_goal_id: uuid.UUID | None = Field(description="연결된 월간 목표 ID, 없으면 null")
    category_id: uuid.UUID | None = Field(
        description="카테고리는 직접 입력받지 않고 부모 월간 목표에서 상속된다. "
        "부모가 없으면 null"
    )
    created_at: datetime
    updated_at: datetime
