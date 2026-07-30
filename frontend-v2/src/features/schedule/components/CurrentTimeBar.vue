<template>
  <div class="now-bar" :style="{ top: `${top}px` }">
    <span class="time">{{ label }}</span>
    <svg class="flamingo" width="17" height="21" viewBox="0 0 18 22" fill="none" aria-label="지금">
      <ellipse cx="8" cy="14.5" rx="6.2" ry="4.4" fill="var(--rose-500)" />
      <path
        d="M12 12.4C15.2 9.6 15 5 11.6 3.6"
        stroke="var(--rose-500)"
        stroke-width="2.4"
        stroke-linecap="round"
      />
      <circle cx="10.9" cy="3" r="2.1" fill="var(--rose-500)" />
      <path d="M12.6 2.1L16 3.4L12.6 4.4Z" fill="var(--rose-500)" />
      <path
        d="M6.6 18.6L7.7 20.4L6 21.9"
        stroke="var(--rose-500)"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '../../../shared/lib/time'
import { layoutTimelineBlock } from '../lib/layoutTimelineBlock'

const props = defineProps<{
  startHour: number
  pxPerHour: number
}>()

const now = useNow()

// 위치 계산은 layoutTimelineBlock 하나로 통일한다 — 여기서 분 단위 좌표 공식을 다시 안 쓴다.
const top = computed(
  () => layoutTimelineBlock({ start: now.value, end: now.value }, props.startHour, props.pxPerHour).top,
)
const label = computed(() => now.value.slice(11, 16)) // HH:MM
</script>

<style scoped>
.now-bar {
  position: absolute;
  left: 56px;
  right: 8px;
  height: 0;
  z-index: 8;
}
.now-bar::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  border-top: 2px solid var(--rose-500);
}
.flamingo {
  position: absolute;
  left: -26px;
  top: -13px;
}
.time {
  position: absolute;
  left: -56px;
  top: -9px;
  font-size: 11px;
  font-weight: 700;
  color: var(--rose-600);
  font-variant-numeric: tabular-nums;
}
</style>
