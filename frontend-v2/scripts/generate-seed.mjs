// 시드 스크립트 — CLAUDE.md 14절 "시드 데이터 규격" + docs/mockups/01-today.html,
// 04-mobile-run.html의 "오늘"(2026-07-29 수) 시나리오를 그대로 반영해 시드를 생성한다.
// 실행: node scripts/generate-seed.mjs  →  docs/seed-data.json 갱신
//
// 규격 체크리스트:
//   - "오늘" = 2026-07-29(수), 목업 6개 태스크 제목·시간 그대로
//   - 3주치 완료된 주(accuracyRatio 1.8 → 1.6 → 1.4) + 진행 중인 이번 주
//   - carryCount = 2인 주간 목표 1개 = "실험 데이터 분석 마무리" (3주째 경고 직전)
//   - achieved 주간 목표 1개 = "선행연구 정리 완료"
//   - 월간 목표 baseline(40h) 초과 — 목업 사이드바 45%와는 별개 스냅샷으로 유지
//   - 약속이 하루 2~3개, 4주(28일) 전체에 분산

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
// 날짜 계산은 CLAUDE.md 5절대로 shared/lib/time.ts 한 곳만 쓴다 — 스크립트도 예외 없음.
// (이 임포트 없이 스크립트가 직접 toISOString()으로 계산하다가 로컬 자정이
// UTC 기준 하루 밀리는 타임존 버그가 실제로 났었다.)
import { addDays, startOfWeek } from '../src/shared/lib/time.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = resolve(__dirname, '../docs/seed-data.json')

const TODAY = '2026-07-29' // 목업 기준 "오늘" (수요일)
const TZ = '+09:00'

function iso(dateStr, hh, mm = 0) {
  const h = String(hh).padStart(2, '0')
  const m = String(mm).padStart(2, '0')
  return `${dateStr}T${h}:${m}:00${TZ}`
}
/** 분(minute) 오프셋 → HH:MM 기준 TimeBlock */
function block(dateStr, startMin, durationMin) {
  const sh = Math.floor(startMin / 60)
  const sm = startMin % 60
  const eh = Math.floor((startMin + durationMin) / 60)
  const em = (startMin + durationMin) % 60
  return { start: iso(dateStr, sh, sm), end: iso(dateStr, eh, em) }
}
const isPastDay = (dateStr) => dateStr < TODAY

const CURRENT_MONDAY = startOfWeek(TODAY) // 2026-07-27

const categories = [
  { id: 'cat-research', name: '연구', color: 'blue' },
  { id: 'cat-fitness', name: '운동', color: 'mint' },
  { id: 'cat-etc', name: '기타', color: 'gray' },
]

const monthlyGoalThesis = {
  id: 'mg-thesis',
  title: '논문 초고 완성',
  month: '2026-07',
  categoryId: 'cat-research',
  baselineHours: 40, // 잠금값 — 아래 실제 합계(48h)가 이보다 커야 "범위 초과" 경고가 재현된다.
  // 목업 사이드바의 "18h/40h(45%)"는 같은 순간을 가리키는 숫자가 아니라 별개 스냅샷 — 억지로 맞추지 않는다.
  status: 'active',
}
const monthlyGoalFitness = {
  id: 'mg-fitness',
  title: '운동 습관 만들기',
  month: '2026-07',
  categoryId: 'cat-fitness',
  baselineHours: 20,
  status: 'active',
}

// --- 3주치 완료(achieved) 주간 목표: accuracyRatio 1.8 → 1.6 → 1.4로 개선 ---
const achievedPlans = [
  {
    id: 'wg-achieved-1',
    title: '선행연구 정리 완료', // 목업 사이드바 "선행연구 정리" 6/6h(완료)와 매칭
    weekOf: addDays(CURRENT_MONDAY, -21),
    estimatedHours: 6,
    accuracyRatio: 1.8,
    taskEstMin: [120, 80], // 합 200min → actual 200*1.8=360min=6h(estimatedHours와 일치)
  },
  {
    id: 'wg-achieved-2',
    title: '선행 자료 스크리닝',
    weekOf: addDays(CURRENT_MONDAY, -14),
    estimatedHours: 8,
    accuracyRatio: 1.6,
    taskEstMin: [180, 150, 150], // 합 480min=8h
  },
  {
    id: 'wg-achieved-3',
    title: '실험 설계 확정',
    weekOf: addDays(CURRENT_MONDAY, -7),
    estimatedHours: 8,
    accuracyRatio: 1.4,
    taskEstMin: [180, 150, 150],
  },
]

// --- 진행 중인 이번 주: 두 개의 active 주간 목표가 동시에 존재 ---
// (1) carryCount=2로 3주째 이월 중 — 오늘 일정에 연결된 할 일은 없음(밀린 배경 목표)
const weeklyGoalCarrying = {
  id: 'wg-carrying',
  title: '실험 데이터 분석 마무리',
  weekOf: CURRENT_MONDAY,
  monthlyGoalId: monthlyGoalThesis.id,
  estimatedHours: 8,
  carryCount: 2, // 다음에도 못 끝내면 3(경고 기준)이 된다
  status: 'active',
}
// (2) 이번 주 신규 목표 — 오늘의 논문 관련 할 일이 여기 연결된다 (사이드바 "결과 파트 작성" 3/10h)
const weeklyGoalCurrent = {
  id: 'wg-current',
  title: '결과 파트 작성',
  weekOf: CURRENT_MONDAY,
  monthlyGoalId: monthlyGoalThesis.id,
  estimatedHours: 10,
  carryCount: 0,
  status: 'active',
}
// (3) 운동 습관 (다른 월간 목표 소속) — 사이드바 "운동 습관 잡기" 90/180분
const weeklyGoalFitness = {
  id: 'wg-fitness',
  title: '운동 습관 잡기',
  weekOf: CURRENT_MONDAY,
  monthlyGoalId: monthlyGoalFitness.id,
  estimatedHours: 3, // 180분
  carryCount: 0,
  status: 'active',
}

const weeklyGoals = [
  ...achievedPlans.map((w) => ({
    id: w.id,
    title: w.title,
    weekOf: w.weekOf,
    monthlyGoalId: monthlyGoalThesis.id,
    estimatedHours: w.estimatedHours,
    carryCount: 0,
    status: 'achieved',
  })),
  weeklyGoalCarrying,
  weeklyGoalCurrent,
  weeklyGoalFitness,
]

const tasks = []
let seq = 0
const nextId = (prefix) => `${prefix}-${(seq += 1)}`

// --- achieved 3주: 목표 연결 할 일 (화/목처럼 주 초반에 분산 배치) ---
for (const w of achievedPlans) {
  w.taskEstMin.forEach((est, i) => {
    const date = addDays(w.weekOf, i * 2) // 월,수,금 순
    const actualMinutes = Math.round(est * w.accuracyRatio)
    tasks.push({
      id: nextId(w.id),
      title: `${w.title} 관련 작업 ${i + 1}`,
      weeklyGoalId: w.id,
      categoryId: null,
      estimatedMin: est,
      plannedBlock: block(date, 9 * 60, est),
      actualBlock: block(date, 9 * 60, actualMinutes),
      status: 'done',
    })
  })
}

// --- 이번 주 월요일(과거) 필러: "3/10h", "90/180분" 사이드바 수치를 만들기 위한 선행 실적 ---
tasks.push({
  id: nextId('wg-current'),
  title: '결과 파트 자료 정리',
  weeklyGoalId: weeklyGoalCurrent.id,
  categoryId: null,
  estimatedMin: 60,
  plannedBlock: block(CURRENT_MONDAY, 9 * 60, 60),
  actualBlock: block(CURRENT_MONDAY, 9 * 60, 75), // 75분 실측
  status: 'done',
})
tasks.push({
  id: nextId('wg-fitness'),
  title: '헬스장 운동',
  weeklyGoalId: weeklyGoalFitness.id,
  categoryId: null,
  estimatedMin: 60,
  plannedBlock: block(CURRENT_MONDAY, 18 * 60, 60),
  actualBlock: block(CURRENT_MONDAY, 18 * 60, 90), // 90분 실측
  status: 'done',
})

// --- "오늘"(2026-07-29) 목업 그대로: 6개 태스크 ---
// 1) 논문 결과표 초안 — 계획 9:00~10:00 / 실제 9:00~10:45 (완료)
tasks.push({
  id: nextId('today'),
  title: '논문 결과표 초안',
  weeklyGoalId: weeklyGoalCurrent.id,
  categoryId: null,
  estimatedMin: 60,
  plannedBlock: block(TODAY, 9 * 60, 60),
  actualBlock: block(TODAY, 9 * 60, 105), // 10:45 (1시간 45분)
  status: 'done',
})
// 2) 팀 회의(약속) — 11:00~12:00, 실제 11:00~11:51 (완료, 15분 미만 차이)
tasks.push({
  id: nextId('today'),
  title: '팀 회의',
  weeklyGoalId: null,
  categoryId: 'cat-etc',
  estimatedMin: 60,
  plannedBlock: block(TODAY, 11 * 60, 60),
  actualBlock: block(TODAY, 11 * 60, 51),
  status: 'done',
})
// 3) 그래프 3개 다듬기 — 계획 13:00~14:00 / 13:09부터 진행 중, 아직 미완료(actualBlock 없음)
tasks.push({
  id: nextId('today'),
  title: '그래프 3개 다듬기',
  weeklyGoalId: weeklyGoalCurrent.id,
  categoryId: null,
  estimatedMin: 60,
  plannedBlock: block(TODAY, 13 * 60, 60),
  actualBlock: null,
  status: 'todo',
})
// 4) 논문 서론 초안 — 15:00~16:30, 아직 실행 전
tasks.push({
  id: nextId('today'),
  title: '논문 서론 초안',
  weeklyGoalId: weeklyGoalCurrent.id,
  categoryId: null,
  estimatedMin: 90,
  plannedBlock: block(TODAY, 15 * 60, 90),
  actualBlock: null,
  status: 'todo',
})
// 5) 헬스장 운동 — 17:00~18:00
tasks.push({
  id: nextId('today'),
  title: '헬스장 운동',
  weeklyGoalId: weeklyGoalFitness.id,
  categoryId: null,
  estimatedMin: 60,
  plannedBlock: block(TODAY, 17 * 60, 60),
  actualBlock: null,
  status: 'todo',
})
// 6) 저녁 약속 — 19:00~20:30
tasks.push({
  id: nextId('today'),
  title: '저녁 약속',
  weeklyGoalId: null,
  categoryId: 'cat-etc',
  estimatedMin: 90,
  plannedBlock: block(TODAY, 19 * 60, 90),
  actualBlock: null,
  status: 'todo',
})

// --- 나머지 27일: 하루 2~3개 약속(오늘·이번 주 월요일 제외 — 이미 위에서 채움) ---
const APPT_TITLES = ['점심 약속', '병원 예약', '스터디 모임', '가족 통화', '동아리 모임']
let apptSeq = 0
const allWeekMondays = [...achievedPlans.map((w) => w.weekOf), CURRENT_MONDAY]
for (const monday of allWeekMondays) {
  for (let day = 0; day < 7; day++) {
    const date = addDays(monday, day)
    if (date === TODAY) continue // 오늘은 팀 회의·저녁 약속으로 이미 2개 채움
    const count = day % 2 === 0 ? 2 : 3
    for (let n = 0; n < count; n++) {
      const title = APPT_TITLES[apptSeq % APPT_TITLES.length]
      apptSeq += 1
      const startMin = 12 * 60 + n * 180
      const est = 30
      const done = isPastDay(date)
      tasks.push({
        id: nextId('appt'),
        title,
        weeklyGoalId: null,
        categoryId: 'cat-etc',
        estimatedMin: est,
        plannedBlock: block(date, startMin, est),
        actualBlock: done ? block(date, startMin, est) : null,
        status: done ? 'done' : 'todo',
      })
    }
  }
}

const seedData = {
  categories,
  monthlyGoals: [monthlyGoalThesis, monthlyGoalFitness],
  weeklyGoals,
  tasks,
}

writeFileSync(OUT_PATH, JSON.stringify(seedData, null, 2) + '\n', 'utf-8')
console.log(`시드 데이터 생성 완료: ${OUT_PATH}`)
console.log(`  오늘 = ${TODAY}, 이번 주 월요일 = ${CURRENT_MONDAY}`)
console.log(`  categories: ${categories.length}, monthlyGoals: 2, weeklyGoals: ${weeklyGoals.length}`)
console.log(`  tasks: ${tasks.length} (오늘 6개 + 월요일 필러 2개 + 목표연결 8개 + 약속 ${apptSeq}개)`)
