<template>
  <span class="dot" :style="{ background: `var(--cat-${color})` }" />
</template>

<script setup lang="ts">
import type { CategoryColor } from '../../entities/types'

defineProps<{
  color: CategoryColor
}>()
</script>

<style scoped>
/* 리스트 항목에서 좌측 보더 대신 쓰는 용도 — CLAUDE.md 7절 "카드·블록 스타일" */
.dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: var(--radius-pill);
  flex: none;
}
</style>
