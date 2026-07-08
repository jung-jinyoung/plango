# Plango Backend

FastAPI 기반 백엔드 API. 패키지/가상환경 관리는 [uv](https://docs.astral.sh/uv/)를 사용합니다.

## 시작하기

```bash
cd backend
uv sync              # .venv 생성 + 의존성 설치
uv run uvicorn app.main:app --reload
```

서버 기동 후 `http://localhost:8000/health` 로 확인합니다.

## 테스트 / 린트

```bash
uv run pytest
uv run ruff check .
```

## 현재 범위

이 단계는 앱 스캐폴드(health check, 설정, 도구 체인)만 포함합니다. DB 연동(Supabase)과 도메인 라우터(goals/todos/schedules/categories), AI 연동은 후속 브랜치에서 진행합니다.
