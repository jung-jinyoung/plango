import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.db import get_db
from app.models.weekly_goal import WeeklyGoal
from app.schemas.weekly_goal import WeeklyGoalCreate, WeeklyGoalRead, WeeklyGoalUpdate

router = APIRouter(prefix="/weekly-goals", tags=["goals"])


async def _get_with_parent(db: AsyncSession, goal_id: uuid.UUID) -> WeeklyGoal | None:
    result = await db.execute(
        select(WeeklyGoal)
        .options(selectinload(WeeklyGoal.monthly_goal))
        .where(WeeklyGoal.id == goal_id)
    )
    return result.scalar_one_or_none()


@router.get("", summary="주간 목표 목록 조회")
async def list_weekly_goals(db: AsyncSession = Depends(get_db)) -> list[WeeklyGoalRead]:
    """모든 주간 목표를 생성 순서로 반환한다. `category_id`는 부모 월간 목표에서 상속된 값이다."""
    result = await db.execute(
        select(WeeklyGoal)
        .options(selectinload(WeeklyGoal.monthly_goal))
        .order_by(WeeklyGoal.created_at)
    )
    return list(result.scalars().all())


@router.post("", status_code=201, summary="주간 목표 생성")
async def create_weekly_goal(
    payload: WeeklyGoalCreate, db: AsyncSession = Depends(get_db)
) -> WeeklyGoalRead:
    """주간 목표를 만든다.

    `monthly_goal_id`는 선택 사항 — 생략하면 미분류(고아) 상태로
    생성된다. 카테고리는 입력받지 않으며 응답의 `category_id`는 항상
    부모 월간 목표에서 상속된 값이다(부모 없으면 null).
    """
    goal = WeeklyGoal(title=payload.title, monthly_goal_id=payload.monthly_goal_id)
    db.add(goal)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=400, detail="monthly goal not found") from exc
    return await _get_with_parent(db, goal.id)


@router.get("/{goal_id}", summary="주간 목표 단건 조회")
async def get_weekly_goal(goal_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> WeeklyGoalRead:
    """id로 주간 목표 하나를 조회한다. 없으면 404."""
    goal = await _get_with_parent(db, goal_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="weekly goal not found")
    return goal


@router.patch("/{goal_id}", summary="주간 목표 수정")
async def update_weekly_goal(
    goal_id: uuid.UUID, payload: WeeklyGoalUpdate, db: AsyncSession = Depends(get_db)
) -> WeeklyGoalRead:
    """title/monthly_goal_id를 부분 수정한다.

    `monthly_goal_id`를 null로 보내면 부모 연결을 해제한다(카테고리도
    같이 null이 됨). 없으면 404, 존재하지 않는 월간 목표면 400.
    """
    goal = await db.get(WeeklyGoal, goal_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="weekly goal not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=400, detail="monthly goal not found") from exc
    return await _get_with_parent(db, goal_id)


@router.delete("/{goal_id}", status_code=204, summary="주간 목표 삭제")
async def delete_weekly_goal(goal_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    """주간 목표를 삭제한다. 없으면 404."""
    goal = await db.get(WeeklyGoal, goal_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="weekly goal not found")
    await db.delete(goal)
    await db.commit()
