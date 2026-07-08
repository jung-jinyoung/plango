from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    categories,
    health,
    monthly_goals,
    retrospectives,
    schedules,
    todos,
    users,
    weekly_goals,
)
from app.core.config import settings

tags_metadata = [
    {"name": "infra", "description": "배포 플랫폼용 헬스체크. 제품 도메인 API가 아니다."},
    {
        "name": "users",
        "description": "사용자 프로필. 회원가입/로그인은 Supabase Auth에 위임하고, "
        "여기서는 `/users/me` 프로필 조회·수정만 다룬다.",
    },
    {
        "name": "categories",
        "description": "목표/일정에 태그처럼 붙는 카테고리. 개수는 최소 1개, 최대 8개로 제한된다.",
    },
    {
        "name": "goals",
        "description": "월간/주간 목표. `monthly-goals`와 `weekly-goals`로 리소스가 분리되어 있다. "
        "주간 목표는 카테고리를 직접 갖지 않고 "
        "부모 월간 목표의 카테고리를 상속한다.",
    },
    {
        "name": "todos",
        "description": "할 일. `fixed_time`이 있으면 그 시간대에 고정 배치되어야 하고 "
        "priority가 자동으로 high가 된다. 이월은 `date` 필드만 바꾸면 된다.",
    },
    {
        "name": "schedules",
        "description": "타임라인에 배치된 할 일을 다루는 API. 별도 테이블이 아니라 "
        "`todos`를 그대로 조회·수정하는 관점의 레이어이다. "
        "시간이 겹치면 409 또는 `auto_resolve`로 자동 재배치된다.",
    },
    {
        "name": "retrospectives",
        "description": "일일/주간/월간 회고. AI 방향성 제안·문체 변형"
        "(`/direction`, `/transform`)은 스텁이며 아무것도 저장하지 않는다 — "
        "사용자가 완료를 눌러야 그때 저장된다.",
    },
]

app = FastAPI(
    title=settings.app_name,
    description="Plango 백엔드 API — Plan it, Live it, Reflect on it.",
    openapi_tags=tags_metadata,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(users.router)
app.include_router(monthly_goals.router)
app.include_router(weekly_goals.router)
app.include_router(todos.router)
app.include_router(schedules.router)
app.include_router(categories.router)
app.include_router(retrospectives.router)
