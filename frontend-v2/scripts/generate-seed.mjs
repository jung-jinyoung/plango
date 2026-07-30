// 시드 스크립트 — CLAUDE.md 14절 "시드 데이터 규격"을 만족하는 3주치 히스토리 + 진행 중인 이번 주를 생성한다.
// 실행: node scripts/generate-seed.mjs  →  docs/seed-data.json 갱신
//
// 규격 체크리스트 (CLAUDE.md 14절):
//   - 3주치 완료된 주 + 진행 중인 이번 주
//   - accuracyRatio가 주차별로 1.8 → 1.6 → 1.4로 개선되는 추세
//   - carryCount = 2인 주간 목표 1개 (3주째 경고 직전 상태)
//   - 월간 목표 진도가 계획보다 뒤처진 상태 (경고 배너 재현용)
//   - 약속이 하루 2~3개 섞여 있을 것 (가용 시간 계산 확인용)

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = resolve(__dirname, '../docs/seed-data.json')

const TZ = '+09:00'
/** 'YYYY-MM-DD' + 시:분 → ISO 8601(로컬 오프셋 포함) */
function iso(dateStr, hh, mm = 0) {
  const h = String(hh).padStart(2, '0')
  const m = String(mm).padStart(2, '0')
  return `${dateStr}T${h}:${m}:00${TZ}`
}
/** 'YYYY-MM-DD' 문자열에 일수를 더한다 */
function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00${TZ}`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
/** 분(minute) → HH:MM (09:00 시작 기준 오프셋) */
function block(dateStr, startMin, durationMin) {
  const sh = Math.floor(startMin / 60)
  const sm = startMin % 60
  const start = iso(dateStr, sh, sm)
  const endTotal = startMin + durationMin
  const eh = Math.floor(endTotal / 60)
  const em = endTotal % 60
  const end = iso(dateStr, eh, em)
  return { start, end }
}

const categories = [
  { id: 'cat-research', name: '연구', color: 'blue' },
  { id: 'cat-etc', name: '기타', color: 'gray' },
]

const monthlyGoal = {
  id: 'mg-thesis',
  title: '논문 초고 완성',
  month: '2026-08',
  categoryId: 'cat-research',
  baselineHours: 40, // 잠금값 — 아래 실제 합계(48.4h)가 이보다 커야 "범위 초과" 경고가 재현된다
  status: 'active',
}

// 4주: 3주 완료(achieved) + 1주 진행 중(active). 각 주 estimatedHours=8~10h(15분 단위 합).
const weekPlans = [
  {
    id: 'wg-w1',
    title: '선행연구 정리 완료',
    weekOf: '2026-08-03',
    estimatedHours: 8,
    carryCount: 0,
    status: 'achieved',
    accuracyRatio: 1.8, // 예상보다 80% 더 걸림
  },
  {
    id: 'wg-w2',
    title: '실험 데이터 분석 마무리',
    weekOf: '2026-08-10',
    estimatedHours: 8,
    carryCount: 0,
    status: 'achieved',
    accuracyRatio: 1.6,
  },
  {
    id: 'wg-w3',
    title: '결과 파트 초고 작성',
    weekOf: '2026-08-17',
    estimatedHours: 8,
    carryCount: 0,
    status: 'achieved',
    accuracyRatio: 1.4,
  },
  {
    id: 'wg-w4',
    title: '서론·결론 쓰고 전체 교정',
    weekOf: '2026-08-24',
    estimatedHours: 10,
    carryCount: 2, // 3주째 경고(carryCount >= 3) 직전 — 이번에도 못 끝내면 다음 인스턴스가 경고 대상
    status: 'active',
    accuracyRatio: null, // 진행 중이라 아직 확정값 없음
  },
]

const weeklyGoals = weekPlans.map((w) => ({
  id: w.id,
  title: w.title,
  weekOf: w.weekOf,
  monthlyGoalId: monthlyGoal.id,
  estimatedHours: w.estimatedHours,
  carryCount: w.carryCount,
  status: w.status,
}))

const tasks = []
let taskSeq = 0
function nextTaskId(prefix) {
  taskSeq += 1
  return `${prefix}-${taskSeq}`
}

// --- 목표에 연결된 "할 일" (achieved 3주: 각각 estimatedMin 180/150/150 합 480 = 8h) ---
const GOAL_TASK_TITLES = ['자료 조사', '초안 작성', '피드백 반영']
const GOAL_TASK_EST = [180, 150, 150] // 15분 배수
const GOAL_TASK_DAY_OFFSET = [0, 2, 4] // 그 주 월요일 기준 화/목/토처럼 분산

for (const w of weekPlans.slice(0, 3)) {
  GOAL_TASK_EST.forEach((est, i) => {
    const date = addDays(w.weekOf, GOAL_TASK_DAY_OFFSET[i])
    const actualMin = Math.round(est * w.accuracyRatio)
    const planned = block(date, 9 * 60, est) // 09:00부터 예상 길이
    const actual = block(date, 9 * 60, actualMin) // 09:00부터 실제 길이 (같은 슬롯, 초과분만 다름)
    tasks.push({
      id: nextTaskId(w.id),
      title: `${GOAL_TASK_TITLES[i]} — ${w.title}`,
      weeklyGoalId: w.id,
      categoryId: null,
      estimatedMin: est,
      plannedBlock: planned,
      actualBlock: actual,
      status: 'done',
    })
  })
}

// --- 진행 중인 이번 주(wg-w4): 완료 2개 + 미완료 2개, estimatedMin 합 = 600(10h) ---
const w4 = weekPlans[3]
const w4Done = [
  { title: '서론 개요 작성', est: 180, actualMin: 210, dayOffset: 0 },
  { title: '결론 초안', est: 120, actualMin: 150, dayOffset: 2 },
]
const w4Todo = [
  { title: '전체 문장 교정', est: 180, dayOffset: 5 },
  { title: '참고문헌 정리', est: 120, dayOffset: 6 },
]
for (const t of w4Done) {
  const date = addDays(w4.weekOf, t.dayOffset)
  tasks.push({
    id: nextTaskId(w4.id),
    title: `${t.title} — ${w4.title}`,
    weeklyGoalId: w4.id,
    categoryId: null,
    estimatedMin: t.est,
    plannedBlock: block(date, 9 * 60, t.est),
    actualBlock: block(date, 9 * 60, t.actualMin),
    status: 'done',
  })
}
for (const t of w4Todo) {
  const date = addDays(w4.weekOf, t.dayOffset)
  tasks.push({
    id: nextTaskId(w4.id),
    title: `${t.title} — ${w4.title}`,
    weeklyGoalId: w4.id,
    categoryId: null,
    estimatedMin: t.est,
    plannedBlock: block(date, 9 * 60, t.est),
    actualBlock: null,
    status: 'todo',
  })
}

// --- 약속(appointment): weeklyGoalId 없음, categoryId 직접 사용. 하루 2~3개, 4주(28일) 전체 ---
const APPT_TITLES = ['점심 약속', '병원 예약', '스터디 모임', '가족 통화', '동아리 모임']
let apptSeq = 0
for (const w of weekPlans) {
  for (let day = 0; day < 7; day++) {
    const date = addDays(w.weekOf, day)
    const count = day % 2 === 0 ? 2 : 3 // 짝수 요일 오프셋 2개, 홀수 3개 → 하루 2~3개
    const isPastWeek = w.status === 'achieved'
    for (let n = 0; n < count; n++) {
      const title = APPT_TITLES[apptSeq % APPT_TITLES.length]
      apptSeq += 1
      const startMin = 12 * 60 + n * 180 // 12:00부터 3시간 간격 (점심/오후/저녁)
      const est = 30
      tasks.push({
        id: nextTaskId('appt'),
        title,
        weeklyGoalId: null,
        categoryId: 'cat-etc',
        estimatedMin: est,
        plannedBlock: block(date, startMin, est),
        actualBlock: isPastWeek ? block(date, startMin, est) : null,
        status: isPastWeek ? 'done' : 'todo',
      })
    }
  }
}

const seedData = {
  categories,
  monthlyGoals: [monthlyGoal],
  weeklyGoals,
  tasks,
}

writeFileSync(OUT_PATH, JSON.stringify(seedData, null, 2) + '\n', 'utf-8')
console.log(`시드 데이터 생성 완료: ${OUT_PATH}`)
console.log(`  categories: ${categories.length}`)
console.log(`  monthlyGoals: 1, weeklyGoals: ${weeklyGoals.length}`)
console.log(`  tasks: ${tasks.length} (목표 연결 ${3 * 3 + 4}개, 약속 ${apptSeq}개)`)
