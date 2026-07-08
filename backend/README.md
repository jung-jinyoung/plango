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

## 현재 범위

- 앱 스캐폴드 (설정, 도구 체인)
- Supabase Postgres 연동 (SQLAlchemy async + asyncpg, `app/core/db.py`)
- 헬스체크 (`app/api/health.py`, `tags=["infra"]`) — 배포 플랫폼의 liveness/readiness probe 용도이며 제품 도메인 API와는 태그로 구분되어 있습니다.
- 도메인 라우터 스캐폴드 (goals/todos/schedules/categories/retrospectives) — CRUD 엔드포인트 자리만 잡은 상태이며 실제 모델/로직은 후속 브랜치에서 채웁니다.
- 사용자 프로필 (`app/api/users.py`) — 회원가입/로그인은 Supabase Auth에 위임하고(프론트엔드가 supabase-js로 직접 처리), 백엔드는 `/users/me` 프로필/설정 조회·수정만 담당합니다. Supabase JWT 검증 의존성은 후속 브랜치에서 추가합니다.

AI 연동(우선순위 추천, 회고 자동 생성)은 후속 브랜치에서 진행합니다.

## 알려진 갭 (기획안 대비)

- 목표 계층 구조(월간/주간 구분, 상위 목표 연결, 역방향 조회용 라우트)는 아직 반영되지 않았습니다 — `goals` 도메인 모델 설계 시 함께 결정합니다.
- 할 일/일정의 "다음 날 또는 주간 목표로 이월" 액션은 아직 전용 엔드포인트 없이 범용 PATCH로만 대체 가능합니다 — 실제 필요 여부는 `todos`/`schedules` 모델 설계 시 결정합니다.
