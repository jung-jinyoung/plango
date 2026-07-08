import uuid
from datetime import date as date_
from datetime import datetime

from sqlalchemy import Date, DateTime, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class Retrospective(Base):
    __tablename__ = "retrospectives"
    __table_args__ = (UniqueConstraint("period_type", "period_start"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    # 'daily' | 'weekly' | 'monthly'
    period_type: Mapped[str]
    # daily=그 날짜, weekly=그 주의 시작일, monthly=그 달 1일로 통일.
    period_start: Mapped[date_] = mapped_column(Date, nullable=False)
    content: Mapped[str]

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
