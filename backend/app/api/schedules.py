from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/schedules", tags=["schedules"])


@router.get("")
async def list_schedules() -> list[dict]:
    return []


@router.post("", status_code=501)
async def create_schedule() -> None:
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/{schedule_id}")
async def get_schedule(schedule_id: str) -> None:
    raise HTTPException(status_code=404, detail="schedule not found")


@router.patch("/{schedule_id}", status_code=501)
async def update_schedule(schedule_id: str) -> None:
    raise HTTPException(status_code=501, detail="not implemented")


@router.delete("/{schedule_id}", status_code=501)
async def delete_schedule(schedule_id: str) -> None:
    raise HTTPException(status_code=501, detail="not implemented")
