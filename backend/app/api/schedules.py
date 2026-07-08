import uuid
from datetime import date as date_

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.db import get_db
from app.models.schedule import Schedule
from app.models.todo import Todo
from app.schemas.schedule import ScheduleCreate, ScheduleRead, ScheduleUpdate

router = APIRouter(prefix="/schedules", tags=["schedules"])

# 겹치는 항목을 뒤로 밀 때 두는 간격(분). 프론트 목업의 GAP과 동일.
GAP_MINUTES = 10


def _to_read(schedule: Schedule) -> ScheduleRead:
    todo = schedule.todo
    return ScheduleRead(
        todo_id=schedule.todo_id,
        title=todo.title,
        date=todo.date,
        scheduled_time=schedule.scheduled_time,
        estimated_minutes=todo.estimated_minutes,
        note=schedule.note,
        reason=schedule.reason,
        source=schedule.source,
        is_done=todo.is_done,
        weekly_goal_id=todo.weekly_goal_id,
        created_at=schedule.created_at,
        updated_at=schedule.updated_at,
    )


async def _get_schedule_by_todo_id(db: AsyncSession, todo_id: uuid.UUID) -> Schedule | None:
    result = await db.execute(
        select(Schedule)
        .options(selectinload(Schedule.todo))
        .where(Schedule.todo_id == todo_id)
    )
    return result.scalar_one_or_none()


async def _find_conflict(
    db: AsyncSession, date: date_, candidate_start: int, duration: int, exclude_todo_id: uuid.UUID
) -> Schedule | None:
    result = await db.execute(
        select(Schedule)
        .join(Todo, Schedule.todo_id == Todo.id)
        .options(selectinload(Schedule.todo))
        .where(Todo.date == date, Schedule.todo_id != exclude_todo_id)
    )
    candidate_end = candidate_start + duration
    for other in result.scalars():
        other_end = other.scheduled_time + other.todo.estimated_minutes
        if candidate_start < other_end and candidate_end > other.scheduled_time:
            return other
    return None


async def _resolve_start(
    db: AsyncSession, date: date_, candidate_start: int, duration: int, exclude_todo_id: uuid.UUID
) -> int:
    """겹치는 항목이 없어질 때까지 뒤로 밀어 다음 빈 시간을 찾는다."""
    start = candidate_start
    conflict = await _find_conflict(db, date, start, duration, exclude_todo_id)
    while conflict is not None:
        start = conflict.scheduled_time + conflict.todo.estimated_minutes + GAP_MINUTES
        conflict = await _find_conflict(db, date, start, duration, exclude_todo_id)
    return start


def _conflict_detail(conflict: Schedule) -> dict:
    return {
        "message": "이 시간대에 이미 배치된 일정이 있습니다",
        "conflict": {
            "todo_id": str(conflict.todo_id),
            "title": conflict.todo.title,
            "scheduled_time": conflict.scheduled_time,
            "estimated_minutes": conflict.todo.estimated_minutes,
        },
    }


@router.get("", summary="일정(타임라인에 배치된 할 일) 목록 조회")
async def list_schedules(
    date: date_ | None = Query(default=None, description="주면 그 날짜만, 없으면 전체"),
    db: AsyncSession = Depends(get_db),
) -> list[ScheduleRead]:
    """배치된 항목만 시각순으로 반환한다."""
    stmt = select(Schedule).join(Todo, Schedule.todo_id == Todo.id).options(
        selectinload(Schedule.todo)
    )
    if date is not None:
        stmt = stmt.where(Todo.date == date)
    result = await db.execute(stmt.order_by(Todo.date, Schedule.scheduled_time))
    return [_to_read(s) for s in result.scalars().all()]


@router.post("", status_code=201, summary="할 일을 타임라인에 배치")
async def place_schedule(
    payload: ScheduleCreate, db: AsyncSession = Depends(get_db)
) -> ScheduleRead:
    """todo를 특정 시각에 배치한다 (한 todo당 배치는 하나뿐 — 이미 배치돼 있으면 409).

    같은 날짜의 다른 배치된 todo와 시간이 겹치면, `auto_resolve=false`(기본)일
    땐 409로 거부하고, `true`면 겹치는 항목 뒤로 `GAP_MINUTES`만큼 띄운
    다음 빈 시간에 자동으로 배치한다.
    """
    todo = await db.get(Todo, payload.todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="todo not found")

    existing = await _get_schedule_by_todo_id(db, payload.todo_id)
    if existing is not None:
        raise HTTPException(
            status_code=409, detail="이미 배치된 할 일입니다. 이동하려면 PATCH를 사용하세요"
        )

    start = payload.scheduled_time
    conflict = await _find_conflict(db, todo.date, start, todo.estimated_minutes, todo.id)
    if conflict is not None:
        if not payload.auto_resolve:
            raise HTTPException(status_code=409, detail=_conflict_detail(conflict))
        start = await _resolve_start(db, todo.date, start, todo.estimated_minutes, todo.id)

    schedule = Schedule(
        todo_id=todo.id, scheduled_time=start, source=payload.source.value
    )
    db.add(schedule)
    await db.commit()
    schedule = await _get_schedule_by_todo_id(db, todo.id)
    return _to_read(schedule)


@router.patch("/{todo_id}", summary="배치된 일정 수정(이동/메모)")
async def update_schedule(
    todo_id: uuid.UUID, payload: ScheduleUpdate, db: AsyncSession = Depends(get_db)
) -> ScheduleRead:
    """이미 배치된 todo의 시각을 옮기거나 메모를 바꾼다.

    완료 체크(`is_done`)는 순수 todo 소관이라 `PATCH /todos/{todo_id}`를 쓴다.
    시각 이동 시에는 배치와 동일한 겹침 검사 + `auto_resolve` 규칙이 적용된다.
    """
    schedule = await _get_schedule_by_todo_id(db, todo_id)
    if schedule is None:
        raise HTTPException(status_code=404, detail="schedule not found")

    updates = payload.model_dump(exclude_unset=True, exclude={"auto_resolve"})

    if "scheduled_time" in updates and updates["scheduled_time"] != schedule.scheduled_time:
        start = updates["scheduled_time"]
        todo = schedule.todo
        conflict = await _find_conflict(db, todo.date, start, todo.estimated_minutes, todo_id)
        if conflict is not None:
            if not payload.auto_resolve:
                raise HTTPException(status_code=409, detail=_conflict_detail(conflict))
            start = await _resolve_start(db, todo.date, start, todo.estimated_minutes, todo_id)
        updates["scheduled_time"] = start

    for field, value in updates.items():
        setattr(schedule, field, value)

    await db.commit()
    schedule = await _get_schedule_by_todo_id(db, todo_id)
    return _to_read(schedule)


@router.delete("/{todo_id}", status_code=204, summary="타임라인에서 배치 해제")
async def remove_schedule(todo_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    """schedule row를 지운다 (todo 자체는 유지).

    todo를 지우려면 `DELETE /todos/{todo_id}`를 쓴다.
    """
    schedule = await _get_schedule_by_todo_id(db, todo_id)
    if schedule is None:
        raise HTTPException(status_code=404, detail="schedule not found")
    await db.delete(schedule)
    await db.commit()
