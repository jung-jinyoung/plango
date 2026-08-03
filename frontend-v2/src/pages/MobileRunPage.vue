<template>
  <div class="mobile-run-page">
    <div class="summary">
      <div class="summary-top">
        <h1>오늘</h1>
        <span class="count">{{ todayTasks.length }}개 중 {{ doneCount }}개 했어요</span>
      </div>
      <div class="pips">
        <i v-for="task in todayTasks" :key="task.id" class="pip" :class="pipClass(task)" />
      </div>
    </div>

    <BaseCard v-if="currentTask" class="now-card">
      <span class="now-tag"><span class="pulse" />지금 하는 일</span>
      <h2>{{ currentTask.title }}</h2>
      <Chip v-if="currentGoalTitle" variant="category" :color="currentColor" dot>{{ currentGoalTitle }}</Chip>

      <div class="timer">
        <span class="elapsed">{{ formatMinutesAsHours(elapsedMin) }}</span>
        <span class="of">/ {{ formatMinutesAsHours(currentTask.estimatedMin) }} 예상</span>
      </div>
      <ProgressBar :percent="elapsedPercent" :color="currentColor" />
      <div v-if="currentTask.plannedBlock" class="timer-note">
        {{ formatHHMM(currentTask.plannedBlock.start) }}부터 하고 있어요
      </div>

      <div class="acts">
        <BaseButton variant="primary" class="done-btn" @click="onComplete(currentTask)">다 했어요</BaseButton>
        <BaseButton variant="ghost" class="postpone-btn" @click="onPostpone(currentTask)">미루기</BaseButton>
      </div>
    </BaseCard>
    <BaseCard v-else class="now-card is-empty">
      <p>지금 하기로 한 일이 없어요</p>
    </BaseCard>

    <section v-if="upcomingTasks.length > 0" class="section">
      <div class="sec-h">이따 할 일</div>
      <div
        v-for="item in upcomingTasks"
        :key="item.task.id"
        class="item"
        :class="{ appt: item.task.weeklyGoalId === null }"
      >
        <span v-if="item.task.plannedBlock" class="tm">{{ formatHHMM(item.task.plannedBlock.start) }}</span>
        <Dot :color="item.color" />
        <span class="tt">{{ item.task.title }}</span>
        <span class="mn">{{ item.task.estimatedMin }}분</span>
      </div>
    </section>

    <section v-if="carriedTasks.length > 0" class="section">
      <div class="sec-h">다음으로 옮긴 일</div>
      <div v-for="task in carriedTasks" :key="task.id" class="item is-carried">
        <span class="tt">{{ task.title }}</span>
      </div>
    </section>

    <section v-if="finishedTasks.length > 0" class="section">
      <div class="sec-h">끝낸 일</div>
      <div v-for="task in finishedTasks" :key="task.id" class="item finished">
        <span class="check">✓</span>
        <span class="tt">{{ task.title }}</span>
        <span class="mn">{{ formatMinutesAsHours(actualMin(task)) }}</span>
      </div>
    </section>

    <p class="tail">저녁에 오늘 기록을 정리해요</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { actualMin, categoryColorOf, findCurrentTask, resolveCategory } from '../entities/derive'
import type { CategoryColor, Task } from '../entities/types'
import { useGoalStore } from '../features/goal/stores/goalStore'
import { useTaskStore } from '../features/task/stores/taskStore'
import { formatHHMM, formatMinutesAsHours, minutesBetween, minutesOfDay, useNow } from '../shared/lib/time'
import BaseButton from '../shared/ui/BaseButton.vue'
import BaseCard from '../shared/ui/BaseCard.vue'
import Chip from '../shared/ui/Chip.vue'
import Dot from '../shared/ui/Dot.vue'
import ProgressBar from '../shared/ui/ProgressBar.vue'

// TodayPage.vue와 같은 이유로 시드 데이터가 설계된 "오늘" 날짜를 고정으로 쓴다.
const TODAY = '2026-07-29'

const goalStore = useGoalStore()
const taskStore = useTaskStore()
const now = useNow()

const todayTasks = computed(() =>
  taskStore.tasks
    .filter((t) => t.plannedBlock?.start.startsWith(TODAY))
    .sort((a, b) => minutesOfDay(a.plannedBlock!.start) - minutesOfDay(b.plannedBlock!.start)),
)

const doneCount = computed(() => todayTasks.value.filter((t) => t.status === 'done').length)

const currentTask = computed(() => findCurrentTask(todayTasks.value, now.value))

function resolveColor(task: Task) {
  const category = resolveCategory(task, goalStore.weeklyGoalsById, goalStore.monthlyGoalsById, goalStore.categoriesById)
  return categoryColorOf(category)
}

const currentColor = computed<CategoryColor>(() => (currentTask.value ? resolveColor(currentTask.value) : 'gray'))
const currentGoalTitle = computed(() => {
  const weeklyGoalId = currentTask.value?.weeklyGoalId
  return weeklyGoalId ? (goalStore.weeklyGoalsById.get(weeklyGoalId)?.title ?? null) : null
})

const elapsedMin = computed(() => {
  if (!currentTask.value?.plannedBlock) return 0
  return Math.max(0, minutesBetween(currentTask.value.plannedBlock.start, now.value))
})
const elapsedPercent = computed(() => {
  if (!currentTask.value || currentTask.value.estimatedMin <= 0) return 0
  return (elapsedMin.value / currentTask.value.estimatedMin) * 100
})

const upcomingTasks = computed(() =>
  todayTasks.value
    .filter((t) => t.status === 'todo' && t.id !== currentTask.value?.id)
    .map((task) => ({ task, color: resolveColor(task) })),
)

const carriedTasks = computed(() => todayTasks.value.filter((t) => t.status === 'carried'))
const finishedTasks = computed(() => todayTasks.value.filter((t) => t.status === 'done'))

function pipClass(task: Task) {
  if (task.status === 'done') return 'is-done'
  if (task.id === currentTask.value?.id) return 'is-now'
  return ''
}

// "다 했어요" — 완료 시점에 actualBlock을 만든다(CLAUDE.md 5-4절 자동 포착).
// taskStore.updateTask를 그대로 재사용, 새 액션 없음.
function onComplete(task: Task) {
  if (!task.plannedBlock) return
  taskStore.updateTask(task.id, {
    actualBlock: { start: task.plannedBlock.start, end: now.value },
    status: 'done',
  })
}

// "미루기" — plannedBlock은 그대로 두고 status만 carried로 바꾼다(드래그 없음,
// product-spec.md "완료 / 미루기 / 시간 변경. 드래그 없음."). taskStore.updateTask 재사용.
function onPostpone(task: Task) {
  taskStore.updateTask(task.id, { status: 'carried' })
}
</script>

<style scoped>
.mobile-run-page {
  max-width: 420px;
  margin: 0 auto;
  padding: 20px 18px 32px;
  display: flex;
  flex-direction: column;
}

.summary-top {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}
.summary-top h1 {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.03em;
}
.summary-top .count {
  font-size: 13px;
  color: var(--text-muted);
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}
.pips {
  display: flex;
  gap: 4px;
}
.pip {
  flex: 1;
  height: 5px;
  border-radius: var(--radius-pill);
  background: var(--border);
}
.pip.is-done {
  background: var(--cat-blue);
}
.pip.is-now {
  background: var(--rose-500);
}

.now-card {
  margin-top: 16px;
  padding: 24px 22px;
}
.now-card.is-empty {
  text-align: center;
  color: var(--text-muted);
}
.now-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--rose-700);
  background: var(--rose-50);
  padding: 5px 11px;
  border-radius: var(--radius-pill);
}
.now-tag .pulse {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--rose-500);
  animation: pulse 1.6s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}
.now-card h2 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.32;
  margin: 14px 0 6px;
}

.timer {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin: 20px 0 8px;
}
.timer .elapsed {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.timer .of {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
  padding-bottom: 3px;
}
.timer-note {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-top: 9px;
  font-variant-numeric: tabular-nums;
}

.acts {
  display: flex;
  gap: 8px;
  margin-top: 22px;
}
.done-btn {
  flex: 1;
  padding: 15px;
  font-size: 15px;
}
.postpone-btn {
  width: 88px;
  background: var(--surface-sunken);
}

.section {
  margin-top: 26px;
}
.sec-h {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 10px;
  padding-left: 2px;
}
.item {
  background: var(--surface-card);
  border-radius: var(--radius-ctrl);
  padding: 14px 15px;
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 8px;
}
.item .tm {
  font-size: 12.5px;
  color: var(--text-muted);
  font-weight: 600;
  width: 40px;
  flex: none;
  font-variant-numeric: tabular-nums;
}
.item .tt {
  flex: 1;
  font-weight: 600;
  font-size: 14.5px;
  letter-spacing: -0.01em;
}
.item .mn {
  font-size: 12.5px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.item.appt .tt {
  color: var(--text-secondary);
  font-weight: 500;
}
.item.is-carried .tt {
  color: var(--text-muted);
}

.item.finished {
  background: transparent;
  padding: 12px 15px;
}
.item.finished .tt {
  color: var(--text-muted);
  font-weight: 500;
  text-decoration: line-through;
  text-decoration-color: var(--border);
}
.item.finished .check {
  width: 19px;
  height: 19px;
  border-radius: var(--radius-pill);
  background: var(--border);
  color: var(--surface-card);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  font-size: 11px;
}

.tail {
  text-align: center;
  color: var(--text-muted);
  font-size: 12.5px;
  padding: 22px 0 6px;
}
</style>
