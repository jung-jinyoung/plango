from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("")
async def list_categories() -> list[dict]:
    return []


@router.post("", status_code=501)
async def create_category() -> None:
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/{category_id}")
async def get_category(category_id: str) -> None:
    raise HTTPException(status_code=404, detail="category not found")


@router.patch("/{category_id}", status_code=501)
async def update_category(category_id: str) -> None:
    raise HTTPException(status_code=501, detail="not implemented")


@router.delete("/{category_id}", status_code=501)
async def delete_category(category_id: str) -> None:
    raise HTTPException(status_code=501, detail="not implemented")
