import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
    name: str = Field(description="카테고리 이름")
    color: str = Field(
        description="카테고리 색상(hex). 목표/일정이 이 색상 값으로 카테고리를 참조한다"
    )


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, description="카테고리 이름")
    color: str | None = Field(default=None, description="카테고리 색상(hex)")


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(description="카테고리 ID")
    name: str = Field(description="카테고리 이름")
    color: str = Field(description="카테고리 색상(hex)")
    created_at: datetime
    updated_at: datetime
