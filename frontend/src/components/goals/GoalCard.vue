<template>
  <button
    type="button"
    class="goal-card neu-raised neu-interactive"
    :class="`is-${goal.color}`"
    @click="$emit('select', goal.id)"
  >
    <span class="tag">{{ goal.taskCount }}개 태스크</span>
    <h3>{{ goal.title }}</h3>
    <ProgressBar :value="goal.progress" :color="goal.color" show-label />
    <p class="meta">{{ goal.doneCount }}/{{ goal.taskCount }} 완료</p>
  </button>
</template>

<script setup>
import ProgressBar from '@/components/ui/ProgressBar.vue'

defineProps({
  goal: { type: Object, required: true }, // { id, title, progress, color, taskCount, doneCount }
})
defineEmits(['select'])
</script>

<style scoped>
.goal-card {
  padding: 16px;
  display: block;
  width: 100%;
  border: none;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
}
.tag {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  margin-bottom: 10px;
  color: var(--tag-ink, var(--p-rose-ink));
  background: color-mix(in srgb, var(--tag-color, var(--p-rose)) 16%, var(--p-surface));
}
.goal-card.is-rose {
  --tag-color: var(--p-rose);
  --tag-ink: var(--p-rose-ink);
}
.goal-card.is-blue {
  --tag-color: var(--p-blue);
  --tag-ink: #1d4ed8;
}
.goal-card.is-green {
  --tag-color: var(--p-green);
  --tag-ink: var(--p-green-ink);
}
.goal-card.is-lavender {
  --tag-color: var(--p-lavender);
  --tag-ink: #4b3b8c;
}
h3 {
  font-size: 0.94rem;
  font-weight: 700;
  color: var(--p-ink);
  margin: 0 0 12px;
}
.meta {
  font-size: 0.76rem;
  color: var(--p-ink-faint);
  margin: 6px 0 0;
}
</style>
