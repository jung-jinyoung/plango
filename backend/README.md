# Plango Backend

FastAPI 기반 백엔드 API. 패키지/가상환경 관리는 [uv](https://docs.astral.sh/uv/)를 사용합니다.

## 시작하기

### uv 사용 (권장)

```bash
cd backend
uv sync              # .venv 생성 + 의존성 설치
uv run uvicorn app.main:app --reload
```

### uv 없이 pip만으로

uv가 없는 환경에서는 `uv.lock`에서 뽑아낸 `requirements.txt` / `requirements-dev.txt`로 설치할 수 있습니다.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
uvicorn app.main:app --reload
```

`requirements*.txt`는 의존성 변경 시 아래 명령으로 재생성합니다 (`uv.lock`이 기준):

```bash
uv export --no-dev --no-emit-project --no-header --format requirements.txt -o requirements.txt
uv export --only-dev --no-emit-project --no-header --format requirements.txt -o requirements-dev.txt
```

서버 기동 후 `http://localhost:8000/health` 로 확인합니다.

DB 연동 상태는 `http://localhost:8000/health/db` 로 확인합니다 (`.env`의 `DATABASE_URL` 필요, `.env.example` 참고).

## 테스트 / 린트

```bash
uv run pytest
uv run ruff check .
```

## DB 마이그레이션 (Alembic)

`DATABASE_URL`이 `.env`에 설정되어 있어야 합니다.

```bash
uv run alembic revision --autogenerate -m "설명"   # 모델 변경사항으로 마이그레이션 생성
uv run alembic upgrade head                          # 마이그레이션 적용
```

`alembic/env.py`는 `app.core.config.settings.database_url`과 `app.core.db.Base.metadata`(→ `app/models/`)를 그대로 사용합니다. 새 모델을 추가하면 `app/models/__init__.py`에 import를 추가해야 autogenerate가 인식합니다.

## 현재 범위

- 앱 스캐폴드 (설정, 도구 체인)
- Supabase Postgres 연동 (SQLAlchemy async + asyncpg, `app/core/db.py`) + Alembic 마이그레이션
- 헬스체크 (`app/api/health.py`, `tags=["infra"]`) — 배포 플랫폼의 liveness/readiness probe 용도이며 제품 도메인 API와는 태그로 구분되어 있습니다.
- `categories` — 실제 모델(`app/models/category.py`)과 DB 연동 CRUD로 전환됨 (id/name/color/timestamps). 개수 제약 최소 1개·최대 8개 (태그처럼 쓰이는 리소스라 자유 CRUD지만 개수는 제한). 사용자 소유권(`user_id`)은 아직 없음 — Supabase JWT 검증이 붙으면 추가할 예정.
- `monthly-goals`/`weekly-goals` — `goals`를 프론트 실제 구조(월간/주간 완전 분리)에 맞춰 두 리소스로 재구성. `monthly_goals.category_id`는 필수(FK, 삭제 시 RESTRICT), `weekly_goals`는 자체 카테고리 컬럼 없이 `monthly_goal_id`(nullable, 부모 삭제 시 SET NULL)로 부모의 카테고리를 상속. 부모 없는 weekly goal은 `category_id`가 `null`.
- 나머지 도메인 라우터(todos/schedules/retrospectives)는 여전히 stub — categories/goals와 동일한 패턴(모델 + Pydantic 스키마 + 실제 CRUD)으로 순차 전환 예정.
- 사용자 프로필 (`app/api/users.py`) — 회원가입/로그인은 Supabase Auth에 위임하고(프론트엔드가 supabase-js로 직접 처리), 백엔드는 `/users/me` 프로필/설정 조회·수정만 담당합니다. Supabase JWT 검증 의존성은 후속 브랜치에서 추가합니다.

AI 연동(우선순위 추천, 회고 자동 생성)은 후속 브랜치에서 진행합니다.

## 알려진 갭 (기획안 대비)

- 할 일/일정의 "다음 날 또는 주간 목표로 이월" 액션은 아직 전용 엔드포인트 없이 범용 PATCH로만 대체 가능합니다 — 실제 필요 여부는 `todos`/`schedules` 모델 설계 시 결정합니다.
- 리소스 소유권(`user_id`)이 아직 어떤 도메인에도 없습니다 — Supabase JWT 검증 의존성이 붙을 때 `categories`부터 함께 추가합니다.
- `todos`의 `goal_id`가 `weekly_goals`만 가리킬 수 있는지(월간 목표에는 직접 태그 불가) 아직 강제되지 않습니다 — `todos` 도메인 정리 시 결정합니다.
