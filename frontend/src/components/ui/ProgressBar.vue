<template>
  <div
    class="progress"
    :class="`is-${color}`"
    :aria-valuenow="value"
    aria-valuemin="0"
    aria-valuemax="100"
    role="progressbar"
  >
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
  background: color-mix(in srgb, var(--track-tint, var(--p-rose)) 12%, var(--p-surface));
  box-shadow: var(--p-shadow-sunken);
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: 999px;
  transition: width 250ms ease;
}
.progress.is-rose {
  --track-tint: var(--p-rose);
}
.progress.is-green {
  --track-tint: var(--p-green);
}
.progress.is-blue {
  --track-tint: var(--p-blue);
}
.progress.is-lavender {
  --track-tint: var(--p-lavender);
}
.progress.is-amber {
  --track-tint: var(--p-amber);
}
.progress.is-teal {
  --track-tint: var(--p-teal);
}
.progress.is-plum {
  --track-tint: var(--p-plum);
}
.progress.is-slate {
  --track-tint: var(--p-slate);
}
.fill.is-rose {
  background: linear-gradient(90deg, var(--p-rose), var(--p-rose-ink));
}
.fill.is-green {
  background: linear-gradient(90deg, var(--p-green), var(--p-green-ink));
}
.fill.is-blue {
  background: linear-gradient(90deg, var(--p-blue), var(--p-blue-ink));
}
.fill.is-lavender {
  background: linear-gradient(90deg, var(--p-lavender), var(--p-lavender-ink));
}
.fill.is-amber {
  background: linear-gradient(90deg, var(--p-amber), var(--p-amber-ink));
}
.fill.is-teal {
  background: linear-gradient(90deg, var(--p-teal), var(--p-teal-ink));
}
.fill.is-plum {
  background: linear-gradient(90deg, var(--p-plum), var(--p-plum-ink));
}
.fill.is-slate {
  background: linear-gradient(90deg, var(--p-slate), var(--p-slate-ink));
}
.label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--p-ink-faint);
  font-variant-numeric: tabular-nums;
}
</style>
