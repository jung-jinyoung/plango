import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.retrospective import Retrospective
from app.schemas.retrospective import (
    DirectionResponse,
    RetrospectiveCreate,
    RetrospectivePeriodType,
    RetrospectiveRead,
    RetrospectiveUpdate,
    TransformRequest,
    TransformResponse,
)

router = APIRouter(prefix="/retrospectives", tags=["retrospectives"])

_DIRECTION_STUB = {
    RetrospectivePeriodType.DAILY: "오늘 못한 일과 소요 시간을 분석하는 기능은 준비 중입니다.",
    RetrospectivePeriodType.WEEKLY: (
        "이번 주 목표 달성률과 일별 기록을 분석하는 기능은 준비 중입니다."
    ),
    RetrospectivePeriodType.MONTHLY: (
        "이번 달 목표 달성률과 주간 기록을 분석하는 기능은 준비 중입니다."
    ),
}


@router.get("/direction", summary="AI 회고 방향성 제안 (스텁)")
async def get_direction(
    period_type: RetrospectivePeriodType = Query(...),
    period_start: str = Query(..., description="daily=날짜, weekly=주 시작일, monthly=월 1일"),
) -> DirectionResponse:
    """이 기간의 데이터를 분석해 회고 방향성을 제안한다.

    회고를 대신 써주는 게 아니라 참고할 방향만 제시한다. **지금은 스텁**이며
    저장하지 않는다 — 실제 분석 로직은 후속 작업.
    """
    return DirectionResponse(
        period_type=period_type,
        period_start=period_start,
        direction=_DIRECTION_STUB[period_type],
    )


@router.post("/transform", summary="AI 회고 문체 변형 (스텁)")
async def transform_content(payload: TransformRequest) -> TransformResponse:
    """사용자가 쓴 회고를 AI가 검토해 적합한 문체로 변형한다.

    사용자가 결과를 보고 다시 고치면 재호출하는 식으로 반복 사용된다
    (피드백 루프). **지금은 스텁**이며 저장하지 않고 원문을 그대로 돌려준다
    — 실제 변형 로직은 후속 작업.
    """
    return TransformResponse(content=payload.content)


@router.get("", summary="완료된 회고 목록 조회")
async def list_retrospectives(
    period_type: RetrospectivePeriodType | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[RetrospectiveRead]:
    """완료(저장)된 회고만 최신순으로 반환한다. 진행 중인 초안은 저장되지 않으므로 여기 없다."""
    stmt = select(Retrospective)
    if period_type is not None:
        stmt = stmt.where(Retrospective.period_type == period_type.value)
    result = await db.execute(stmt.order_by(Retrospective.period_start.desc()))
    return list(result.scalars().all())


@router.post("", status_code=201, summary="회고 완료 저장")
async def create_retrospective(
    payload: RetrospectiveCreate, db: AsyncSession = Depends(get_db)
) -> RetrospectiveRead:
    """작성·변형 과정을 마치고 최종 확정된 회고를 저장한다.

    같은 기간(`period_type`+`period_start`)에 이미 저장된 회고가 있으면 `409`.
    """
    retro = Retrospective(
        period_type=payload.period_type.value,
        period_start=payload.period_start,
        content=payload.content,
    )
    db.add(retro)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=409, detail="이 기간의 회고가 이미 존재합니다"
        ) from exc
    await db.refresh(retro)
    return retro


@router.get("/{retrospective_id}", summary="회고 단건 조회")
async def get_retrospective(
    retrospective_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> RetrospectiveRead:
    """id로 회고 하나를 조회한다. 없으면 404."""
    retro = await db.get(Retrospective, retrospective_id)
    if retro is None:
        raise HTTPException(status_code=404, detail="retrospective not found")
    return retro


@router.patch("/{retrospective_id}", summary="회고 수정")
async def update_retrospective(
    retrospective_id: uuid.UUID, payload: RetrospectiveUpdate, db: AsyncSession = Depends(get_db)
) -> RetrospectiveRead:
    """저장된 회고의 내용을 수정한다. 없으면 404."""
    retro = await db.get(Retrospective, retrospective_id)
    if retro is None:
        raise HTTPException(status_code=404, detail="retrospective not found")
    retro.content = payload.content
    await db.commit()
    await db.refresh(retro)
    return retro


@router.delete("/{retrospective_id}", status_code=204, summary="회고 삭제")
async def delete_retrospective(
    retrospective_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> None:
    """회고를 삭제한다. 없으면 404."""
    retro = await db.get(Retrospective, retrospective_id)
    if retro is None:
        raise HTTPException(status_code=404, detail="retrospective not found")
    await db.delete(retro)
    await db.commit()
