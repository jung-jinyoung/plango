<!-- 임시 파일 — ComponentGallery.vue 전용 헬퍼, 병합 후 함께 삭제 -->
<template>
  <div class="swatch">
    <span class="box" :style="{ background: hex }" />
    <span class="label">{{ hex }}<br /><em>{{ label }}</em></span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hex: string
  label: string
}>()
</script>

<style scoped>
.swatch {
  display: flex;
  align-items: center;
  gap: 8px;
}
.box {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  flex: none;
}
.label {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
}
.label em {
  font-style: normal;
}
</style>
