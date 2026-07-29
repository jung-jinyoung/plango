# CLAUDE.md — Plango 개발 지침

이 문서는 **작업할 때 지켜야 할 규칙**을 담는다.
"왜 그렇게 정했는가"는 `docs/product-spec.md`(기획서 v4)에 있다. 판단이 필요할 때만 열어본다.

**문서와 코드가 어긋나면 코드를 고치기 전에 먼저 물어본다.** 임의로 문서를 무시하지 않는다.

---

## 1. 제품 한 줄

생산적인 하루를 만들기 위해, 계획하고 실행하고 회고하는 개인 플랫폼.

**설계 원칙**: 회고가 본체다. 기능을 넣을지 애매하면 **"회고에 쓸 데이터가 남는가"** 로 판정한다.

---

## 2. 절대 규칙

깨면 제품이 성립하지 않는다. 어떤 이유로도 우회하지 않는다.

| # | 규칙 |
|---|---|
| R1 | `plannedBlock`과 `actualBlock`은 **별개 필드**다. 하나로 합치지 않는다 |
| R2 | "오늘 확정" 이후 `plannedBlock`은 **읽기 전용**이다 |
| R3 | 현재 시각 **이후** 드래그 = 계획 수정 / **이전** 드래그 = 실제 기록 |
| R4 | 지난 주의 기록은 이동·수정하지 않는다. 이월은 **새 항목 생성**이다 |
| R5 | 카테고리는 목표에만 저장한다. 할 일은 **읽을 때 파생**시킨다 (값 복사 금지) |
| R6 | AI는 상태를 직접 변경하지 않는다. **제안 → 사용자 수락 → 변경** |
| R7 | `estimatedMin`은 **사용자가 입력**한다. AI는 빈 값일 때만 채운다 |
| R8 | 주간 목표는 **역산으로만** 생성된다. 사용자 직접 생성 UI를 만들지 않는다 |
| R9 | 모바일에는 드래그를 넣지 않는다 |
| R10 | 색 hex를 컴포넌트에 직접 쓰지 않는다. 토큰만 사용한다 |

---

## 3. 용어

**코드 식별자는 이 표를 벗어나지 않는다.** 새 이름이 필요하면 먼저 물어본다.

### 도메인

| 개념 | 코드 | UI 문구 |
|---|---|---|
| 월간 목표 | `MonthlyGoal` | 이번 달 목표 |
| 주간 목표 | `WeeklyGoal` | 이번 주 목표 |
| 할 일 | `Task` (`weeklyGoalId` 있음) | 할 일 |
| 약속 | `Task` (`weeklyGoalId` 없음) | 약속 |
| 카테고리 | `Category` | 분류 |
| 예상 시간 | `estimatedMin` | 예상 |
| 계획 블록 | `plannedBlock` | 계획 |
| 실행 블록 | `actualBlock` | 실제 |
| 예상 정확도 | `accuracyRatio` | 예상 정확도 |

### 상태

| 코드 | UI 문구 | 절대 쓰지 않을 말 |
|---|---|---|
| `todo` | 예정 | — |
| `done` | 완료 | — |
| `carried` | 다음으로 옮김 | 미완료, 실패, 놓침 |
| `dropped` | 이번엔 안 함 | 삭제, 포기, 버림 |

### 화면

| 코드 · route name | UI 문구 |
|---|---|
| `onboarding` | 목표 정하기 |
| `today` | 오늘 |
| `week` | 이번 주 |
| `reflect-day` | 오늘의 기록 |
| `reflect-week` | 주간 회고 |
| `mobile-run` | (모바일 실행, 화면 이름 없음) |

### 폐기어

`태그` `실천` `달성률` `독립 일정` `추정 시간` `우선순위 분석` — 코드·UI 어디에도 쓰지 않는다.

---

## 4. 도메인 모델

```ts
// entities/types.ts

export type CategoryColor =
  | 'blue' | 'mint' | 'amber' | 'purple' | 'green' | 'gray'

export interface Category {
  id: string
  name: string
  color: CategoryColor        // 6색 고정. 자유 색상 불가
}

export interface MonthlyGoal {
  id: string
  title: string
  month: string               // 'YYYY-MM'
  categoryId: string
  baselineHours: number       // 초기 추정. 생성 후 변경 금지
  status: 'active' | 'achieved' | 'dropped'
}

export interface WeeklyGoal {
  id: string
  title: string               // 산출물 형태. "~ 완료", "~ 작성"
  weekOf: string              // 해당 주 월요일 'YYYY-MM-DD'
  monthlyGoalId: string | null
  estimatedHours: number      // 이월 시 재추정된 값
  carryCount: number          // 연속 이월 횟수
  status: 'active' | 'achieved' | 'carried' | 'dropped'
}

export interface TimeBlock {
  start: string               // ISO 8601, 로컬 오프셋 포함
  end: string
}

export interface Task {
  id: string
  title: string
  weeklyGoalId: string | null // null = 약속
  categoryId: string | null   // weeklyGoalId 있으면 사용하지 않음
  estimatedMin: number        // 15의 배수
  plannedBlock: TimeBlock | null
  actualBlock: TimeBlock | null
  status: 'todo' | 'done' | 'carried' | 'dropped'
}
```

### 파생값 — 저장하지 않는다

```ts
resolveCategory(task)        // 목표 체인 → 없으면 task.categoryId
actualMin(task)              // actualBlock에서 계산
weeklyProgress(goal, tasks)  // 하위 할 일 actualMin 합 / estimatedHours
monthlyCurrentHours(goal)    // 완료 실적 + 남은 주간 재추정 합
accuracyRatio(tasks)         // Σ actualMin / Σ estimatedMin
```

`monthlyCurrentHours`와 `baselineHours`의 차이 = 범위가 늘어난 정도. 경고 배너의 근거값.

### 진도는 시간 기준

개수 기준으로 계산하지 않는다. 30분짜리와 5시간짜리를 같게 취급하면 안 된다.

---

## 5. 시간 규칙

버그가 가장 많이 나는 지점이다. 예외 없이 지킨다.

- 저장은 **ISO 8601 문자열**, 로컬 오프셋 포함
- 날짜 키는 `YYYY-MM-DD`, 월 키는 `YYYY-MM`
- **주의 시작은 월요일.** `weekOf`는 항상 그 주 월요일
- 모든 시간 입력·표시는 **15분 단위로 스냅**
- 시간 계산 유틸은 `shared/lib/time.ts` 한 곳에만 둔다. 컴포넌트에서 직접 날짜 연산 금지
- "현재 시각"은 전역 훅 하나(`useNow`)로 받는다. 컴포넌트마다 `new Date()` 호출 금지
- 하루 경계는 자정이 아니라 **사용자 기상 기준이 아니다** — 단순 자정으로 처리한다 (복잡도 대비 이득 없음)

---

## 6. 폴더 구조

```
src/
  pages/                # 라우팅 대상. 조립만, 로직 금지
    OnboardingPage.vue
    TodayPage.vue
    WeekPage.vue
    ReflectDayPage.vue
    ReflectWeekPage.vue
    MobileRunPage.vue
  layouts/
    MainLayout.vue       # 웹 3분할 레이아웃
    MobileLayout.vue     # 모바일 실행 전용
  features/
    goal/                # 월간·주간 목표
    task/                # 할 일·약속·입력 파서
    schedule/            # 캘린더·블록 배치·드래그
    reflect/             # 기록·회고·재추정
    ai/                  # 프롬프트·스키마·폴백
    각 feature/
      components/        # 이 feature 전용 .vue
      stores/             # Pinia 스토어
      lib/                # 순수 함수
  entities/              # 타입, 도메인 규칙 (resolveCategory 등)
  shared/
    ui/                  # 디자인 시스템 컴포넌트 (BaseButton, BaseCard, ProgressBar 등)
    lib/                 # time.ts 등 유틸
    styles/
      tokens.css          # CSS 커스텀 프로퍼티 (프레임워크 무관)
      quasar.variables.scss   # Quasar 자체 변수 — 최소한만 건드림
  router/
    index.ts
```

**Quasar 사용 범위 — 명확히 나눈다**

| 용도 | 사용 |
|---|---|
| 레이아웃 골격 (QLayout, QPage, QDrawer, grid) | Quasar 사용 |
| 폼 검증, 다이얼로그, 알림(QNotify) | Quasar 사용 |
| Button, Card, ProgressBar, 캘린더 블록 | **직접 만든 컴포넌트** (`shared/ui/`) |
| 캘린더 타임라인 전체 | **직접 구현** (QCalendar 사용 안 함) — 목업의 절대좌표 방식을 그대로 이식 |

Quasar 기본 컴포넌트를 프레젠테이션 용도로 쓸 경우 반드시 `ripple="false"`, `flat` prop을 명시한다. Material elevation 클래스(`shadow-*`)는 사용하지 않는다.

**경계 규칙 — 이것만은 반드시**

- `features/*`는 서로 직접 import 하지 않는다
- 공유가 필요하면 `entities` 또는 `shared`로 내린다
- `pages/`와 `layouts/`은 조립만 한다. 로직은 `features/`에
- Quasar 컴포넌트는 레이아웃·폼에만. 시각적 정체성이 드러나는 컴포넌트는 `shared/ui/`에 직접 만든다

이 프로젝트는 goal · task · schedule · reflect가 서로를 참조하고 싶어지는 구조다. 규칙이 없으면 곧 순환 참조가 생긴다.

---

## 7. 디자인 토큰

`shared/styles/tokens.css`에만 정의한다. 컴포넌트에서 hex 직접 사용 금지.
CSS 커스텀 프로퍼티이므로 프레임워크와 무관하게 그대로 쓴다. Quasar SCSS 변수(`quasar.variables.scss`)는 `$primary` 등 Quasar 내부 컴포넌트가 참조하는 값만 최소한으로 맞추고, 실제 색 판단의 단일 출처는 `tokens.css`로 둔다.

**Quasar 기본값 무력화 — 전역으로 한 번만 처리**

```js
// quasar.config.js 또는 boot 파일
framework: {
  config: {
    ripple: false      // 전역 리플 이펙트 끄기
  }
}
```

- Material elevation(`shadow-1` ~ `shadow-24`) 클래스를 사용하지 않는다
- `QBtn`, `QCard`를 프레젠테이션 용도로 쓰지 않는다. `shared/ui/BaseButton.vue`, `BaseCard.vue`를 직접 만든다

```css
:root{
  --surface-page:   #F7F8FA;
  --surface-card:   #FFFFFF;
  --surface-sunken: #F2F4F6;
  --border:         #E5E8EB;

  --text-primary:   #191F28;
  --text-secondary: #6B7684;
  --text-muted:     #8B95A1;

  --rose-50:  #FFF0F4;
  --rose-500: #FF4E7E;
  --rose-600: #F5326A;
  --rose-700: #C81E52;

  --cat-blue:   #3182F6;  --cat-blue-tint:   #DEEBFE;  --cat-blue-deep:   #1B5FBF;
  --cat-mint:   #00BFA5;  --cat-mint-tint:   #D6F5F1;  --cat-mint-deep:   #00806E;
  --cat-amber:  #FFA218;  --cat-amber-tint:  #FFEFD6;  --cat-amber-deep:  #96590A;
  --cat-purple: #7C5CFF;  --cat-purple-tint: #E7E1FF;  --cat-purple-deep: #4A32C0;
  --cat-green:  #4ECB71;  --cat-green-tint:  #DFF6E4;  --cat-green-deep:  #22803D;
  --cat-gray:   #8B95A1;  --cat-gray-tint:   #EDEFF2;  --cat-gray-deep:   #4E5968;

  --elev-hover: 0 1px 3px rgba(0,0,0,.06);
  --elev-drag:  0 8px 20px rgba(0,0,0,.12);

  --radius-card:  16px;
  --radius-ctrl:  8px;
  --radius-block: 6px;
}
```

### 색 사용 규칙

**로즈 허용 위치** — 현재 시각 바 + 플라밍고 / 주 CTA(화면당 1개) / 선택·포커스 / 로고
**로즈 금지** — 카드 배경, 헤더, 내비게이션, 일반 아이콘, 링크, 카테고리

**카테고리 6색에 로즈 계열을 넣지 않는다.** 분류인지 선택 상태인지 구분이 안 된다.

### 카드·블록 스타일

- **한쪽 면에만 보더를 주지 않는다.** 전면에 두르거나 없앤다
- 캘린더 블록: `--cat-*-tint` 배경 + `--cat-*-deep` 텍스트, 보더 없음
- 약속 블록: `--surface-sunken` 배경 + `--text-secondary` 텍스트
- 리스트 항목: 흰 카드 + 7px 도트. 틴트 배경 쓰지 않는다 (알록달록해진다)
- 대기 상태 그림자는 **없음**. 배경 대비로 분리한다

### 밀도 두 스케일

| | 패널·카드 | 캘린더 그리드 |
|---|---|---|
| padding | 20~24px | 6~8px |
| gap | 16px | 2px |
| radius | 16px | 6px |
| 최소 높이 | — | 22px (15분) |

### 다크 모드

**`/reflect/week`에만 적용한다.** 나머지 화면은 라이트 고정. 캘린더는 조밀해서 어두우면 가독성이 떨어진다.

---

## 8. 문구 규칙

- **해요체로 통일.** 예외 없음
- 능동형 우선 ("됐어요" → "했어요")
- 긍정형 우선 ("없어요" → "~하면 할 수 있어요")
- 과도한 경어 배제 ("~시겠어요?" → "~할까요?")
- 다이얼로그 왼쪽 버튼은 **"닫기"**. "취소"는 쓰지 않는다
- 명사+명사 조합 지양

| 상황 | 쓸 말 |
|---|---|
| 이월 | 다음으로 옮겼어요 |
| 제외 | 이번엔 안 하기로 했어요 |
| 목표 없음 | 목표를 정하면 일정을 짜드릴게요 |
| 공백 복귀 | 지난 5일 기록이 비어 있어요. 이번 주 목표만 다시 잡을까요? |
| 초과 경고 | 남은 2주에 14시간이 필요해요. 범위를 줄일까요? |

**실패 언어를 쓰지 않는다.** 이월은 조정이지 실패가 아니다. 빨강·경고색도 쓰지 않는다.
예외: `carryCount >= 3`일 때만 별도 노출하되, 비난이 아니라 선택지로 — "3주째 밀리고 있어요. 쪼갤까요, 목표에서 뺄까요?"

---

## 9. 입력 파서

`features/task/lib/parse.ts`

```
헬스장 운동 45m #운동
```

**토큰의 생김새로 판정한다. 순서 자유.**

| 패턴 | 결과 |
|---|---|
| `\d+m` / `\d+분` | `estimatedMin` (15의 배수로 반올림) |
| `#이름` | `weeklyGoalId` (이번 주 목표 중 자동완성) |
| 나머지 | `title` |

- `#` 없으면 `weeklyGoalId: null` → 약속
- 부분 입력 허용. 시간이 없어도 나머지는 파싱된다
- **번호 참조 구현 금지** (`/1` 같은 형태). 목표 정렬이 바뀌면 조용히 어긋난다
- 토큰 종류를 3개보다 늘리지 않는다

입력창 아래 **파싱 미리보기 칩**을 실시간으로 렌더한다. 도움말 페이지로 문법을 가르치지 않는다.

---

## 10. AI 연동

`features/ai/` — 함수당 파일 하나. 프롬프트는 코드와 분리.

| 함수 | 입력 | 폴백 |
|---|---|---|
| `decomposeMonthlyGoal` | 목표 + 마감 + 카테고리 | 4주 균등 분배 |
| `suggestDayLayout` | 인박스 + 약속 + 주간 잔여 + **실측 평균** | 마감일 순 배치 |
| `weeklyReflect` | 실측 + 예상 정확도 | 미달성 항목 그대로 이월 |

**규약**

- 출력은 zod 스키마로 검증한다. 실패 시 폴백으로 떨어뜨린다
- 실패해도 앱은 정상 동작해야 한다. 제안 카드가 안 뜰 뿐이다
- 로딩·실패 상태를 반드시 UI로 처리한다. 무한 스피너 금지
- `decomposeMonthlyGoal`은 **주간 목표까지만** 만든다. 할 일은 만들지 않는다
- 주간 목표 제목은 **산출물 형태**로 강제한다. "열심히 하기" 같은 판정 불가 문장 거절
- `suggestDayLayout`은 약속을 먼저 고정하고 그 틈에만 배치한다
- 4시간 초과 단일 블록은 쪼개도록 제안한다

---

## 11. 생성 시점 (Just-in-time)

| 시점 | 생성 | 생성하지 않음 |
|---|---|---|
| 월간 목표 등록 | 주간 목표 4개 | 할 일 |
| 그 주 월요일 | 이번 주 할 일 후보 | 다음 주 이후 |
| 매일 아침 | 오늘 시간블록 | 내일 이후 |

미리 만들면 죽은 데이터와 삭제 노동만 남는다.

---

## 12. 진입 라우팅

`features/*/lib/resolveEntry.ts` — 위에서부터 먼저 일치하는 하나만. `router/index.ts`의 전역 `beforeEach` 가드에서 호출한다.

| 순위 | 조건 | 도착 (route name) |
|---|---|---|
| 1 | 월간 목표 없음 | `onboarding` |
| 2 | 새 주 + 지난주 회고 미완 | `reflect-week` |
| 3 | 마지막 활동 3일 이상 전 | 복귀 리셋 |
| 4 | 오늘 마감 안 함 + 18시 이후 | `reflect-day` |
| 5 | 오늘 계획 없음 + 18시 이전 | `today` (계획 모드) |
| 6 | 그 외 | `today` |

**강제 이동이 아니다.** 상단에 항상 `today`로 빠져나갈 경로를 둔다.

복귀 리셋에서는 **누적 미완료를 보여주지 않는다.** 조용히 아카이브한다.

---

## 13. 하지 말 것

- 좌측 보더만 있는 카드
- 뉴모피즘, 그라데이션, 장식용 그림자
- 대기 상태에 그림자 부여 (드래그 표현이 불가능해진다)
- 완료율을 대표 지표로 노출 (계획을 적게 세우도록 학습시킨다)
- 일간 회고에 AI 호출 (하루치로는 할 말이 없다)
- 모바일에 캘린더 전체·목표 편집·회고 넣기
- 입력 문법에 토큰 추가
- 사용자가 카테고리 색을 자유 지정
- 월간 회고, 달성률 대시보드, 태그 역추적 (범위 밖)
- 화면 하나에 그래픽 2개 이상

---

## 14. 작업 순서

각 단계는 이전 단계 없이 검증할 수 없다. 순서를 바꾸지 않는다.

1. **토큰 + 기본 컴포넌트** — `tokens.css`, Button, Card, Stepper, ProgressBar
2. **타입 + 파생 함수** — `entities/`, 순수 함수 단위 테스트
3. **시드 스크립트** — 3주치 히스토리 생성. 이게 없으면 5·6번을 눈으로 확인할 수 없다
4. **입력 파서 + 미리보기**
5. **오늘 뷰** — 계획·실제 병기, 현재 시각 바, 드래그
6. **주간 회고** — 실측 → 재추정 → 다음 주 제안
7. **온보딩 + 역산**
8. **모바일 실행 뷰**
9. **오늘의 기록**
10. **진입 라우팅 연결**

### 시드 데이터 규격

- 3주치 완료된 주 + 진행 중인 이번 주
- `accuracyRatio`가 주차별로 1.8 → 1.6 → 1.4로 개선되는 추세
- `carryCount = 2`인 주간 목표 1개 (3주째 경고 직전 상태)
- 월간 목표 진도가 계획보다 뒤처진 상태 (경고 배너 재현용)
- 약속이 하루 2~3개 섞여 있을 것 (가용 시간 계산 확인용)

---

## 15. 완료 기준

기능을 끝냈다고 말하기 전에 확인한다.

- [ ] 색 hex를 직접 쓴 곳이 없다
- [ ] 한쪽 면에만 보더를 준 곳이 없다
- [ ] 문구가 전부 해요체다
- [ ] 실패 언어("실패", "미완료", "삭제")가 없다
- [ ] `features/*` 간 직접 import가 없다
- [ ] 날짜 연산이 `shared/lib/time.ts` 밖에 없다
- [ ] AI 호출에 로딩·실패 UI가 있다
- [ ] 시드 데이터로 해당 화면이 재현된다
- [ ] 키보드 포커스가 보인다

---

## 16. 기술 스택

- **Vue 3** (Composition API, `<script setup>`) · **Quasar** · TypeScript
- 라우팅: **Vue Router** — route name 기준으로 참조한다 (12·3절 표 참고). 경로 문자열을 하드코딩하지 않는다
- 상태: **Pinia**. 서버 상태(API 응답 캐시)와 클라이언트 상태(폼 입력, UI 토글)를 같은 스토어에 섞지 않는다 — feature마다 필요시 두 스토어로 분리
- 검증: zod (AI 응답 파싱), Quasar 내장 rules (폼 입력)
- 폰트: Pretendard
- 스타일: CSS 커스텀 프로퍼티(`tokens.css`)가 단일 출처. Quasar SCSS 변수는 보조

**Quasar 사용 범위는 6절 표를 따른다.** 레이아웃·폼·다이얼로그는 Quasar, 시각적 정체성이 드러나는 컴포넌트는 직접 제작.

**드래그 인터랙션**: 별도 드래그 라이브러리를 추가하기 전에 포인터 이벤트(`pointerdown`/`pointermove`/`pointerup`) 또는 `@vueuse/core`의 `useDraggable`로 되는지 먼저 확인한다. 캘린더 블록 드래그는 5절의 시간 스냅 규칙을 반드시 통과해야 한다.

**새 의존성을 추가하기 전에 먼저 물어본다.** 기존 스택으로 되는지 확인한다.

---

## 17. 작업 환경

1. **모든 작업은 새 브랜치를 만들고 시작한다.** base는 `frontend` 브랜치, 이름은 `type/설명` 컨벤션(`chore/`, `feat/`, `fix/`, `docs/` 등). `frontend`/`master`/`backend`에서 직접 파일을 수정하지 않는다 — `.claude/settings.json`의 PreToolUse 훅이 이 세 브랜치에서의 편집을 막는다.
2. **커밋 전에 무엇을·왜 커밋하는지 먼저 알리고, 승인받은 뒤에만 커밋한다.** 자동·침묵 커밋 금지.
3. **push와 PR(`gh pr create`) 여부는 매번 먼저 물어본다.** 변경 파일 목록과 PR 제목·설명을 먼저 공유하고 승인 후에만 진행한다.
4. 작업 마무리 시 변경 파일 목록을 요약해서 보고한다.
