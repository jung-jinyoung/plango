<template>
  <span class="chip" :class="`is-${variant}`" :style="tintStyle">
    <Dot v-if="dot && variant === 'category'" :color="color" />
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CategoryColor } from '../../entities/types'
import Dot from './Dot.vue'

const props = withDefaults(
  defineProps<{
    /** 기본(default) / 온(category — 목표·카테고리 연결) / 시간(time) */
    variant?: 'default' | 'category' | 'time'
    /** variant="category"일 때만 사용 */
    color?: CategoryColor
    /** 앞에 카테고리 색 Dot을 붙인다 (eyebrow 패턴). variant="category"에서만 동작 */
    dot?: boolean
  }>(),
  {
    variant: 'default',
    color: 'blue',
    dot: false,
  },
)

const tintStyle = computed(() => {
  if (props.variant !== 'category') return {}
  return {
    background: `var(--cat-${props.color}-tint)`,
    color: `var(--cat-${props.color}-deep)`,
  }
})
</script>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 9px;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
}

.is-default {
  background: var(--surface-sunken);
  color: var(--text-secondary);
}

/* 시간 칩은 카테고리와 무관하게 고정 — 목업의 .chip.tm (CLAUDE.md 7절 톤과 동일 계열) */
.is-time {
  background: var(--cat-mint-tint);
  color: var(--cat-mint-deep);
}

/* .is-category는 색이 동적이라 tintStyle(인라인 스타일)로 처리 — ProgressBar와 동일 패턴 */
</style>
