<template>
  <QDialog :model-value="task !== null" @update:model-value="(open) => !open && emit('close')">
    <BaseCard v-if="task" class="dialog">
      <h3>{{ task.title }}</h3>
      <p class="meta">
        <span v-if="task.plannedBlock">계획 {{ range(task.plannedBlock) }}</span>
        <span v-if="task.actualBlock"> · 실제 {{ range(task.actualBlock) }}</span>
      </p>

      <!-- ---------- 지났거나 진행 중인 블록: 했는지 확인 ---------- -->
      <template v-if="phase !== 'future'">
        <div v-if="!editingTime" class="choices">
          <template v-if="task.status === 'todo'">
            <BaseButton variant="primary" @click="completeAsPlanned">
              {{ phase === 'current' ? '지금 끝냈어요' : '계획대로 했어요' }}
            </BaseButton>
            <BaseButton variant="ghost" @click="startEditingTime">시간이 달랐어요</BaseButton>
            <BaseButton variant="ghost" @click="emit('carry')">다음으로 옮길게요</BaseButton>
            <BaseButton variant="ghost" @click="emit('drop')">이번엔 안 할게요</BaseButton>
          </template>
          <BaseButton v-else-if="task.status === 'done'" variant="ghost" @click="startEditingTime">
            실제 시간 고치기
          </BaseButton>
        </div>

        <div v-else class="time-edit">
          <label>
            <span>시작</span>
            <select v-model.number="startMin" class="field">
              <option v-for="m in startOptions" :key="m" :value="m">{{ label(m) }}</option>
            </select>
          </label>
          <label>
            <span>끝</span>
            <select v-model.number="endMin" class="field">
              <option v-for="m in endOptions" :key="m" :value="m">{{ label(m) }}</option>
            </select>
          </label>
          <BaseButton variant="primary" @click="completeWithEditedTime">이 시간으로 기록하기</BaseButton>
        </div>
      </template>

      <!-- ---------- 앞으로 할 블록: 내용 편집 ---------- -->
      <form v-else class="edit" @submit.prevent="save">
        <label>
          <span>할 일</span>
          <input v-model="draftTitle" class="field" type="text" />
        </label>
        <label>
          <span>예상</span>
          <select v-model.number="draftMin" class="field">
            <option v-for="m in MINUTE_OPTIONS" :key="m" :value="m">{{ formatMinutesKo(m) }}</option>
          </select>
        </label>
        <label>
          <span>이번 주 목표</span>
          <select v-model="draftGoalId" class="field">
            <option v-for="g in candidateGoals" :key="g.id" :value="g.id">{{ g.title }}</option>
            <option :value="null">목표 없음 (약속)</option>
          </select>
        </label>
        <p v-if="task.confirmed" class="note">확정한 계획이라 시간은 그대로 두고 내용만 바꿔요.</p>
        <BaseButton variant="primary" type="submit" :disabled="draftTitle.trim() === ''">
          저장하기
        </BaseButton>
      </form>

      <div class="footer">
        <BaseButton variant="ghost" @click="emit('close')">닫기</BaseButton>
      </div>
    </BaseCard>
  </QDialog>
</template>

<script setup lang="ts">
import { QDialog } from 'quasar'
import { computed, ref, watch } from 'vue'
import type { Task, TimeBlock, WeeklyGoal } from '../../../entities/types'
import BaseButton from '../../../shared/ui/BaseButton.vue'
import BaseCard from '../../../shared/ui/BaseCard.vue'
import {
  ceilTo15Min,
  formatHHMM,
  formatMinutesKo,
  isoAt,
  minutesBetween,
  minutesOfDay,
  useNow,
} from '../../../shared/lib/time'

// 블록 클릭 패널 — 지난 블록은 어떻게 됐는지 기록하고("기록할까요?"), 앞으로 할 블록은 내용을 편집한다.
// 상태 변경은 페이지가 한다(이 컴포넌트는 결과만 올려보낸다).
const props = defineProps<{
  task: Task | null
  phase: 'past' | 'current' | 'future'
  candidateGoals: WeeklyGoal[]
}>()

const emit = defineEmits<{
  close: []
  complete: [actualBlock: TimeBlock]
  carry: []
  drop: []
  save: [patch: { title: string; estimatedMin: number; weeklyGoalId: string | null }]
}>()

const now = useNow()
const MINUTE_OPTIONS = Array.from({ length: 32 }, (_, i) => (i + 1) * 15) // 15분 ~ 8시간

function range(block: TimeBlock): string {
  return `${formatHHMM(block.start)}–${formatHHMM(block.end)} (${formatMinutesKo(minutesBetween(block.start, block.end))})`
}

const dateKey = computed(() => props.task?.plannedBlock?.start.slice(0, 10) ?? '')
function label(min: number): string {
  return formatHHMM(isoAt(dateKey.value, min))
}

// ---------- 기록할까요? ----------
function completeAsPlanned() {
  const planned = props.task?.plannedBlock
  if (!planned) return
  if (props.phase === 'current') {
    // 진행 중에 끝냈다면 끝 시각은 지금(15분 단위로 올림). 최소 15분
    const start = minutesOfDay(planned.start)
    const end = Math.max(start + 15, ceilTo15Min(minutesOfDay(now.value)))
    emit('complete', { start: planned.start, end: isoAt(dateKey.value, end) })
    return
  }
  emit('complete', { ...planned })
}

const editingTime = ref(false)
const startMin = ref(0)
const endMin = ref(0)

// 시각 선택지 — 계획 앞뒤 3시간, 15분 단위(CLAUDE.md 5절)
const windowStart = computed(() => {
  const planned = props.task?.plannedBlock
  return planned ? Math.max(0, minutesOfDay(planned.start) - 180) : 0
})
const windowEnd = computed(() => {
  const planned = props.task?.plannedBlock
  return planned ? Math.min(24 * 60, minutesOfDay(planned.end) + 180) : 24 * 60
})
const startOptions = computed(() => steps(windowStart.value, windowEnd.value - 15))
const endOptions = computed(() => steps(startMin.value + 15, windowEnd.value))
function steps(from: number, to: number): number[] {
  const out: number[] = []
  for (let m = Math.ceil(from / 15) * 15; m <= to; m += 15) out.push(m)
  return out
}

function startEditingTime() {
  const block = props.task?.actualBlock ?? props.task?.plannedBlock
  if (!block) return
  startMin.value = minutesOfDay(block.start)
  endMin.value = minutesOfDay(block.end)
  editingTime.value = true
}

watch(startMin, (start) => {
  if (endMin.value <= start) endMin.value = start + 15
})

function completeWithEditedTime() {
  emit('complete', { start: isoAt(dateKey.value, startMin.value), end: isoAt(dateKey.value, endMin.value) })
}

// ---------- 내용 편집 ----------
const draftTitle = ref('')
const draftMin = ref(15)
const draftGoalId = ref<string | null>(null)

watch(
  () => props.task,
  (task) => {
    editingTime.value = false
    if (!task) return
    draftTitle.value = task.title
    draftMin.value = task.estimatedMin
    draftGoalId.value = task.weeklyGoalId
  },
  { immediate: true },
)

function save() {
  emit('save', {
    title: draftTitle.value.trim(),
    estimatedMin: draftMin.value,
    weeklyGoalId: draftGoalId.value,
  })
}
</script>

<style scoped>
.dialog {
  width: 380px;
  max-width: calc(100vw - 32px);
}
h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.4;
}
.meta {
  margin: 6px 0 20px;
  font-size: 13px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.choices,
.time-edit,
.edit {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.choices :deep(.base-btn.is-ghost) {
  background: var(--surface-sunken);
  color: var(--text-primary);
}
label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-secondary);
}
.field {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-ctrl);
  background: var(--surface-card);
  font-family: inherit;
  font-size: 14px;
  color: var(--text-primary);
}
.field:focus-visible {
  outline: 2px solid var(--rose-500);
  outline-offset: 2px;
}
.note {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-muted);
}
.footer {
  display: flex;
  justify-content: flex-start;
  margin-top: 16px;
}
</style>
