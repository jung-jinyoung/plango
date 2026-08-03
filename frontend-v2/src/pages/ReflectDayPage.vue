<template>
  <div class="reflect-day-page">
    <div class="wrap">
      <h1>오늘의 기록</h1>

      <BaseCard class="section">
        <h2>끝낸 일, 시간이 맞나요</h2>
        <p v-if="doneEntries.length === 0" class="empty">아직 끝낸 일이 없어요.</p>
        <ActualBlockRow
          v-for="entry in doneEntries"
          :key="entry.task.id"
          :title="entry.task.title"
          :color="entry.color"
          :planned-min="entry.plannedMin"
          :actual-start="entry.task.actualBlock!.start"
          :duration-min="entry.durationMin"
          @update-duration="(minutes) => onUpdateDuration(entry.task.id, minutes)"
        />
      </BaseCard>

      <BaseCard class="section">
        <h2>오늘 계획한 만큼 됐나요</h2>
        <div class="summary-top">
          <b>{{ formatMinutesAsHours(actualTotalMin) }} 썼어요</b>
          <span>계획한 시간 {{ formatMinutesAsHours(plannedTotalMin) }}</span>
        </div>
        <ProgressBar :percent="summaryPercent" color="mint" />
      </BaseCard>

      <BaseCard class="section">
        <h2>아직 안 한 일, 어떻게 할까요</h2>
        <p v-if="incompleteEntries.length === 0" class="empty">오늘 남은 할 일이 없어요.</p>
        <IncompleteTaskRow
          v-for="entry in incompleteEntries"
          :key="entry.task.id"
          :title="entry.task.title"
          :color="entry.color"
          :estimated-min="entry.task.estimatedMin"
          @carry="onCarry(entry.task.id)"
        />
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { actualMin, categoryColorOf, resolveCategory } from '../entities/derive'
import type { CategoryColor, Task } from '../entities/types'
import ActualBlockRow from '../features/reflect/components/ActualBlockRow.vue'
import IncompleteTaskRow from '../features/reflect/components/IncompleteTaskRow.vue'
import { useGoalStore } from '../features/goal/stores/goalStore'
import { useTaskStore } from '../features/task/stores/taskStore'
import { addMinutes, formatMinutesAsHours, minutesBetween } from '../shared/lib/time'
import BaseCard from '../shared/ui/BaseCard.vue'
import ProgressBar from '../shared/ui/ProgressBar.vue'

// TodayPage.vue와 같은 이유로 시드 데이터가 설계된 "오늘" 날짜를 고정으로 쓴다.
const TODAY = '2026-07-29'

const goalStore = useGoalStore()
const taskStore = useTaskStore()

const todayTasks = computed(() => taskStore.tasks.filter((t) => t.plannedBlock?.start.startsWith(TODAY)))

function resolveColor(task: Task): CategoryColor {
  const category = resolveCategory(task, goalStore.weeklyGoalsById, goalStore.monthlyGoalsById, goalStore.categoriesById)
  return categoryColorOf(category)
}

function plannedMinOf(task: Task): number {
  if (!task.plannedBlock) return 0
  return minutesBetween(task.plannedBlock.start, task.plannedBlock.end)
}

// ① 자동 포착 값 확인·수정 — 오늘 완료된 할 일만 대상. actualBlock이 없는
// done은 이론상 없지만(자동 포착이 완료와 함께 만들어짐) 방어적으로 걸러낸다.
const doneEntries = computed(() =>
  todayTasks.value
    .filter((t) => t.status === 'done' && t.actualBlock)
    .map((task) => ({
      task,
      color: resolveColor(task),
      plannedMin: plannedMinOf(task),
      durationMin: actualMin(task),
    })),
)

function onUpdateDuration(taskId: string, minutes: number) {
  const task = taskStore.tasksById.get(taskId)
  if (!task?.actualBlock) return
  taskStore.updateTask(taskId, {
    actualBlock: { start: task.actualBlock.start, end: addMinutes(task.actualBlock.start, minutes) },
  })
}

// ② 계획 대비 실제 요약 — 오늘 계획된 전체(plannedBlock)와 실제로 쓴 시간
// 전체(actualMin)를 그대로 합산한다. 새 파생 함수를 만들지 않고 기존
// minutesBetween/actualMin을 페이지 레벨에서 조합했다.
const plannedTotalMin = computed(() => todayTasks.value.reduce((sum, t) => sum + plannedMinOf(t), 0))
const actualTotalMin = computed(() => todayTasks.value.reduce((sum, t) => sum + actualMin(t), 0))
const summaryPercent = computed(() =>
  plannedTotalMin.value > 0 ? (actualTotalMin.value / plannedTotalMin.value) * 100 : 0,
)

// ③ 미완료 일괄 처리 — 오늘 아직 todo인 할 일. "내일로"/"이번 주 내로" 모두
// 지금은 status만 carried로 바꾼다(새 항목 생성은 다음 슬라이스, R4).
const incompleteEntries = computed(() =>
  todayTasks.value
    .filter((t) => t.status === 'todo')
    .map((task) => ({ task, color: resolveColor(task) })),
)

function onCarry(taskId: string) {
  taskStore.updateTask(taskId, { status: 'carried' })
}
</script>

<style scoped>
.reflect-day-page {
  min-height: 100vh;
  background: var(--surface-page);
  color: var(--text-primary);
  padding: 24px 0 60px;
}
.wrap {
  max-width: 560px;
  margin: 0 auto;
  padding: 0 20px;
}
.wrap h1 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 20px;
}
.section {
  margin-bottom: 14px;
}
.section h2 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: -0.01em;
  margin-bottom: 14px;
}
.empty {
  font-size: 13.5px;
  color: var(--text-muted);
}
.summary-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 13px;
  margin-bottom: 10px;
}
.summary-top b {
  font-weight: 700;
  font-size: 16px;
}
.summary-top span {
  color: var(--text-muted);
}
</style>
