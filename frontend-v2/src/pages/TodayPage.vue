<template>
  <PersonaBadge />
  <AppHeader :subtitle="formatDateKo(DEMO_TODAY)">
    <template #actions>
      <BaseButton
        variant="primary"
        :disabled="todayConfirmed || todayTasks.length === 0"
        @click="onConfirmToday"
      >
        {{ todayConfirmed ? '오늘 확정했어요' : '오늘 확정' }}
      </BaseButton>
    </template>
  </AppHeader>
  <div class="today-page">
    <aside class="col-sidebar">
      <GoalSidebar
        :monthly-goal="monthlyGoal"
        :weekly-goals="weeklyGoals"
        :week-of="startOfWeek(DEMO_TODAY)"
        :tasks="allTasks"
        :monthly-goals-by-id="goalStore.monthlyGoalsById"
        :categories-by-id="goalStore.categoriesById"
      />
    </aside>

    <main class="col-main">
      <ReturnGapBanner
        v-if="!bannerDismissed && isReturningAfterGap"
        @dismiss="bannerDismissed = true"
        @accept="onAcceptReturnGap"
      />
      <CarryOverBanner
        v-else-if="!bannerDismissed && carriedCount > 0"
        :count="carriedCount"
        @dismiss="bannerDismissed = true"
        @accept="onAcceptCarry"
      />
      <BaseCard class="timeline-card">
        <ScheduleTimeline
          :tasks="timelineTasks"
          :start-hour="timelineRange.startHour"
          :end-hour="timelineRange.endHour"
          :px-per-hour="64"
          @drag-block="onDragBlock"
          @select-block="(id) => (selectedTaskId = id)"
        />
      </BaseCard>
    </main>

    <aside class="col-inbox">
      <InboxPanel
        :candidate-goals="candidateGoals"
        :unplaced-tasks="unplacedTasks"
        :place-note="placeNote"
        @add="onAddTask"
        @place="onPlaceInGaps"
      />
    </aside>
  </div>

  <TaskBlockDialog
    :task="selectedTask"
    :phase="selectedPhase"
    :candidate-goals="candidateGoals"
    @close="selectedTaskId = null"
    @complete="(block) => applyToSelected({ status: 'done', actualBlock: block })"
    @carry="applyToSelected({ status: 'carried' })"
    @drop="applyToSelected({ status: 'dropped' })"
    @save="(patch) => applyToSelected(patch)"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { categoryColorOf, filterStaleCarried, lastActiveDate, resolveCategory } from '../entities/derive'
import { hasLongActivityGap } from '../features/reflect/lib/resolveEntry'
import CarryOverBanner from '../features/task/components/CarryOverBanner.vue'
import ReturnGapBanner from '../features/task/components/ReturnGapBanner.vue'
import GoalSidebar from '../features/goal/components/GoalSidebar.vue'
import { useGoalStore } from '../features/goal/stores/goalStore'
import InboxPanel from '../features/task/components/InboxPanel.vue'
import TaskBlockDialog from '../features/task/components/TaskBlockDialog.vue'
import type { TimelineTaskInput } from '../features/schedule/components/ScheduleTimeline.vue'
import ScheduleTimeline from '../features/schedule/components/ScheduleTimeline.vue'
import { placeInGaps } from '../features/schedule/lib/placeInGaps'
import { carryIntoToday, pendingCarried } from '../features/task/lib/carryOver'
import type { ParsedTaskInput } from '../features/task/lib/parse'
import { useTaskStore } from '../features/task/stores/taskStore'
import AppHeader from '../shared/ui/AppHeader.vue'
import BaseButton from '../shared/ui/BaseButton.vue'
import BaseCard from '../shared/ui/BaseCard.vue'
import PersonaBadge from '../shared/ui/PersonaBadge.vue'
import { getDemoToday } from '../shared/lib/seedDateShift'
import {
  formatDateKo,
  minutesOfDay,
  startOfWeek,
  timelineHourRange,
  useNow,
} from '../shared/lib/time'
import type { Task, TimeBlock } from '../entities/types'

// DEMO_TODAY — 시드 데이터(scripts/generate-seed.mjs)가 이 날짜를 중심으로
// 고정 생성돼 있어서 화면 표시도 이 날짜에 고정한다. 실제 현재 시각으로
// 판단하는 router/index.ts(진입 라우팅)와는 별개 상수다 — 혼동 방지용으로
// 이름도 다르게 뒀다. getDemoToday()는 VITE_DEMO_FRESH가 켜진 배포에서만
// 방문 시점의 "이번 주"로 이동하고, 그 외에는 시드 고정값을 그대로 낸다.
const DEMO_TODAY = getDemoToday()

// 하루 기본 범위 — 타임라인 표시와 "비어 있는 시간에 놓기"가 같은 범위를 쓴다
const DAY_START_HOUR = 8
const DAY_END_HOUR = 21

const router = useRouter()
const goalStore = useGoalStore()
const taskStore = useTaskStore()

const bannerDismissed = ref(false)

const allTasks = computed(() => taskStore.tasks)
const weeklyGoals = computed(() => goalStore.weeklyGoals)
// # 자동완성 후보는 이번 주 목표만(CLAUDE.md 9절) — 지난주에 active로 남은 목표가 섞이지 않게
const candidateGoals = computed(() =>
  goalStore.weeklyGoals.filter(
    (g) => g.status === 'active' && g.weekOf === startOfWeek(DEMO_TODAY),
  ),
)
// 사이드바에 보여줄 월간 목표 — 시드에서 첫 번째로 등록된(=주력) 월간 목표
// 하나로 고정. 여러 월간 목표 중 "표시할 것"을 고르는 로직은 아직 없다(향후
// 과제) — 페르소나마다 주력 목표 id가 다르므로(mg-thesis/mg-project) 하드코딩
// 대신 등록 순서 첫 번째를 쓴다.
const monthlyGoal = computed(() => goalStore.monthlyGoals[0] ?? null)

const todayTasks = computed(() =>
  allTasks.value.filter((t) => t.plannedBlock?.start.startsWith(DEMO_TODAY)),
)

// 타임라인 범위 — 기본 08~21시, 현재 시각이나 오늘 블록이 밖에 있으면 덮도록 넓힌다.
// 포트폴리오 방문자가 밤·이른 아침에 들어와도 현재 시각 바가 카드 안에 그려진다.
const now = useNow()
const timelineRange = computed(() =>
  timelineHourRange(
    [
      now.value,
      ...todayTasks.value.flatMap((t) =>
        [t.plannedBlock, t.actualBlock].flatMap((b) => (b ? [b.start, b.end] : [])),
      ),
    ],
    DAY_START_HOUR,
    DAY_END_HOUR,
  ),
)

// 오늘 이전의 carried task 중 3일 이상 지난 것은 filterStaleCarried가 걸러낸다
// (화면 표시 필터일 뿐 status는 안 건드림, R4) — 평소엔 "어제" 정도만 남지만
// 며칠 건너뛴 경우에도 3일 미만이면 자연스럽게 같이 보인다.
// 이미 오늘로 옮긴 항목은 빼서 화면을 다시 열어도 배너가 같은 일을 또 권하지 않게 한다.
const carriedTasks = computed(() =>
  pendingCarried(
    filterStaleCarried(
      allTasks.value.filter((t) => t.plannedBlock && t.plannedBlock.start < DEMO_TODAY),
      DEMO_TODAY,
    ),
    DEMO_TODAY,
    new Set(taskStore.tasksById.keys()),
  ),
)
const carriedCount = computed(() => carriedTasks.value.length)

// "오늘로 옮기기" — R4: 원래 task는 그대로 두고 오늘 인박스에 새 task를 만든다
function onAcceptCarry() {
  carryIntoToday(carriedTasks.value, DEMO_TODAY).forEach((t) => taskStore.addTask(t))
  bannerDismissed.value = true
}

// 진입 라우팅(CLAUDE.md 12절) "복귀 리셋" — 마지막 활동으로부터 3일 이상
// 지났으면 이월 배너 대신 이 배너를 보여준다(누적 미완료를 보여주지 않는다).
const isReturningAfterGap = computed(() =>
  hasLongActivityGap(lastActiveDate(allTasks.value, DEMO_TODAY), DEMO_TODAY),
)

function onAcceptReturnGap() {
  bannerDismissed.value = true
  router.push({ name: 'reflect-week' })
}

function resolveColor(task: (typeof allTasks.value)[number]) {
  const category = resolveCategory(
    task,
    goalStore.weeklyGoalsById,
    goalStore.monthlyGoalsById,
    goalStore.categoriesById,
  )
  return categoryColorOf(category)
}

// resolveCategory를 여기서 실제로 호출한다(pages 레벨) — features/schedule의
// ScheduleTimeline, features/task의 InboxPanel은 이미 정해진 색만 받아서 쓰고
// 다시 조회하지 않는다.
const timelineTasks = computed<TimelineTaskInput[]>(() =>
  todayTasks.value.map((task) => ({ task, color: resolveColor(task) })),
)

const unplacedTasks = computed(() =>
  allTasks.value
    .filter((t) => t.plannedBlock === null)
    .map((task) => ({ task, color: resolveColor(task) })),
)

// "오늘 확정"(R2) — 오늘 task 전체를 한 번에 잠근다. 확정 후 오늘에 새 task가
// 추가되면(온보딩 등) every()가 다시 false가 될 수 있는데, 이미 confirmed:true인
// 다른 task엔 영향이 없다(개별 필드라 서로 독립적) — 버튼이 다시 눌리는 정도의
// 코스메틱한 차이일 뿐, R2 정합성 문제는 아니다.
const todayConfirmed = computed(
  () => todayTasks.value.length > 0 && todayTasks.value.every((t) => t.confirmed),
)

// 입력창 Enter — 시간이 적힌 경우에만 올라온다(R7, TaskInputPreview). 인박스로 들어간다.
function onAddTask(parsed: ParsedTaskInput) {
  placeNote.value = ''
  taskStore.addTask({
    id: `task-inbox-${Date.now()}`,
    title: parsed.title,
    weeklyGoalId: parsed.weeklyGoalId,
    categoryId: null,
    estimatedMin: parsed.estimatedMin!,
    plannedBlock: null,
    actualBlock: null,
    status: 'todo',
    confirmed: false,
  })
}

// "비어 있는 시간에 놓기" — 지금 이후의 빈틈에 인박스 순서대로 넣는다(기획서 7-6절).
// "오늘 확정" 전까지는 드래그로 옮길 수 있는 제안 상태다.
const placeNote = ref('')
function onPlaceInGaps() {
  const unplaced = unplacedTasks.value.map((item) => item.task)
  const occupied = todayTasks.value.flatMap((t) => (t.plannedBlock ? [t.plannedBlock] : []))
  const placements = placeInGaps(
    unplaced,
    occupied,
    DEMO_TODAY,
    Math.max(DAY_START_HOUR * 60, minutesOfDay(now.value)),
    DAY_END_HOUR * 60,
  )
  placements.forEach((p) => taskStore.updateTask(p.taskId, { plannedBlock: p.block }))

  const left = unplaced.length - placements.length
  placeNote.value =
    left === 0
      ? `${placements.length}개를 놓았어요. 오늘 확정 전까지 드래그로 옮길 수 있어요.`
      : placements.length === 0
        ? '오늘 남은 시간이 부족해서 인박스에 그대로 뒀어요.'
        : `${placements.length}개를 놓았어요. ${left}개는 남은 시간이 부족해서 인박스에 뒀어요.`
}

function onConfirmToday() {
  todayTasks.value.forEach((t) => taskStore.updateTask(t.id, { confirmed: true }))
}

// 블록 클릭 패널 — 지난(또는 진행 중) 블록은 어떻게 됐는지 기록하고("기록할까요?"), 앞으로 할 블록은 내용을 편집한다.
// 시점은 현재 시각 바와 같은 기준(시:분)으로 나눈다. 끝낸 일은 언제든 실제 시간을 고칠 수 있다.
const selectedTaskId = ref<string | null>(null)
const selectedTask = computed(() =>
  selectedTaskId.value ? (taskStore.tasksById.get(selectedTaskId.value) ?? null) : null,
)
const selectedPhase = computed<'past' | 'current' | 'future'>(() => {
  const task = selectedTask.value
  if (!task?.plannedBlock) return 'future'
  if (task.status === 'done') return 'past'
  const nowMin = minutesOfDay(now.value)
  if (minutesOfDay(task.plannedBlock.end) <= nowMin) return 'past'
  if (minutesOfDay(task.plannedBlock.start) <= nowMin) return 'current'
  return 'future'
})

function applyToSelected(patch: Partial<Task>) {
  if (selectedTaskId.value) taskStore.updateTask(selectedTaskId.value, patch)
  selectedTaskId.value = null
}

// ScheduleTimeline은 store를 모른다(CLAUDE.md 6절) — R2·R3 판정(resolveDragTarget)까지
// 끝낸 결과만 emit으로 받아서 여기서 taskStore.updateTask를 호출한다.
function onDragBlock(taskId: string, field: 'plannedBlock' | 'actualBlock', block: TimeBlock) {
  taskStore.updateTask(taskId, { [field]: block })
}
</script>

<style scoped>
.today-page {
  display: grid;
  grid-template-columns: 264px 1fr 312px;
  gap: 16px;
  padding: 16px 24px;
  align-items: start;
}
.timeline-card {
  padding: 20px;
}
</style>
