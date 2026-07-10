# 컴포넌트 × 컬러 매핑

`grep -rl "is-rose\|is-blue\|is-green\|is-lavender\|is-amber\|is-teal\|is-plum\|is-slate" src/components`로 확인한 실제 사용 현황이다 (추측 아님).

> 2026-07-10: 카테고리 슬롯이 4개→8개로 확장되면서 아래 9개 컴포넌트 전부 `is-amber`/`is-teal`/`is-plum`/`is-slate` variant도 함께 지원하도록 갱신했다.

## 8색(rose/amber/green/teal/blue/lavender/plum/slate) 전체 지원 컴포넌트

아래 9개는 8가지 색상 variant 클래스를 전부 지원하고, 실제로 어떤 색이 쓰일지는 데이터(목표/일정/카테고리의 `color` 필드)에 따라 동적으로 결정된다 — 즉 이 컴포넌트들 자체에 고정된 색은 없다.

| 컴포넌트 | 경로 | 색이 어디서 오는가 |
|---|---|---|
| GoalCard | `src/components/goals/GoalCard.vue` | `goal.color` (사용자가 카테고리 관리에서 지정) |
| GoalHeaderRow | `src/components/goals/GoalHeaderRow.vue` | `goal.color` |
| ProgressBar | `src/components/ui/ProgressBar.vue` | `color` prop (호출부가 전달) |
| ScheduleCard | `src/components/daily-plan/ScheduleCard.vue` | `schedule.categoryColor` |
| DailyTimeline | `src/components/daily-plan/DailyTimeline.vue` | 내부 ScheduleCard들의 categoryColor |
| MonthCalendarGrid | `src/components/calendar/MonthCalendarGrid.vue` | 날짜별 일정의 categoryColor |
| BarChart | `src/components/retrospective/BarChart.vue` | 카테고리별 완료 데이터의 color |
| AiRecommendationCard | `src/components/daily-plan/AiRecommendationCard.vue` | AI 추천 항목의 categoryColor |
| CategoryManageModal | `src/components/settings/CategoryManageModal.vue` | `categories` 스토어의 8개 고정 슬롯(로즈/앰버/그린/틸/블루/라벤더/플럼/슬레이트) 자체를 나열 |

## 고정 색상 컴포넌트

| 컴포넌트 | 경로 | 색 | 비고 |
|---|---|---|---|
| BaseButton | `src/components/ui/BaseButton.vue` | rose (`is-primary`만) | secondary/ghost는 무채색(surface 기반), 브랜드 컬러 아님 |

## 선언됐지만 미사용

- **negative**(`#dc2626`) — `quasar.variables.scss`에 토큰은 있지만 커스텀 컴포넌트 어디서도 참조하지 않는다. Quasar 프레임워크의 `$negative` 시맨틱 슬롯(예: `QBtn color="negative"`, `notify()`)에만 연결돼 있다.
- amber는 2026-07-10부터 카테고리 8번째 슬롯으로도 쓰이기 시작했다 — Quasar `$warning` 시맨틱 슬롯과 겸용(각각 다른 UI 맥락이라 혼동 위험은 낮다고 판단했다).

## 8색의 실제 의미

카테고리(로즈/앰버/그린/틸/블루/라벤더/플럼/슬레이트)는 **고정된 의미가 없다** — `src/stores/categories.js`에서 이름을 자유롭게 바꿀 수 있는 8개 색상 슬롯일 뿐이다. 즉 "로즈 = 업무" 같은 의미는 사용자가 카테고리 관리 화면(G2)에서 직접 부여한다.

## Figma 반영 상태

Figma MCP 호출 한도(팀 "2026 CJ AI SW WAVE"에서의 좌석이 View — 월 6회 제한, Dev/Full 좌석이면 일 200회)로 이 매핑을 Figma 페이지에 시각화하는 작업(색상 스와치 + 컴포넌트 이름 리스트)은 중단된 상태다.

**재개 방법**: 좌석이 Dev/Full로 바뀌거나 월 한도가 리셋되면, 아래 문구로 새 세션을 시작:
> "Figma 디자인 시스템 문서 페이지 작업을 이어가려 합니다. Run ID: plango-ds-2026-07-08. 파일 `6Y0lN0gTKRi3kPE85yNox4`의 페이지 `72:2`("개인 pjt figma MCP")에 이미 Plango Tokens 변수 컬렉션(18개)과 Effect/Text Style이 만들어져 있습니다. 이 문서(`design-system/tokens.md`, `components.md`)를 참고해서 색상 팔레트 섹션 + 컴포넌트×컬러 섹션을 페이지 안에 만들어주세요."
