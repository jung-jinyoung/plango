// 시드 스크립트 — 부 타겟 페르소나 김도윤(32세, 재택근무 직장인) 시나리오.
// product-spec.md 2절: "사이드 프로젝트가 있을 때 겹침. 실시간 조정 요구가
// 크고 모바일 중심이라 1순위로 삼지 않는다." 낮엔 회사 업무로 시간이
// 없다는 설정이라, 이서연(연구자)과 달리 할 일을 저녁·주말에 몰아 배치한다
// — 이게 "왜 부 타겟이고 왜 모바일 중심인지"를 데이터로 보여주는 지점.
// 실행: node scripts/generate-seed-doyoon.mjs  →  docs/seed-data.doyoon.json 갱신
//
// generate-seed.mjs(이서연)와 이 스크립트는 자매 스크립트다. 구조(카테고리 3개,
// 월간 목표 2개, achieved 4주 + carrying 1 + current 1 + 습관 지난주 achieved 1,
// "오늘" 6개, 인박스 2개, 이월 2개, 나머지 날 약속)는 같은 모양을 유지하되
// 내용만 김도윤의 삶에 맞춘다.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { addDays, startOfWeek } from '../src/shared/lib/time.ts'
import { block, createIdGenerator } from './lib/seedHelpers.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = resolve(__dirname, '../docs/seed-data.doyoon.json')

// generate-seed.mjs와 반드시 같은 값이어야 한다 — shared/lib/seedDateShift.ts의
// ANCHOR_TODAY가 두 페르소나에 동일한 offset을 적용하는 전제.
const TODAY = '2026-07-29'
const isPastDay = (dateStr) => dateStr < TODAY

const CURRENT_MONDAY = startOfWeek(TODAY) // 2026-07-27

const categories = [
  { id: 'cat-project', name: '사이드 프로젝트', color: 'purple' },
  { id: 'cat-study', name: '영어 공부', color: 'mint' },
  { id: 'cat-etc', name: '기타', color: 'gray' },
]

const monthlyGoalProject = {
  id: 'mg-project',
  title: '사이드 프로젝트 MVP 출시',
  month: '2026-07',
  categoryId: 'cat-project',
  // 이서연(연구자, 60h)보다 낮다 — 회사 업무가 있어 가용 시간 자체가 적다는 설정.
  // 아래 achieved+active 합(36.6h)이 이 안에 들어와서(baseline 미초과) 이서연
  // 페르소나(초과 경고)와 다른 상태를 보여준다 — 두 페르소나를 오가면 서로
  // 다른 배너 상태를 확인할 수 있다.
  baselineHours: 40,
  status: 'active',
}
const monthlyGoalStudy = {
  id: 'mg-study',
  title: '영어 공부 습관 만들기',
  month: '2026-07',
  categoryId: 'cat-study',
  baselineHours: 10,
  status: 'active',
}

// --- 4주치 완료(achieved) 주간 목표: MVP 마일스톤. accuracyRatio 1.8→1.6→1.4→1.2로 개선 ---
const achievedPlans = [
  {
    id: 'wg-achieved-0',
    title: '요구사항 정리',
    weekOf: addDays(CURRENT_MONDAY, -28),
    estimatedHours: 3,
    accuracyRatio: 1.8,
    taskEstMin: [90, 90], // 합 180min=3h
  },
  {
    id: 'wg-achieved-1',
    title: 'DB 스키마 설계',
    weekOf: addDays(CURRENT_MONDAY, -21),
    estimatedHours: 6,
    accuracyRatio: 1.6,
    taskEstMin: [180, 180], // 합 360min=6h
  },
  {
    id: 'wg-achieved-2',
    title: 'API 설계 문서 작성',
    weekOf: addDays(CURRENT_MONDAY, -14),
    estimatedHours: 4,
    accuracyRatio: 1.4,
    taskEstMin: [120, 120], // 합 240min=4h
  },
  {
    id: 'wg-achieved-3',
    title: '인증 플로우 구현',
    weekOf: addDays(CURRENT_MONDAY, -7),
    estimatedHours: 5,
    accuracyRatio: 1.2,
    taskEstMin: [150, 150], // 합 300min=5h
  },
]

// --- 진행 중인 이번 주: 두 개의 active 주간 목표가 동시에 존재 ---
const weeklyGoalCarrying = {
  id: 'wg-carrying',
  title: '관리자 대시보드 마무리',
  weekOf: CURRENT_MONDAY,
  monthlyGoalId: monthlyGoalProject.id,
  estimatedHours: 4,
  carryCount: 2, // 다음에도 못 끝내면 3(경고 기준)이 된다 — 이서연과 같은 "3주째" 신호
  status: 'active',
}
const weeklyGoalCurrent = {
  id: 'wg-current',
  title: '온보딩 플로우 화면 구현',
  weekOf: CURRENT_MONDAY,
  monthlyGoalId: monthlyGoalProject.id,
  estimatedHours: 6,
  carryCount: 0,
  status: 'active',
}
const weeklyGoalStudy = {
  id: 'wg-study',
  title: '영어 회화 습관 잡기',
  weekOf: CURRENT_MONDAY,
  monthlyGoalId: monthlyGoalStudy.id,
  estimatedHours: 2, // 120분
  carryCount: 0,
  status: 'active',
}

// --- 습관 목표(mg-study)의 지난주 achieved 레코드 ---
const weeklyGoalStudyLastWeek = {
  id: 'wg-study-last',
  title: '영어 회화 습관 잡기',
  weekOf: addDays(CURRENT_MONDAY, -7),
  monthlyGoalId: monthlyGoalStudy.id,
  estimatedHours: 2,
  carryCount: 0,
  status: 'achieved',
}

const weeklyGoals = [
  ...achievedPlans.map((w) => ({
    id: w.id,
    title: w.title,
    weekOf: w.weekOf,
    monthlyGoalId: monthlyGoalProject.id,
    estimatedHours: w.estimatedHours,
    carryCount: 0,
    status: 'achieved',
  })),
  weeklyGoalCarrying,
  weeklyGoalCurrent,
  weeklyGoalStudy,
  weeklyGoalStudyLastWeek,
]

const tasks = []
const nextId = createIdGenerator()

// --- achieved 4주: 목표 연결 할 일 — 회사 업무 이후 시간대(저녁)에 배치 ---
for (const w of achievedPlans) {
  w.taskEstMin.forEach((est, i) => {
    const date = addDays(w.weekOf, i * 2) // 월,수 순
    const actualMinutes = Math.round(est * w.accuracyRatio)
    // 20시(퇴근 후)부터 — 단, 실제가 길어 자정을 넘기면 그만큼 일찍 시작한다(15분 단위).
    // 하루 경계는 자정이고(CLAUDE.md 5절) block()은 날짜를 넘기지 않아 "24:48" 같은
    // 존재하지 않는 시각이 생겨 월간 합계가 NaN이 됐었다.
    const startMin = Math.min(20 * 60, Math.floor((24 * 60 - Math.max(est, actualMinutes)) / 15) * 15)
    tasks.push({
      id: nextId(w.id),
      title: `${w.title} 관련 작업 ${i + 1}`,
      weeklyGoalId: w.id,
      categoryId: null,
      estimatedMin: est,
      plannedBlock: block(date, startMin, est),
      actualBlock: block(date, startMin, actualMinutes),
      status: 'done',
    })
  })
}

// --- 이번 주 월요일(과거) 필러: 사이드바 진행률 수치를 만들기 위한 선행 실적 ---
tasks.push({
  id: nextId('wg-current'),
  title: '온보딩 플로우 화면 설계',
  weeklyGoalId: weeklyGoalCurrent.id,
  categoryId: null,
  estimatedMin: 60,
  plannedBlock: block(CURRENT_MONDAY, 20 * 60, 60),
  actualBlock: block(CURRENT_MONDAY, 20 * 60, 75), // 75분 실측
  status: 'done',
})
tasks.push({
  id: nextId('wg-study'),
  title: '영어 회화 연습',
  weeklyGoalId: weeklyGoalStudy.id,
  categoryId: null,
  estimatedMin: 30,
  plannedBlock: block(CURRENT_MONDAY, 22 * 60, 30),
  actualBlock: block(CURRENT_MONDAY, 22 * 60, 45), // 45분 실측
  status: 'done',
})

// --- wg-study-last(지난주 achieved 습관 목표)에 연결된 할 일 ---
// 60분 예상 / 65분 실측 → accuracyRatio ≈1.08(1.0대), "거의 예상대로 지켰어요" 근거.
tasks.push({
  id: nextId('wg-study-last'),
  title: '영어 회화 연습',
  weeklyGoalId: weeklyGoalStudyLastWeek.id,
  categoryId: null,
  estimatedMin: 60,
  plannedBlock: block(addDays(weeklyGoalStudyLastWeek.weekOf, 6), 22 * 60, 60),
  actualBlock: block(addDays(weeklyGoalStudyLastWeek.weekOf, 6), 22 * 60, 65),
  status: 'done',
})

// --- 이월 중(wg-carrying)인 목표에도 실제 연결된 할 일: 완료 1개 + 아직 안 한 1개 ---
tasks.push({
  id: nextId('wg-carrying'),
  title: '관리자 대시보드 필터 기능',
  weeklyGoalId: weeklyGoalCarrying.id,
  categoryId: null,
  estimatedMin: 45,
  plannedBlock: block(CURRENT_MONDAY, 21 * 60, 45),
  actualBlock: block(CURRENT_MONDAY, 21 * 60, 60), // 60분 실측
  status: 'done',
})
tasks.push({
  id: nextId('wg-carrying'),
  title: '관리자 대시보드 성능 개선',
  weeklyGoalId: weeklyGoalCarrying.id,
  categoryId: null,
  estimatedMin: 60,
  plannedBlock: block(CURRENT_MONDAY, 22 * 60, 60),
  actualBlock: null, // 아직 진행 전
  status: 'todo',
})

// --- "오늘"(2026-07-29): 낮엔 회사 미팅 2개, 저녁부터 사이드 프로젝트·공부 ---
// 1) 데일리 스탠드업(약속) — 9:00~9:15, 실제 9:00~9:12 (완료, 15분 미만 차이)
tasks.push({
  id: nextId('today'),
  title: '데일리 스탠드업',
  weeklyGoalId: null,
  categoryId: 'cat-etc',
  estimatedMin: 15,
  plannedBlock: block(TODAY, 9 * 60, 15),
  actualBlock: block(TODAY, 9 * 60, 12),
  status: 'done',
})
// 2) 1:1 미팅(약속) — 14:00~14:30, 실제 14:00~14:33 (완료, 15분 미만 차이)
tasks.push({
  id: nextId('today'),
  title: '1:1 미팅',
  weeklyGoalId: null,
  categoryId: 'cat-etc',
  estimatedMin: 30,
  plannedBlock: block(TODAY, 14 * 60, 30),
  actualBlock: block(TODAY, 14 * 60, 33),
  status: 'done',
})
// 3) 친구와 저녁 약속 — 19:00~20:00, 아직 실행 전
tasks.push({
  id: nextId('today'),
  title: '친구와 저녁 약속',
  weeklyGoalId: null,
  categoryId: 'cat-etc',
  estimatedMin: 60,
  plannedBlock: block(TODAY, 19 * 60, 60),
  actualBlock: null,
  status: 'todo',
})
// 4) 온보딩 플로우 화면 구현 — 계획 20:00~21:00 / 실제 20:00~21:20 (완료, 20분 차이 → ghost 재현)
tasks.push({
  id: nextId('today'),
  title: '온보딩 플로우 화면 구현',
  weeklyGoalId: weeklyGoalCurrent.id,
  categoryId: null,
  estimatedMin: 60,
  plannedBlock: block(TODAY, 20 * 60, 60),
  actualBlock: block(TODAY, 20 * 60, 80),
  status: 'done',
})
// 5) API 에러 핸들링 정리 — 21:20~22:00, 아직 실행 전
tasks.push({
  id: nextId('today'),
  title: 'API 에러 핸들링 정리',
  weeklyGoalId: weeklyGoalCurrent.id,
  categoryId: null,
  estimatedMin: 40,
  plannedBlock: block(TODAY, 21 * 60 + 20, 40),
  actualBlock: null,
  status: 'todo',
})
// 6) 영어 회화 연습 — 22:00~22:30, 아직 실행 전
tasks.push({
  id: nextId('today'),
  title: '영어 회화 연습',
  weeklyGoalId: weeklyGoalStudy.id,
  categoryId: null,
  estimatedMin: 30,
  plannedBlock: block(TODAY, 22 * 60, 30),
  actualBlock: null,
  status: 'todo',
})

// --- 인박스(아직 시간 미배정) ---
tasks.push({
  id: nextId('inbox'),
  title: '리드미 정리',
  weeklyGoalId: weeklyGoalCurrent.id,
  categoryId: null,
  estimatedMin: 20,
  plannedBlock: null,
  actualBlock: null,
  status: 'todo',
})
tasks.push({
  id: nextId('inbox'),
  title: '은행 업무 보기',
  weeklyGoalId: null,
  categoryId: 'cat-etc',
  estimatedMin: 20,
  plannedBlock: null,
  actualBlock: null,
  status: 'todo',
})

// --- 어제(이월 배너 재현용): 계획은 있었지만 실행 안 됨 → carried ---
const YESTERDAY = addDays(TODAY, -1)
tasks.push({
  id: nextId('carried'),
  title: '코드 리뷰 반영',
  weeklyGoalId: weeklyGoalCurrent.id,
  categoryId: null,
  estimatedMin: 30,
  plannedBlock: block(YESTERDAY, 21 * 60, 30),
  actualBlock: null,
  status: 'carried',
})
tasks.push({
  id: nextId('carried'),
  title: '테스트 코드 작성',
  weeklyGoalId: weeklyGoalCurrent.id,
  categoryId: null,
  estimatedMin: 30,
  plannedBlock: block(YESTERDAY, 22 * 60, 30),
  actualBlock: null,
  status: 'carried',
})

// --- 나머지 날: 저녁 시간대에 몰린 약속 2~3개(오늘 제외) — 회사 업무 시간대는 비운다 ---
const APPT_TITLES = ['팀 스탠드업', '1:1 미팅', '코드 리뷰', '병원 예약', '가족 통화']
let apptSeq = 0
const NEXT_MONDAY = addDays(CURRENT_MONDAY, 7)
const allWeekMondays = [...achievedPlans.map((w) => w.weekOf), CURRENT_MONDAY]
for (const monday of allWeekMondays) {
  for (let day = 0; day < 7; day++) {
    const date = addDays(monday, day)
    if (date === TODAY) continue // 오늘은 이미 위에서 채움
    const count = day % 2 === 0 ? 2 : 3
    for (let n = 0; n < count; n++) {
      const title = APPT_TITLES[apptSeq % APPT_TITLES.length]
      apptSeq += 1
      const startMin = 19 * 60 + n * 60 // 19시부터 1시간 간격 — 낮 시간대는 회사 업무로 비움
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

// --- 다음 주(NEXT_MONDAY) 약속: 매일이 아니라 2일에만 몰아서 배치 ---
const NEXT_WEEK_APPT_COUNTS = [
  [1, 3], // 화 3개
  [3, 2], // 목 2개
]
for (const [dayOffset, count] of NEXT_WEEK_APPT_COUNTS) {
  const date = addDays(NEXT_MONDAY, dayOffset)
  for (let n = 0; n < count; n++) {
    const title = APPT_TITLES[apptSeq % APPT_TITLES.length]
    apptSeq += 1
    tasks.push({
      id: nextId('appt'),
      title,
      weeklyGoalId: null,
      categoryId: 'cat-etc',
      estimatedMin: 30,
      plannedBlock: block(date, 19 * 60 + n * 60, 30),
      actualBlock: null,
      status: 'todo',
    })
  }
}

// "오늘 확정"(R2) 잠금 여부 — 오늘 일정에 걸린 task만 미확정으로 둔다.
const tasksWithConfirmed = tasks.map((t) => ({
  ...t,
  confirmed: !(t.plannedBlock && t.plannedBlock.start.startsWith(TODAY)),
}))

const seedData = {
  categories,
  monthlyGoals: [monthlyGoalProject, monthlyGoalStudy],
  weeklyGoals,
  tasks: tasksWithConfirmed,
}

writeFileSync(OUT_PATH, JSON.stringify(seedData, null, 2) + '\n', 'utf-8')
console.log(`시드 데이터 생성 완료(김도윤): ${OUT_PATH}`)
console.log(`  오늘 = ${TODAY}, 이번 주 월요일 = ${CURRENT_MONDAY}`)
console.log(`  categories: ${categories.length}, monthlyGoals: 2, weeklyGoals: ${weeklyGoals.length}`)
console.log(`  tasks: ${tasks.length} (약속 ${apptSeq}개 포함)`)
