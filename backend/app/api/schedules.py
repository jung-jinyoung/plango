import uuid
from datetime import date as date_

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.todo import Todo
from app.schemas.schedule import SchedulePlace, ScheduleRead, ScheduleUpdate

router = APIRouter(prefix="/schedules", tags=["schedules"])

# 겹치는 항목을 뒤로 밀 때 두는 간격(분). 프론트 목업의 GAP과 동일.
GAP_MINUTES = 10


async def _find_conflict(
    db: AsyncSession, date: date_, candidate_start: int, duration: int, exclude_id: uuid.UUID
) -> Todo | None:
    result = await db.execute(
        select(Todo).where(
            Todo.date == date,
            Todo.is_scheduled.is_(True),
            Todo.id != exclude_id,
        )
    )
    candidate_end = candidate_start + duration
    for other in result.scalars():
        other_end = other.scheduled_time + other.estimated_minutes
        if candidate_start < other_end and candidate_end > other.scheduled_time:
            return other
    return None


async def _resolve_start(
    db: AsyncSession, date: date_, candidate_start: int, duration: int, exclude_id: uuid.UUID
) -> int:
    """겹치는 항목이 없어질 때까지 뒤로 밀어 다음 빈 시간을 찾는다."""
    start = candidate_start
    conflict = await _find_conflict(db, date, start, duration, exclude_id)
    while conflict is not None:
        start = conflict.scheduled_time + conflict.estimated_minutes + GAP_MINUTES
        conflict = await _find_conflict(db, date, start, duration, exclude_id)
    return start


def _conflict_detail(conflict: Todo) -> dict:
    return {
        "message": "이 시간대에 이미 배치된 일정이 있습니다",
        "conflict": {
            "todo_id": str(conflict.id),
            "title": conflict.title,
            "scheduled_time": conflict.scheduled_time,
            "estimated_minutes": conflict.estimated_minutes,
        },
    }


@router.get("", summary="일정(타임라인에 배치된 할 일) 목록 조회")
async def list_schedules(
    date: date_ | None = Query(default=None, description="주면 그 날짜만, 없으면 전체"),
    db: AsyncSession = Depends(get_db),
) -> list[ScheduleRead]:
    """`is_scheduled=true`인 todo만 시각순으로 반환한다."""
    stmt = select(Todo).where(Todo.is_scheduled.is_(True))
    if date is not None:
        stmt = stmt.where(Todo.date == date)
    result = await db.execute(stmt.order_by(Todo.date, Todo.scheduled_time))
    return list(result.scalars().all())


@router.post("", status_code=201, summary="할 일을 타임라인에 배치")
async def place_schedule(
    payload: SchedulePlace, db: AsyncSession = Depends(get_db)
) -> ScheduleRead:
    """todo를 특정 시각에 배치한다.

    같은 날짜의 다른 배치된 todo와 시간이 겹치면, `auto_resolve=false`(기본)일
    땐 409로 거부하고, `true`면 겹치는 항목 뒤로 `GAP_MINUTES`만큼 띄운
    다음 빈 시간에 자동으로 배치한다.
    """
    todo = await db.get(Todo, payload.todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="todo not found")

    start = payload.scheduled_time
    conflict = await _find_conflict(db, todo.date, start, todo.estimated_minutes, todo.id)
    if conflict is not None:
        if not payload.auto_resolve:
            raise HTTPException(status_code=409, detail=_conflict_detail(conflict))
        start = await _resolve_start(db, todo.date, start, todo.estimated_minutes, todo.id)

    todo.scheduled_time = start
    todo.is_scheduled = True
    todo.source = payload.source.value
    await db.commit()
    await db.refresh(todo)
    return todo


@router.patch("/{todo_id}", summary="배치된 일정 수정(이동/메모/완료)")
async def update_schedule(
    todo_id: uuid.UUID, payload: ScheduleUpdate, db: AsyncSession = Depends(get_db)
) -> ScheduleRead:
    """이미 배치된 todo의 시각을 옮기거나 메모/완료 상태를 바꾼다.

    시각 이동 시에도 배치와 동일한 겹침 검사 + `auto_resolve` 규칙이 적용된다.
    """
    todo = await db.get(Todo, todo_id)
    if todo is None or not todo.is_scheduled:
        raise HTTPException(status_code=404, detail="schedule not found")

    updates = payload.model_dump(exclude_unset=True, exclude={"auto_resolve"})

    if "scheduled_time" in updates and updates["scheduled_time"] != todo.scheduled_time:
        start = updates["scheduled_time"]
        conflict = await _find_conflict(db, todo.date, start, todo.estimated_minutes, todo.id)
        if conflict is not None:
            if not payload.auto_resolve:
                raise HTTPException(status_code=409, detail=_conflict_detail(conflict))
            start = await _resolve_start(db, todo.date, start, todo.estimated_minutes, todo.id)
        updates["scheduled_time"] = start

    for field, value in updates.items():
        setattr(todo, field, value)

    await db.commit()
    await db.refresh(todo)
    return todo


@router.delete("/{todo_id}", status_code=204, summary="타임라인에서 배치 해제")
async def remove_schedule(todo_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    """todo를 삭제하지 않고 배치 정보만 지운다.

    (`is_scheduled=false`, `scheduled_time`/`source`는 null이 된다)

    todo 자체를 지우려면 `DELETE /todos/{todo_id}`를 쓴다.
    """
    todo = await db.get(Todo, todo_id)
    if todo is None or not todo.is_scheduled:
        raise HTTPException(status_code=404, detail="schedule not found")
    todo.scheduled_time = None
    todo.is_scheduled = False
    todo.source = None
    await db.commit()
