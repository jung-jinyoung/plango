import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("")
async def list_categories(db: AsyncSession = Depends(get_db)) -> list[CategoryRead]:
    result = await db.execute(select(Category).order_by(Category.created_at))
    return list(result.scalars().all())


@router.post("", status_code=201)
async def create_category(
    payload: CategoryCreate, db: AsyncSession = Depends(get_db)
) -> CategoryRead:
    category = Category(name=payload.name, color=payload.color)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


@router.get("/{category_id}")
async def get_category(category_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> CategoryRead:
    category = await db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="category not found")
    return category


@router.patch("/{category_id}")
async def update_category(
    category_id: uuid.UUID, payload: CategoryUpdate, db: AsyncSession = Depends(get_db)
) -> CategoryRead:
    category = await db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="category not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    await db.commit()
    await db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=204)
async def delete_category(category_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    category = await db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="category not found")
    await db.delete(category)
    await db.commit()
