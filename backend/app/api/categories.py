import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate

MIN_CATEGORIES = 1
MAX_CATEGORIES = 8

router = APIRouter(prefix="/categories", tags=["categories"])


async def _count_categories(db: AsyncSession) -> int:
    result = await db.execute(select(func.count()).select_from(Category))
    return result.scalar_one()


@router.get("", summary="카테고리 목록 조회")
async def list_categories(db: AsyncSession = Depends(get_db)) -> list[CategoryRead]:
    """등록된 모든 카테고리를 생성 순서(오름차순)로 반환한다."""
    result = await db.execute(select(Category).order_by(Category.created_at))
    return list(result.scalars().all())


@router.post("", status_code=201, summary="카테고리 생성")
async def create_category(
    payload: CategoryCreate, db: AsyncSession = Depends(get_db)
) -> CategoryRead:
    """새 카테고리를 만든다.

    목표/일정에서 태그처럼 쓰이는 리소스라 개수를 제한한다 — 최대
    `MAX_CATEGORIES`(8)개를 넘어가면 400을 반환한다.
    """
    if await _count_categories(db) >= MAX_CATEGORIES:
        raise HTTPException(
            status_code=400, detail=f"카테고리는 최대 {MAX_CATEGORIES}개까지 만들 수 있습니다"
        )
    category = Category(name=payload.name, color=payload.color)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


@router.get("/{category_id}", summary="카테고리 단건 조회")
async def get_category(category_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> CategoryRead:
    """id로 카테고리 하나를 조회한다. 없으면 404."""
    category = await db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="category not found")
    return category


@router.patch("/{category_id}", summary="카테고리 수정")
async def update_category(
    category_id: uuid.UUID, payload: CategoryUpdate, db: AsyncSession = Depends(get_db)
) -> CategoryRead:
    """name/color를 부분 수정한다 (보낸 필드만 반영). 없으면 404."""
    category = await db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="category not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    await db.commit()
    await db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=204, summary="카테고리 삭제")
async def delete_category(category_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    """카테고리를 삭제한다.

    최소 `MIN_CATEGORIES`(1)개는 항상 남아있어야 하며 마지막 하나를
    지우려 하면 400을 반환한다. `monthly_goals`에서 이 카테고리를
    참조 중이면(FK RESTRICT) 409를 반환한다.
    """
    category = await db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="category not found")
    if await _count_categories(db) <= MIN_CATEGORIES:
        raise HTTPException(
            status_code=400, detail=f"카테고리는 최소 {MIN_CATEGORIES}개를 유지해야 합니다"
        )
    await db.delete(category)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=409, detail="이 카테고리를 사용 중인 목표가 있어 삭제할 수 없습니다"
        ) from exc
