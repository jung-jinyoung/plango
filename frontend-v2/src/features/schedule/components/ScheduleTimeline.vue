<template>
  <div class="timeline" :style="{ height: `${totalHeight}px` }">
    <div
      v-for="hour in hourMarks"
      :key="hour"
      class="hour-line"
      :style="{ top: `${(hour - startHour) * pxPerHour}px` }"
    >
      <!-- 현재 시각 바가 맨 위에 붙어 있으면(타임라인보다 이른 시각) 첫 라벨과 겹치므로 숨긴다 -->
      <span v-if="!(hour === startHour && nowBeforeStart)" class="hour-label">
        {{ String(hour).padStart(2, '0') }}:00
      </span>
    </div>

    <template v-for="item in items" :key="item.task.id">
      <!-- 단일 블록: 계획만 있거나(아직 실행 전), 계획·실제 차이가 15분 미만이라 병합된 경우 -->
      <div
        v-if="item.kind === 'single'"
        class="tl-block"
        :class="[
          `is-${item.state}`,
          {
            'is-dragging': activeDrag?.taskId === item.task.id,
            'is-compact': item.layout.height < COMPACT_BELOW_PX,
          },
        ]"
        :style="[blockStyle(item.layout, item), dragTransform(item)]"
        @pointerdown="onPointerDown($event, item)"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
      >
        <b>{{ item.task.title }}</b>
        <small>{{ item.durationLabel }}</small>
        <span v-if="STATE_LABEL[item.state]" class="state">{{ STATE_LABEL[item.state] }}</span>
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
          <small>{{ formatMinutesKo(item.plannedMin) }}</small>
        </div>
        <div
          class="real"
          :class="{
            'is-dragging': activeDrag?.taskId === item.task.id,
            'is-compact': item.real.height < COMPACT_BELOW_PX,
          }"
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
          <small>{{ formatMinutesKo(actualMin(item.task)) }}</small>
          <span class="delta">+{{ item.deltaMin }}분</span>
        </div>
      </div>
    </template>

    <CurrentTimeBar :start-hour="startHour" :px-per-hour="pxPerHour" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  actualMin,
  hasScheduleConflict,
  needsCheck,
  resolveDragTarget,
  shouldShowGhost,
} from '../../../entities/derive'
import {
  addMinutes,
  formatMinutesKo,
  isoAt,
  minutesBetween,
  minutesOfDay,
  useNow,
} from '../../../shared/lib/time'
import type { CategoryColor, Task, TimeBlock } from '../../../entities/types'
import { layoutTimelineBlock, pxToMinutesOfDay, type TimelineLayout } from '../lib/layoutTimelineBlock'
import CurrentTimeBar from './CurrentTimeBar.vue'

// 색은 이미 페이지 레벨에서 resolveCategory로 정해져 들어온다 —
// 이 컴포넌트는 좌표 계산과 렌더만 하고 색·목표 조회는 다시 하지 않는다.
export interface TimelineTaskInput {
  task: Task
  color: CategoryColor
}

const now = useNow()

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

const nowBeforeStart = computed(() => minutesOfDay(now.value) < props.startHour * 60)

const totalHeight = computed(() => (props.endHour - props.startHour) * props.pxPerHour)

interface SingleItem {
  kind: 'single'
  task: Task
  color: CategoryColor
  layout: TimelineLayout
  // 실측이 있으면 실제 시간, 아직 실행 전이면 계획 길이 + "예상" (목업 01)
  durationLabel: string
  state: BlockState
}

// 지난 계획 중 기록이 없는 것(기록할까요?)과 정리된 것(옮김·안 함)을 앞으로 할 계획과 구분한다.
// 실패 언어·경고색은 쓰지 않는다(CLAUDE.md 8절) — 점선(원래 계획과 같은 표기)과 중립 톤뿐이다.
type BlockState = 'normal' | 'needs-check' | 'carried' | 'dropped'
const STATE_LABEL: Record<BlockState, string> = {
  normal: '',
  'needs-check': '기록할까요?',
  carried: '다음으로 옮김',
  dropped: '이번엔 안 함',
}

function blockState(task: Task): BlockState {
  if (task.status === 'carried' || task.status === 'dropped') return task.status
  return needsCheck(task, now.value) ? 'needs-check' : 'normal'
}

interface PairItem {
  kind: 'pair'
  task: Task
  color: CategoryColor
  lane: TimelineLayout
  ghost: TimelineLayout
  real: TimelineLayout
  plannedMin: number
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
          plannedMin,
          deltaMin: Math.abs(actualMin(task) - plannedMin),
        }
      }

      const layout = actualLayout ?? plannedLayout
      if (!layout) return null
      const durationLabel = task.actualBlock
        ? formatMinutesKo(actualMin(task))
        : `${formatMinutesKo(minutesBetween(task.plannedBlock!.start, task.plannedBlock!.end))} 예상`
      return { kind: 'single', task, color, layout, durationLabel, state: blockState(task) }
    })
    .filter((item): item is TimelineItem => item !== null),
)

/** 약속은 카테고리와 무관하게 항상 중립색 — CLAUDE.md 7절.
 * single일 땐 layout의 top/height도 같이 반환하고, pair(real)일 땐 top/height는
 * 바깥 :style에서 이미 처리하므로 색만 반환한다(layout 인자를 null로 넘긴다). */
function blockStyle(
  layout: TimelineLayout | null,
  item: { task: Task; color: CategoryColor; state?: BlockState },
) {
  const pos = layout ? { top: `${layout.top}px`, height: `${layout.height}px` } : {}
  if (item.state === 'needs-check') {
    return { ...pos, background: 'transparent', color: 'var(--text-secondary)' }
  }
  if (item.state === 'carried' || item.state === 'dropped') {
    return { ...pos, background: 'var(--surface-sunken)', color: 'var(--text-muted)' }
  }
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
  // 움직이지 않고 눌렀다 뗀 경우 — 페이지가 편집·완료 확인 패널을 연다
  'select-block': [taskId: string]
}>()

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
// 이보다 낮은 블록(64px/시간 기준 약 37분 미만)은 제목·시간을 한 줄로 줄인다
const COMPACT_BELOW_PX = 40
const CLICK_TOLERANCE_PX = 4
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

  // 거의 움직이지 않았으면 드래그가 아니라 클릭이다
  if (Math.abs(previewOffsetPx.value) < CLICK_TOLERANCE_PX) {
    activeDrag.value = null
    previewOffsetPx.value = 0
    emit('select-block', drag.taskId)
    return
  }

  const newTop = drag.originalTop + previewOffsetPx.value
  const newStartMin = snap(pxToMinutesOfDay(newTop, props.startHour, props.pxPerHour))
  const newStartIso = isoAt(drag.dateKey, newStartMin)
  const task = props.tasks.find((t) => t.task.id === drag.taskId)?.task

  activeDrag.value = null
  previewOffsetPx.value = 0
  if (!task) return

  const field = resolveDragTarget(task, newStartIso, now.value)
  if (!field) return // 확정된 미래 계획을 옮기려는 시도 — 취소(R2)

  const newBlock: TimeBlock = { start: newStartIso, end: addMinutes(newStartIso, drag.durationMin) }
  if (hasScheduleConflict(newBlock, task.id, props.tasks.map((t) => t.task))) return // 다른 일정과 겹침 — 취소

  emit('drag-block', task.id, field, newBlock)
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
.tl-block {
  position: absolute;
  left: 56px;
  right: 8px;
  /* 15분 블록도 읽히도록(CLAUDE.md 7절 밀도 표: 최소 높이 22px) */
  min-height: 22px;
  border-radius: var(--radius-block);
  padding: 6px 10px;
  overflow: hidden;
  font-size: 13px;
  cursor: grab;
  touch-action: none;
}
/* 짧은 블록 — 제목과 시간을 한 줄로, 넘치는 제목은 말줄임 */
.tl-block.is-compact,
.real.is-compact {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 0;
  padding-bottom: 0;
  min-height: 22px;
}
.is-compact b {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12.5px;
}
.is-compact small,
.is-compact .delta {
  flex: none;
  margin-top: 0;
  white-space: nowrap;
}
.is-compact .state {
  top: 50%;
  transform: translateY(-50%);
}
/* 기록할까요? — 원래 계획(고스트)과 같은 점선 표기. 전면 보더(CLAUDE.md 7절) */
.tl-block.is-needs-check {
  border: 1.5px dashed var(--text-muted);
}
/* 짧은 블록에서도 잘리지 않게 제목 줄 오른쪽 위에 둔다 */
.state {
  position: absolute;
  top: 6px;
  right: 8px;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  background: var(--surface-sunken);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}
.tl-block.is-carried .state,
.tl-block.is-dropped .state {
  background: var(--surface-card);
}
.tl-block b {
  display: block;
  font-weight: 600;
  line-height: 1.35;
}

/* 대기 상태엔 그림자 없음(CLAUDE.md 13절) — 드래그 중에만 --elev-drag를 쓴다 */
.tl-block.is-dragging,
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
  display: block;
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
.tl-block small,
.real small,
.ghost small {
  display: block;
  font-size: 11.5px;
  opacity: 0.72;
  font-variant-numeric: tabular-nums;
}
.delta {
  font-size: 11px;
  font-weight: 600;
  margin-top: 2px;
  display: inline-block;
}
</style>
