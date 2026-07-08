<template>
  <div class="rec-card" :class="`is-${recommendation.categoryColor}`">
    <div class="top">
      <span class="badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>
        AI 추천
      </span>
      <span class="time">{{ timeLabel }}</span>
    </div>
    <p class="title">{{ recommendation.title }}</p>
    <p class="reason">{{ recommendation.reason }}</p>
    <button type="button" class="exclude-btn" @click="$emit('exclude', recommendation.todoId)">
      제외하기
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { minutesToLabel } from '@/utils/date'

const props = defineProps({
  recommendation: { type: Object, required: true },
})
defineEmits(['exclude'])

const timeLabel = computed(
  () =>
    `${minutesToLabel(props.recommendation.startMinutes)}–${minutesToLabel(props.recommendation.startMinutes + props.recommendation.durationMinutes)} · ${props.recommendation.durationMinutes}분`,
)
</script>

<style scoped>
.rec-card {
  padding: 14px 16px;
  border-radius: var(--p-radius-sm);
  background: var(--p-surface);
  box-shadow: var(--p-shadow-raised-sm);
  border-left: 3px solid var(--card-accent, var(--p-lavender));
}
.rec-card.is-rose {
  --card-accent: var(--p-rose);
}
.rec-card.is-blue {
  --card-accent: var(--p-blue);
}
.rec-card.is-green {
  --card-accent: var(--p-green);
}
.rec-card.is-lavender {
  --card-accent: var(--p-lavender);
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(145deg, var(--p-lavender), #4b3b8c);
  padding: 3px 9px;
  border-radius: 999px;
}
.time {
  font-size: 0.75rem;
  color: var(--p-ink-faint);
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, 'SF Mono', monospace;
}
.title {
  font-size: 0.94rem;
  font-weight: 700;
  color: var(--p-ink);
  margin: 0 0 4px;
}
.reason {
  font-size: 0.8rem;
  color: var(--p-ink-muted);
  margin: 0 0 10px;
}
.exclude-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-ink-faint);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0;
  text-decoration: underline;
}
.exclude-btn:hover {
  color: var(--p-rose-ink);
}
</style>
