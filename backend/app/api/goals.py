from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("")
async def list_goals() -> list[dict]:
    return []


@router.post("", status_code=501)
async def create_goal() -> None:
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/{goal_id}")
async def get_goal(goal_id: str) -> None:
    raise HTTPException(status_code=404, detail="goal not found")


@router.patch("/{goal_id}", status_code=501)
async def update_goal(goal_id: str) -> None:
    raise HTTPException(status_code=501, detail="not implemented")


@router.delete("/{goal_id}", status_code=501)
async def delete_goal(goal_id: str) -> None:
    raise HTTPException(status_code=501, detail="not implemented")
