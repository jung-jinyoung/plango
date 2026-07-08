from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("")
async def list_todos() -> list[dict]:
    return []


@router.post("", status_code=501)
async def create_todo() -> None:
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/{todo_id}")
async def get_todo(todo_id: str) -> None:
    raise HTTPException(status_code=404, detail="todo not found")


@router.patch("/{todo_id}", status_code=501)
async def update_todo(todo_id: str) -> None:
    raise HTTPException(status_code=501, detail="not implemented")


@router.delete("/{todo_id}", status_code=501)
async def delete_todo(todo_id: str) -> None:
    raise HTTPException(status_code=501, detail="not implemented")
