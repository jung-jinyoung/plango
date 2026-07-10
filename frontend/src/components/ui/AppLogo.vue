<template>
  <span class="app-logo">
    <span class="app-logo-mark" :style="markStyle" aria-hidden="true">
      <img :src="flamingoMark" alt="" />
    </span>
    <span v-if="withText" class="app-logo-text">Plango</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import flamingoMark from '@/assets/branding/flamingo-mark.png'

const props = defineProps({
  size: {
    type: Number,
    default: 34,
  },
  withText: {
    type: Boolean,
    default: true,
  },
  bg: {
    type: String,
    default: 'surface',
    validator: (v) => ['surface', 'bg'].includes(v),
  },
})

const markStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  borderRadius: `${Math.round(props.size * 0.35)}px`,
  background: `var(--p-${props.bg})`,
  padding: `${Math.round(props.size * 0.15)}px`,
}))
</script>

<style scoped>
.app-logo {
  display: contents;
}
.app-logo-mark {
  flex-shrink: 0;
  box-shadow: var(--p-shadow-raised-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.app-logo-mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
