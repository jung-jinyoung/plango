import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MonthlyGoalCreate(BaseModel):
    title: str = Field(description="월간 목표 제목")
    category_id: uuid.UUID = Field(description="이 목표가 속한 카테고리 ID (필수)")


class MonthlyGoalUpdate(BaseModel):
    title: str | None = Field(default=None, description="월간 목표 제목")
    category_id: uuid.UUID | None = Field(default=None, description="카테고리 변경")


class MonthlyGoalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(description="월간 목표 ID")
    title: str = Field(description="월간 목표 제목")
    category_id: uuid.UUID = Field(description="이 목표가 속한 카테고리 ID")
    created_at: datetime
    updated_at: datetime
