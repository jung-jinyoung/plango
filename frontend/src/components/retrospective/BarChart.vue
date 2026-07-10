<template>
  <div class="bar-chart">
    <div v-for="bar in bars" :key="bar.label" class="bar-col">
      <span v-if="showValues" class="value">{{ bar.value }}%</span>
      <div class="track">
        <div class="fill" :class="`is-${bar.color}`" :style="{ height: `${bar.value}%` }" />
      </div>
      <span class="label">{{ bar.label }}</span>
      <span v-if="bar.sublabel" class="sublabel">{{ bar.sublabel }}</span>
    </div>
    <p v-if="bars.length === 0" class="empty">데이터가 없어요.</p>
  </div>
</template>

<script setup>
defineProps({
  bars: { type: Array, required: true }, // [{ label, value(0-100), color, sublabel? }]
  showValues: { type: Boolean, default: true },
})
</script>

<style scoped>
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  height: 160px;
  padding-top: 8px;
}
.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  min-width: 0;
}
.value {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--p-ink-muted);
  font-variant-numeric: tabular-nums;
  margin-bottom: 6px;
}
.track {
  flex: 1;
  width: 100%;
  max-width: 40px;
  border-radius: var(--p-radius-xs);
  background: var(--p-bg);
  box-shadow: var(--p-shadow-sunken);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.fill {
  width: 100%;
  border-radius: var(--p-radius-xs);
  transition: height 300ms ease;
}
.fill.is-rose {
  background: linear-gradient(180deg, var(--p-rose), var(--p-rose-ink));
}
.fill.is-blue {
  background: linear-gradient(180deg, var(--p-blue), var(--p-blue-ink));
}
.fill.is-green {
  background: linear-gradient(180deg, var(--p-green), var(--p-green-ink));
}
.fill.is-lavender {
  background: linear-gradient(180deg, var(--p-lavender), var(--p-lavender-ink));
}
.fill.is-amber {
  background: linear-gradient(180deg, var(--p-amber), var(--p-amber-ink));
}
.fill.is-teal {
  background: linear-gradient(180deg, var(--p-teal), var(--p-teal-ink));
}
.fill.is-plum {
  background: linear-gradient(180deg, var(--p-plum), var(--p-plum-ink));
}
.fill.is-slate {
  background: linear-gradient(180deg, var(--p-slate), var(--p-slate-ink));
}
.label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--p-ink);
  margin-top: 8px;
}
.sublabel {
  font-size: 0.7rem;
  color: var(--p-ink-faint);
  font-variant-numeric: tabular-nums;
}
.empty {
  color: var(--p-ink-faint);
  font-size: 0.85rem;
}
</style>
