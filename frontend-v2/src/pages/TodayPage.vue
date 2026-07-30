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
      <BaseCard class="timeline-card">
        <ScheduleTimeline :tasks="timelineTasks" :start-hour="8" :end-hour="21" :px-per-hour="64" />
      </BaseCard>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { categoryColorOf, resolveCategory } from '../entities/derive'
import GoalSidebar from '../features/goal/components/GoalSidebar.vue'
import { useGoalStore } from '../features/goal/stores/goalStore'
import type { TimelineTaskInput } from '../features/schedule/components/ScheduleTimeline.vue'
import ScheduleTimeline from '../features/schedule/components/ScheduleTimeline.vue'
import { useTaskStore } from '../features/task/stores/taskStore'
import BaseCard from '../shared/ui/BaseCard.vue'

// 시드 데이터가 설계된 "오늘" 날짜로 고정 — 실제 진입 라우팅(CLAUDE.md 14절
// 10단계)에서 useNow() 기반 실제 날짜로 교체한다. 지금은 seed-data.json이
// 이 날짜를 중심으로 만들어져 있어서(scripts/generate-seed.mjs) 고정값을 쓴다.
const TODAY = '2026-07-29'

const goalStore = useGoalStore()
const taskStore = useTaskStore()

const allTasks = computed(() => taskStore.tasks)
const weeklyGoals = computed(() => goalStore.weeklyGoals)
// 사이드바에 보여줄 월간 목표 — 지금은 시드의 논문 목표 하나로 고정.
// 여러 월간 목표 중 "표시할 것"을 고르는 로직은 아직 없다(향후 과제).
const monthlyGoal = computed(() => goalStore.monthlyGoalsById.get('mg-thesis') ?? null)

const todayTasks = computed(() =>
  allTasks.value.filter((t) => t.plannedBlock?.start.startsWith(TODAY)),
)

// resolveCategory를 여기서 실제로 호출한다(pages 레벨) — features/schedule의
// Timeline은 이미 정해진 색만 받아서 쓰고 다시 조회하지 않는다.
const timelineTasks = computed<TimelineTaskInput[]>(() =>
  todayTasks.value.map((task) => {
    const category = resolveCategory(
      task,
      goalStore.weeklyGoalsById,
      goalStore.monthlyGoalsById,
      goalStore.categoriesById,
    )
    return { task, color: categoryColorOf(category) }
  }),
)
</script>

<style scoped>
.today-page {
  display: grid;
  grid-template-columns: 264px 1fr;
  gap: 16px;
  padding: 16px 24px;
  align-items: start;
}
.timeline-card {
  padding: 20px 20px 8px;
}
</style>
