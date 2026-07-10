<template>
  <div class="progress" :aria-valuenow="value" aria-valuemin="0" aria-valuemax="100" role="progressbar">
    <div class="track">
      <div class="fill" :class="`is-${color}`" :style="{ width: `${clamped}%` }" />
    </div>
    <div v-if="showLabel" class="label">{{ clamped }}%</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  color: { type: String, default: 'rose' }, // rose | amber | green | teal | blue | lavender | plum | slate
  showLabel: { type: Boolean, default: false },
})

const clamped = computed(() => Math.min(100, Math.max(0, Math.round(props.value))))
</script>

<style scoped>
.progress {
  display: flex;
  align-items: center;
  gap: 10px;
}
.track {
  flex: 1;
  height: 9px;
  border-radius: 999px;
  background: var(--p-surface);
  box-shadow: var(--p-shadow-sunken);
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: 999px;
  transition: width 250ms ease;
}
.is-rose {
  background: linear-gradient(90deg, var(--p-rose), var(--p-rose-ink));
}
.is-green {
  background: linear-gradient(90deg, var(--p-green), var(--p-green-ink));
}
.is-blue {
  background: linear-gradient(90deg, var(--p-blue), var(--p-blue-ink));
}
.is-lavender {
  background: linear-gradient(90deg, var(--p-lavender), var(--p-lavender-ink));
}
.is-amber {
  background: linear-gradient(90deg, var(--p-amber), var(--p-amber-ink));
}
.is-teal {
  background: linear-gradient(90deg, var(--p-teal), var(--p-teal-ink));
}
.is-plum {
  background: linear-gradient(90deg, var(--p-plum), var(--p-plum-ink));
}
.is-slate {
  background: linear-gradient(90deg, var(--p-slate), var(--p-slate-ink));
}
.label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--p-ink-faint);
  font-variant-numeric: tabular-nums;
}
</style>
