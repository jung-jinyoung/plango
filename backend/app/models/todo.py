import uuid
from datetime import date as date_
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base

if TYPE_CHECKING:
    from app.models.schedule import Schedule


class Todo(Base):
    __tablename__ = "todos"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str]
    date: Mapped[date_] = mapped_column(Date, nullable=False)

    # 예상 소요 시간(분). 선택 입력이지만 기본값 30분.
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=30, server_default="30")

    # 고정 시간(분, 자정 기준) — 있으면 그 시간대에 반드시 배치되어야 함.
    fixed_time: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # 우선순위. 기본 0, 상/중/하 입력 시 1.0/0.5/0.0으로 저장. DB 제약은 걸지 않음
    # (추후 AI가 연속값을 채울 수 있도록).
    priority: Mapped[float] = mapped_column(Float, default=0.0, server_default="0")

    weekly_goal_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("weekly_goals.id", ondelete="SET NULL"), nullable=True
    )

    is_done: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")

    # 배치 정보(scheduled_time/note/reason/source)는 Schedule로 분리했다 —
    # 배치 안 된 todo에 계속 null 컬럼 묶음을 두는 대신, row 존재 여부로 표현한다.
    schedule: Mapped["Schedule | None"] = relationship(back_populates="todo", passive_deletes=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    @property
    def is_scheduled(self) -> bool:
        return self.schedule is not None
