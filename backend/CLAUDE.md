# Plango Backend

## Architecture
- app/api(라우트) → app/schemas(pydantic) → app/models(SQLAlchemy) → app/core(config/db) 순으로 의존
- 새 모델은 app/models/__init__.py에 import해야 alembic autogenerate가 인식함
- schedules는 todos의 컬럼이 아니라 todo_id(FK, unique)로 연결된 별도 테이블; is_scheduled는 저장값이 아니라 schedules row 존재 여부로 계산됨
- weekly_goals는 자체 category_id가 없고 weekly_goal_id로 monthly_goals의 카테고리를 상속받음

## Testing
- uv run pytest, uv run ruff check . 둘 다 통과해야 완료로 간주
- 서버 기동 후 GET /health, /health/db로 기동·DB 연결 확인 (DATABASE_URL 필요)
- 새 도메인 로직 추가 시 tests/에 대응 테스트 추가 (현재 test_health.py만 존재)

## Safety
- alembic downgrade, dropdb, DROP/TRUNCATE, git push --force, git reset --hard는 승인 없이 실행 금지
- .env는 쓰기·수정·커밋 금지 — Supabase 자격증명은 로컬 .env에만 존재
- retrospectives의 direction/transform은 스텁 — 저장되거나 실제 AI를 호출한다고 가정하지 말 것

## Workflow
- 수정 전에 먼저 계획을 제시한다
- 새 기능/수정은 backend에서 feature 브랜치를 따서 작업한다
- 작업 단위가 끝나면 diff를 작게 유지한 채 커밋을 제안한다
- PR base는 backend (master/main 아님, main은 배포 전 별도 생성 예정)
- PR을 올리기 전엔 변경 파일과 PR 내용을 요약해 공유하고, 승인받은 뒤 push·PR
