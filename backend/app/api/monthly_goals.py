import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.monthly_goal import MonthlyGoal
from app.schemas.monthly_goal import MonthlyGoalCreate, MonthlyGoalRead, MonthlyGoalUpdate

router = APIRouter(prefix="/monthly-goals", tags=["goals"])


@router.get("", summary="월간 목표 목록 조회")
async def list_monthly_goals(db: AsyncSession = Depends(get_db)) -> list[MonthlyGoalRead]:
    """모든 월간 목표를 생성 순서로 반환한다."""
    result = await db.execute(select(MonthlyGoal).order_by(MonthlyGoal.created_at))
    return list(result.scalars().all())


@router.post("", status_code=201, summary="월간 목표 생성")
async def create_monthly_goal(
    payload: MonthlyGoalCreate, db: AsyncSession = Depends(get_db)
) -> MonthlyGoalRead:
    """월간 목표를 만든다. `category_id`는 필수이며 존재하지 않는 카테고리면 400."""
    goal = MonthlyGoal(title=payload.title, category_id=payload.category_id)
    db.add(goal)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=400, detail="category not found") from exc
    await db.refresh(goal)
    return goal


@router.get("/{goal_id}", summary="월간 목표 단건 조회")
async def get_monthly_goal(
    goal_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> MonthlyGoalRead:
    """id로 월간 목표 하나를 조회한다. 없으면 404."""
    goal = await db.get(MonthlyGoal, goal_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="monthly goal not found")
    return goal


@router.patch("/{goal_id}", summary="월간 목표 수정")
async def update_monthly_goal(
    goal_id: uuid.UUID, payload: MonthlyGoalUpdate, db: AsyncSession = Depends(get_db)
) -> MonthlyGoalRead:
    """title/category_id를 부분 수정한다. 없으면 404, 존재하지 않는 카테고리면 400."""
    goal = await db.get(MonthlyGoal, goal_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="monthly goal not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=400, detail="category not found") from exc
    await db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=204, summary="월간 목표 삭제")
async def delete_monthly_goal(goal_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    """월간 목표를 삭제한다.

    연결된 주간 목표는 삭제되지 않고 `monthly_goal_id`만 null로
    바뀐다(DB의 `ON DELETE SET NULL`).
    """
    goal = await db.get(MonthlyGoal, goal_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="monthly goal not found")
    await db.delete(goal)
    await db.commit()
