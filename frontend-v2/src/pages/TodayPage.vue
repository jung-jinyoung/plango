<template>
  <div class="today-page">
    <aside class="col-sidebar">
      <GoalSidebar
        :monthly-goal="monthlyGoal"
        :weekly-goals="weeklyGoals"
        :tasks="allTasks"
        :monthly-goals-by-id="goalStore.monthlyGoalsById"
        :categories-by-id="goalStore.categoriesById"
      />
    </aside>

    <main class="col-main">
      <div class="confirm-row">
        <BaseButton
          variant="primary"
          :disabled="todayConfirmed || todayTasks.length === 0"
          @click="onConfirmToday"
        >
          {{ todayConfirmed ? '오늘 확정했어요' : '오늘 확정' }}
        </BaseButton>
      </div>
      <CarryOverBanner
        v-if="!bannerDismissed && carriedYesterdayCount > 0"
        :count="carriedYesterdayCount"
        @dismiss="bannerDismissed = true"
        @accept="bannerDismissed = true"
      />
      <BaseCard class="timeline-card">
        <ScheduleTimeline
          :tasks="timelineTasks"
          :start-hour="8"
          :end-hour="21"
          :px-per-hour="64"
          @drag-block="onDragBlock"
        />
      </BaseCard>
    </main>

    <aside class="col-inbox">
      <InboxPanel :candidate-goals="candidateGoals" :unplaced-tasks="unplacedTasks" />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { categoryColorOf, resolveCategory } from '../entities/derive'
import CarryOverBanner from '../features/task/components/CarryOverBanner.vue'
import GoalSidebar from '../features/goal/components/GoalSidebar.vue'
import { useGoalStore } from '../features/goal/stores/goalStore'
import InboxPanel from '../features/task/components/InboxPanel.vue'
import type { TimelineTaskInput } from '../features/schedule/components/ScheduleTimeline.vue'
import ScheduleTimeline from '../features/schedule/components/ScheduleTimeline.vue'
import { useTaskStore } from '../features/task/stores/taskStore'
import { addDays } from '../shared/lib/time'
import BaseButton from '../shared/ui/BaseButton.vue'
import BaseCard from '../shared/ui/BaseCard.vue'
import type { TimeBlock } from '../entities/types'

// 시드 데이터가 설계된 "오늘" 날짜로 고정 — 실제 진입 라우팅(CLAUDE.md 14절
// 10단계)에서 useNow() 기반 실제 날짜로 교체한다. 지금은 seed-data.json이
// 이 날짜를 중심으로 만들어져 있어서(scripts/generate-seed.mjs) 고정값을 쓴다.
const TODAY = '2026-07-29'
const YESTERDAY = addDays(TODAY, -1)

const goalStore = useGoalStore()
const taskStore = useTaskStore()

const bannerDismissed = ref(false)

const allTasks = computed(() => taskStore.tasks)
const weeklyGoals = computed(() => goalStore.weeklyGoals)
const candidateGoals = computed(() => goalStore.weeklyGoals.filter((g) => g.status === 'active'))
// 사이드바에 보여줄 월간 목표 — 지금은 시드의 논문 목표 하나로 고정.
// 여러 월간 목표 중 "표시할 것"을 고르는 로직은 아직 없다(향후 과제).
const monthlyGoal = computed(() => goalStore.monthlyGoalsById.get('mg-thesis') ?? null)

const todayTasks = computed(() =>
  allTasks.value.filter((t) => t.plannedBlock?.start.startsWith(TODAY)),
)

const carriedYesterdayCount = computed(
  () =>
    allTasks.value.filter((t) => t.status === 'carried' && t.plannedBlock?.start.startsWith(YESTERDAY))
      .length,
)

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

function onConfirmToday() {
  todayTasks.value.forEach((t) => taskStore.updateTask(t.id, { confirmed: true }))
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
  padding: 20px 20px 8px;
}
.confirm-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
</style>
