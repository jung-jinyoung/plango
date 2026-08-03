<template>
  <div class="timeline" :style="{ height: `${totalHeight}px` }">
    <div
      v-for="hour in hourMarks"
      :key="hour"
      class="hour-line"
      :style="{ top: `${(hour - startHour) * pxPerHour}px` }"
    >
      <span class="hour-label">{{ String(hour).padStart(2, '0') }}:00</span>
    </div>

    <template v-for="item in items" :key="item.task.id">
      <!-- 단일 블록: 계획만 있거나(아직 실행 전), 계획·실제 차이가 15분 미만이라 병합된 경우 -->
      <div
        v-if="item.kind === 'single'"
        class="block"
        :class="{ 'is-dragging': activeDrag?.taskId === item.task.id }"
        :style="[blockStyle(item.layout, item), dragTransform(item)]"
        @pointerdown="onPointerDown($event, item)"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
      >
        <b>{{ item.task.title }}</b>
      </div>

      <!-- 계획·실제가 15분 이상 어긋나면 목업 그대로 나란히(고스트 38% + 실제 나머지) -->
      <div
        v-else
        class="lane"
        :style="{ top: `${item.lane.top}px`, height: `${item.lane.height}px` }"
      >
        <!-- 계획(ghost)은 확정 후 잠기는 비교 기준선이라 드래그 핸들러를 붙이지 않는다(R2) -->
        <div
          class="ghost"
          :style="{ height: `${item.ghost.height}px`, marginTop: `${item.ghost.top - item.lane.top}px` }"
        >
          <b>계획</b>
        </div>
        <div
          class="real"
          :class="{ 'is-dragging': activeDrag?.taskId === item.task.id }"
          :style="[
            {
              height: `${item.real.height}px`,
              marginTop: `${item.real.top - item.lane.top}px`,
              ...blockStyle(null, item),
            },
            dragTransform(item),
          ]"
          @pointerdown="onPointerDown($event, item)"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerCancel"
        >
          <b>{{ item.task.title }}</b>
          <span class="delta">+{{ item.deltaMin }}분</span>
        </div>
      </div>
    </template>

    <CurrentTimeBar :start-hour="startHour" :px-per-hour="pxPerHour" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { actualMin, resolveDragTarget, shouldShowGhost } from '../../../entities/derive'
import { addMinutes, isoAt, minutesBetween, useNow } from '../../../shared/lib/time'
import type { CategoryColor, Task, TimeBlock } from '../../../entities/types'
import { layoutTimelineBlock, pxToMinutesOfDay, type TimelineLayout } from '../lib/layoutTimelineBlock'
import CurrentTimeBar from './CurrentTimeBar.vue'

// 색은 이미 페이지 레벨에서 resolveCategory로 정해져 들어온다 —
// 이 컴포넌트는 좌표 계산과 렌더만 하고 색·목표 조회는 다시 하지 않는다.
export interface TimelineTaskInput {
  task: Task
  color: CategoryColor
}

const props = defineProps<{
  tasks: TimelineTaskInput[]
  startHour: number
  endHour: number
  pxPerHour: number
}>()

const hourMarks = computed(() => {
  const marks: number[] = []
  for (let h = props.startHour; h <= props.endHour; h++) marks.push(h)
  return marks
})

const totalHeight = computed(() => (props.endHour - props.startHour) * props.pxPerHour)

interface SingleItem {
  kind: 'single'
  task: Task
  color: CategoryColor
  layout: TimelineLayout
}

interface PairItem {
  kind: 'pair'
  task: Task
  color: CategoryColor
  lane: TimelineLayout
  ghost: TimelineLayout
  real: TimelineLayout
  deltaMin: number
}

type TimelineItem = SingleItem | PairItem

const items = computed<TimelineItem[]>(() =>
  props.tasks
    .map(({ task, color }): TimelineItem | null => {
      const plannedLayout = task.plannedBlock
        ? layoutTimelineBlock(task.plannedBlock, props.startHour, props.pxPerHour)
        : null
      const actualLayout = task.actualBlock
        ? layoutTimelineBlock(task.actualBlock, props.startHour, props.pxPerHour)
        : null

      if (actualLayout && plannedLayout && shouldShowGhost(task)) {
        const laneTop = Math.min(plannedLayout.top, actualLayout.top)
        const laneBottom = Math.max(
          plannedLayout.top + plannedLayout.height,
          actualLayout.top + actualLayout.height,
        )
        const plannedMin = minutesBetween(task.plannedBlock!.start, task.plannedBlock!.end)
        return {
          kind: 'pair',
          task,
          color,
          lane: { top: laneTop, height: laneBottom - laneTop },
          ghost: plannedLayout,
          real: actualLayout,
          deltaMin: Math.abs(actualMin(task) - plannedMin),
        }
      }

      const layout = actualLayout ?? plannedLayout
      if (!layout) return null
      return { kind: 'single', task, color, layout }
    })
    .filter((item): item is TimelineItem => item !== null),
)

/** 약속은 카테고리와 무관하게 항상 중립색 — CLAUDE.md 7절.
 * single일 땐 layout의 top/height도 같이 반환하고, pair(real)일 땐 top/height는
 * 바깥 :style에서 이미 처리하므로 색만 반환한다(layout 인자를 null로 넘긴다). */
function blockStyle(layout: TimelineLayout | null, item: { task: Task; color: CategoryColor }) {
  const pos = layout ? { top: `${layout.top}px`, height: `${layout.height}px` } : {}
  if (item.task.weeklyGoalId === null) {
    return { ...pos, background: 'var(--surface-sunken)', color: 'var(--text-secondary)' }
  }
  return {
    ...pos,
    background: `var(--cat-${item.color}-tint)`,
    color: `var(--cat-${item.color}-deep)`,
  }
}

// 드래그로 블록 시간을 조정한다(R2·R3). 실제 store 변경은 emit으로 위임하고
// (features/schedule은 store를 모른다, CLAUDE.md 6절) 여기선 좌표↔시각 변환과
// R2·R3 판정(resolveDragTarget)만 담당한다.
const emit = defineEmits<{
  'drag-block': [taskId: string, field: 'plannedBlock' | 'actualBlock', block: TimeBlock]
}>()

const now = useNow()

interface ActiveDrag {
  taskId: string
  pointerId: number
  startClientY: number
  originalTop: number
  durationMin: number
  dateKey: string
}

const activeDrag = ref<ActiveDrag | null>(null)
const previewOffsetPx = ref(0)

const SNAP_MIN = 15
function snap(min: number): number {
  return Math.round(min / SNAP_MIN) * SNAP_MIN
}

function dragTransform(item: TimelineItem) {
  if (activeDrag.value?.taskId !== item.task.id) return {}
  return { transform: `translateY(${previewOffsetPx.value}px)`, zIndex: 20 }
}

function onPointerDown(event: PointerEvent, item: TimelineItem) {
  const block = item.task.actualBlock ?? item.task.plannedBlock
  if (!block) return
  const layout = item.kind === 'single' ? item.layout : item.real
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
  activeDrag.value = {
    taskId: item.task.id,
    pointerId: event.pointerId,
    startClientY: event.clientY,
    originalTop: layout.top,
    durationMin: minutesBetween(block.start, block.end),
    dateKey: block.start.slice(0, 10),
  }
  previewOffsetPx.value = 0
}

function onPointerMove(event: PointerEvent) {
  if (!activeDrag.value || event.pointerId !== activeDrag.value.pointerId) return
  previewOffsetPx.value = event.clientY - activeDrag.value.startClientY
}

function onPointerCancel(event: PointerEvent) {
  if (!activeDrag.value || event.pointerId !== activeDrag.value.pointerId) return
  activeDrag.value = null
  previewOffsetPx.value = 0
}

function onPointerUp(event: PointerEvent) {
  const drag = activeDrag.value
  if (!drag || event.pointerId !== drag.pointerId) return

  const newTop = drag.originalTop + previewOffsetPx.value
  const newStartMin = snap(pxToMinutesOfDay(newTop, props.startHour, props.pxPerHour))
  const newStartIso = isoAt(drag.dateKey, newStartMin)
  const task = props.tasks.find((t) => t.task.id === drag.taskId)?.task

  activeDrag.value = null
  previewOffsetPx.value = 0
  if (!task) return

  const field = resolveDragTarget(task, newStartIso, now.value)
  if (!field) return // 확정된 미래 계획을 옮기려는 시도 — 취소(R2)

  emit('drag-block', task.id, field, {
    start: newStartIso,
    end: addMinutes(newStartIso, drag.durationMin),
  })
}
</script>

<style scoped>
.timeline {
  position: relative;
}
.hour-line {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px solid var(--border);
}
.hour-label {
  position: absolute;
  left: 0;
  top: -8px;
  font-size: 11.5px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.block {
  position: absolute;
  left: 56px;
  right: 8px;
  border-radius: var(--radius-block);
  padding: 6px 10px;
  overflow: hidden;
  font-size: 13px;
  cursor: grab;
  touch-action: none;
}
.block b {
  display: block;
  font-weight: 600;
  line-height: 1.35;
}

/* 대기 상태엔 그림자 없음(CLAUDE.md 13절) — 드래그 중에만 --elev-drag를 쓴다 */
.block.is-dragging,
.real.is-dragging {
  cursor: grabbing;
  box-shadow: var(--elev-drag);
}

/* 계획·실제 나란히(목업 .pair 그대로 포팅) */
.lane {
  position: absolute;
  left: 56px;
  right: 8px;
  display: flex;
  gap: 6px;
}
.ghost {
  width: 38%;
  flex: none;
  border: 1px dashed var(--text-muted);
  border-radius: var(--radius-block);
  background: transparent;
  padding: 6px 8px;
  color: var(--text-muted);
  overflow: hidden;
}
.ghost b {
  font-weight: 500;
  font-size: 11.5px;
}
.real {
  flex: 1;
  position: relative;
  border-radius: var(--radius-block);
  padding: 6px 10px;
  overflow: hidden;
  font-size: 13px;
  cursor: grab;
  touch-action: none;
}
.real b {
  display: block;
  font-weight: 600;
  line-height: 1.35;
}
.delta {
  font-size: 11px;
  font-weight: 600;
  margin-top: 2px;
  display: inline-block;
}
</style>
