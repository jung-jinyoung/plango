<template>
  <div class="goal-panel">
    <div class="panel-head">
      <h2>{{ title }}</h2>
      <button type="button" class="add-btn" @click="$emit('add')">+ 목표 추가</button>
    </div>
    <div class="list">
      <GoalCard v-for="goal in goals" :key="goal.id" :goal="goal" @select="$emit('select', goal.id)" />
      <p v-if="goals.length === 0" class="empty">아직 등록된 목표가 없어요.</p>
    </div>
  </div>
</template>

<script setup>
import GoalCard from './GoalCard.vue'

defineProps({
  title: { type: String, required: true },
  goals: { type: Array, required: true },
})
defineEmits(['select', 'add'])
</script>

<style scoped>
.goal-panel {
  width: 100%;
}
.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
h2 {
  font-size: 1.02rem;
  font-weight: 700;
  margin: 0;
}
.add-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-lavender);
  font-size: 0.82rem;
  font-weight: 600;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.empty {
  color: var(--p-ink-faint);
  font-size: 0.85rem;
}
</style>
