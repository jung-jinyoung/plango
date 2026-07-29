<template>
  <div class="progress-bar">
    <i
      class="fill"
      :class="{ 'is-muted': muted }"
      :style="{ width: `${clamped}%`, background: `var(--cat-${color})` }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CategoryColor } from '../../entities/types'

const props = withDefaults(
  defineProps<{
    percent: number
    color: CategoryColor
    muted?: boolean
  }>(),
  {
    muted: false,
  },
)

const clamped = computed(() => Math.min(100, Math.max(0, props.percent)))
</script>

<style scoped>
/* 대기 상태 그림자 없음 — 채움만으로 진도를 표현 (CLAUDE.md 7·13절) */
.progress-bar {
  height: 6px;
  background: var(--surface-sunken);
  border-radius: 999px;
  overflow: hidden;
}

.fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s;
}

.fill.is-muted {
  opacity: 0.5;
}
</style>
