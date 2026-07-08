import uuid
from datetime import date as date_
from datetime import datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class Todo(Base):
    __tablename__ = "todos"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str]
    date: Mapped[date_] = mapped_column(Date, nullable=False)

    # 예상 소요 시간(분). 선택 입력이지만 기본값 30분.
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=30, server_default="30")

    # 고정 시간(분, 자정 기준) — 있으면 그 시간대에 반드시 배치되어야 함.
    fixed_time: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # 실제 배치/수행된 시각(분, 자정 기준). 더미에 있고 아직 배치 안 됐으면 null.
    scheduled_time: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # 우선순위. 기본 0, 상/중/하 입력 시 1.0/0.5/0.0으로 저장. DB 제약은 걸지 않음
    # (추후 AI가 연속값을 채울 수 있도록).
    priority: Mapped[float] = mapped_column(Float, default=0.0, server_default="0")

    weekly_goal_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("weekly_goals.id", ondelete="SET NULL"), nullable=True
    )

    is_done: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    # 할 일 더미(False)인지 일정에 배치됨(True)인지.
    is_scheduled: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")

    # 아래 세 필드는 "일정(schedule)" 관점의 정보 — 배치 안 된 todo는 전부 null.
    note: Mapped[str | None] = mapped_column(nullable=True)
    reason: Mapped[str | None] = mapped_column(nullable=True)
    # 'manual' | 'ai' — 어떻게 배치됐는지 (AI 추천 배지 표시용).
    source: Mapped[str | None] = mapped_column(nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
