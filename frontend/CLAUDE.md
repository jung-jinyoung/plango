# CLAUDE.md

Guidance for Claude Code when working in this frontend repo. Each section is capped at 3-4 lines.

## Architecture
1. Stack: Quasar(Vue 3) + Pinia + vue-router, pnpm workspace.
2. 폴더 컨벤션: `src/components/{feature}/` 기능별 분리, `src/pages/app/*`는 인증 후 페이지, `src/stores/*`는 도메인별 Pinia 스토어 1개.
3. 디자인 토큰(`src/css/tokens.css`)은 색상 슬롯이 `--p-rose/blue/green/lavender` 4개로 고정 — `is-{color}` 클래스로만 사용, 5번째 색상 토큰 없음. "카테고리 추가"류 기능은 이 4슬롯 재할당으로 구현해야 함.
4. `src/services/ai/*`는 실제 AI 호출, `src/services/mock/*`는 시드 픽스처 — 어떤 게 연결돼 있는지 먼저 확인 후 동작 가정할 것.

## Testing
1. 현재 자동 테스트 없음 — `npm run lint:check`(eslint+prettier)가 유일한 정적 검증. 코드 변경 후 반드시 실행.
2. 기능 변경 검증은 `quasar dev`로 브라우저에서 golden path + edge case 직접 확인 (`/verify`, `/run` 스킬 활용).
3. vitest 등 테스트 프레임워크 도입은 임의로 하지 말고 먼저 사용자와 상의할 것.

## Safety
1. force-push, reset --hard, clean -f, branch -D 등 파괴적 git 명령 및 production 배포 실행은 사용자 승인 없이 금지.
2. `.env*` 파일은 읽기/쓰기 모두 금지 (커밋 대상 아님, gitignore 처리됨).
3. `rm -rf` 등 삭제성 명령은 대상 경로를 반드시 먼저 확인 후 실행.
4. 이 저장소는 master/backend/frontend 3개 장기 브랜치 구조 — 다른 브랜치로 강제 전환/삭제 금지, 항상 현재 작업 브랜치 유지.

## Workflow
1. 수정 전 계획(무엇을·왜)을 먼저 제시하고 승인받은 뒤 진행 — diff는 작게, 작업 단위 완료마다 커밋 제안.
2. PR 열기 전 변경 파일 + PR 제목/설명을 먼저 공유하고, 승인 후에만 push + PR 생성.
3. 브랜치명은 `type/설명` 컨벤션(`chore/`, `docs/`, `feat/` 등) 따르고, base는 `frontend` 브랜치.
4. 작업 마무리 시 변경 파일 목록을 요약해서 보고.
