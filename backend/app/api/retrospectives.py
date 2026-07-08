from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/retrospectives", tags=["retrospectives"])


@router.get("")
async def list_retrospectives() -> list[dict]:
    return []


@router.post("", status_code=501)
async def create_retrospective() -> None:
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/{retrospective_id}")
async def get_retrospective(retrospective_id: str) -> None:
    raise HTTPException(status_code=404, detail="retrospective not found")


@router.patch("/{retrospective_id}", status_code=501)
async def update_retrospective(retrospective_id: str) -> None:
    raise HTTPException(status_code=501, detail="not implemented")


@router.delete("/{retrospective_id}", status_code=501)
async def delete_retrospective(retrospective_id: str) -> None:
    raise HTTPException(status_code=501, detail="not implemented")
