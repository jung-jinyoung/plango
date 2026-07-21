<template>
  <div class="goal-panel">
    <div class="panel-head">
      <h2>{{ title }}</h2>
      <button type="button" class="add-btn" @click="$emit('add')">+ 목표 추가</button>
    </div>
    <div class="list">
      <p v-if="loading && goals.length === 0" class="empty">불러오는 중…</p>
      <p v-else-if="error" class="empty is-error">목표를 불러오지 못했어요.</p>
      <template v-else>
        <GoalCard
          v-for="goal in goals"
          :key="goal.id"
          :goal="goal"
          :selected="goal.id === selectedGoalId"
          @select="$emit('select', goal.id)"
          @details="$emit('details', goal.id)"
        />
        <p v-if="goals.length === 0" class="empty">아직 등록된 목표가 없어요.</p>
      </template>
    </div>
  </div>
</template>

<script setup>
import GoalCard from './GoalCard.vue'

defineProps({
  title: { type: String, required: true },
  goals: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
  selectedGoalId: { type: [String, Number], default: null },
})
defineEmits(['select', 'add', 'details'])
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
.empty.is-error {
  color: var(--p-rose-ink);
}
</style>
