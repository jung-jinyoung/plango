<template>
  <div class="summary-card neu-raised">
    <div v-if="loading" class="loading">
      <span class="spinner" aria-hidden="true" />
      <p>AI가 분석하고 있어요…</p>
    </div>
    <div v-else class="content">
      <CompletionDonutChart :value="completionRate" :color="color" />
      <div class="text">
        <span class="badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>
          AI 요약
        </span>
        <p class="summary">{{ summary }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import CompletionDonutChart from './CompletionDonutChart.vue'

defineProps({
  loading: { type: Boolean, default: false },
  summary: { type: String, default: '' },
  completionRate: { type: Number, default: 0 },
  color: { type: String, default: 'rose' },
})
</script>

<style scoped>
.summary-card {
  padding: 28px;
}
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 24px 0;
  color: var(--p-ink-muted);
}
.spinner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid color-mix(in srgb, var(--p-lavender) 25%, transparent);
  border-top-color: var(--p-lavender);
  animation: spin 700ms linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.content {
  display: flex;
  align-items: center;
  gap: 28px;
}
.text {
  flex: 1;
  min-width: 0;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(145deg, var(--p-lavender), #4b3b8c);
  padding: 4px 10px;
  border-radius: 999px;
  margin-bottom: 10px;
}
.summary {
  font-size: 0.98rem;
  color: var(--p-ink);
  line-height: 1.7;
  margin: 0;
}

@media (max-width: 640px) {
  .content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
