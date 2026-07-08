import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.models.todo import Todo


class Schedule(Base):
    __tablename__ = "schedules"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    # 1:1 — 한 todo는 하나의 배치만 가질 수 있다.
    todo_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("todos.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    scheduled_time: Mapped[int]
    note: Mapped[str | None] = mapped_column(nullable=True)
    reason: Mapped[str | None] = mapped_column(nullable=True)
    # 'manual' | 'ai' — 어떻게 배치됐는지 (AI 추천 배지 표시용).
    source: Mapped[str]

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    todo: Mapped[Todo] = relationship(back_populates="schedule")
