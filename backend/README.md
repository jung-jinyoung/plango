# Plango Backend

FastAPI 기반 백엔드 API. 패키지/가상환경 관리는 [uv](https://docs.astral.sh/uv/)를 사용합니다.

## 시작하기

```bash
cd backend
uv sync              # .venv 생성 + 의존성 설치
uv run uvicorn app.main:app --reload
```

서버 기동 후 `http://localhost:8000/health` 로 확인합니다.

DB 연동 상태는 `http://localhost:8000/health/db` 로 확인합니다 (`.env`의 `DATABASE_URL` 필요, `.env.example` 참고).

## 테스트 / 린트

```bash
uv run pytest
uv run ruff check .
```

## 현재 범위

- 앱 스캐폴드 (health check, 설정, 도구 체인)
- Supabase Postgres 연동 (SQLAlchemy async + asyncpg, `app/core/db.py`)
- 도메인 라우터 스캐폴드 (goals/todos/schedules/categories) — CRUD 엔드포인트 자리만 잡은 상태이며 실제 모델/로직은 후속 브랜치에서 채웁니다.

AI 연동은 후속 브랜치에서 진행합니다.
