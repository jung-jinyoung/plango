import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.models.monthly_goal import MonthlyGoal


class WeeklyGoal(Base):
    __tablename__ = "weekly_goals"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str]
    monthly_goal_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("monthly_goals.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    monthly_goal: Mapped[MonthlyGoal | None] = relationship()

    @property
    def category_id(self) -> uuid.UUID | None:
        # weekly_goals에는 category_id 컬럼이 없다 — 부모 monthly_goal의 카테고리를 따라간다.
        return self.monthly_goal.category_id if self.monthly_goal else None
