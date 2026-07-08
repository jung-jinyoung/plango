import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.todo import Todo
from app.schemas.todo import PRIORITY_VALUES, TodoCreate, TodoRead, TodoUpdate

router = APIRouter(prefix="/todos", tags=["todos"])


def _resolve_create_priority(payload: TodoCreate) -> float:
    if payload.priority is not None:
        return PRIORITY_VALUES[payload.priority]
    if payload.fixed_time is not None:
        return 1.0
    return 0.0


@router.get("", summary="할 일 목록 조회")
async def list_todos(db: AsyncSession = Depends(get_db)) -> list[TodoRead]:
    """모든 할 일을 날짜순으로 반환한다."""
    result = await db.execute(select(Todo).order_by(Todo.date, Todo.created_at))
    return list(result.scalars().all())


@router.post("", status_code=201, summary="할 일 생성")
async def create_todo(payload: TodoCreate, db: AsyncSession = Depends(get_db)) -> TodoRead:
    """할 일을 만든다.

    `priority`를 명시하지 않으면 `fixed_time`이 있을 때는 자동으로
    high(1.0), 없으면 low(0.0)가 된다.
    """
    data = payload.model_dump(exclude={"priority"})
    todo = Todo(**data, priority=_resolve_create_priority(payload))
    db.add(todo)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=400, detail="weekly goal not found") from exc
    await db.refresh(todo)
    return todo


@router.get("/{todo_id}", summary="할 일 단건 조회")
async def get_todo(todo_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> TodoRead:
    """id로 할 일 하나를 조회한다. 없으면 404."""
    todo = await db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="todo not found")
    return todo


@router.patch("/{todo_id}", summary="할 일 수정")
async def update_todo(
    todo_id: uuid.UUID, payload: TodoUpdate, db: AsyncSession = Depends(get_db)
) -> TodoRead:
    """할 일을 부분 수정한다.

    이월(carry-over)은 전용 엔드포인트 없이 `date`만 바꿔서 보내면 된다
    — 나머지 필드는 그대로 유지된다. `priority`를 안 주고 `fixed_time`을
    새로 설정하면 자동으로 high(1.0)가 된다. 단, 이미 완료된(`is_done`)
    할 일은 날짜를 옮길 수 없다 (이월은 미완료 항목만 대상).
    """
    todo = await db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="todo not found")

    updates = payload.model_dump(exclude_unset=True)
    priority_provided = "priority" in updates
    priority_level = updates.pop("priority", None)
    fixed_time_newly_set = "fixed_time" in updates and updates["fixed_time"] is not None

    if "date" in updates and updates.get("is_done", todo.is_done):
        raise HTTPException(
            status_code=400, detail="이미 완료된 할 일은 다른 날짜로 이월할 수 없습니다"
        )

    for field, value in updates.items():
        setattr(todo, field, value)

    if priority_provided and priority_level is not None:
        todo.priority = PRIORITY_VALUES[priority_level]
    elif not priority_provided and fixed_time_newly_set:
        todo.priority = 1.0

    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=400, detail="weekly goal not found") from exc
    await db.refresh(todo)
    return todo


@router.delete("/{todo_id}", status_code=204, summary="할 일 삭제")
async def delete_todo(todo_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    """할 일을 삭제한다. 없으면 404."""
    todo = await db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="todo not found")
    await db.delete(todo)
    await db.commit()
