<template>
  <BaseModal
    :model-value="modelValue"
    variant="modal"
    title="카테고리 관리"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="category-list">
      <div v-for="category in categoryStore.activeCategories" :key="category.color" class="category-row">
        <span class="dot" :class="`is-${category.color}`" aria-hidden="true" />
        <BaseInput
          class="name-input"
          :model-value="category.name"
          placeholder="카테고리 이름"
          @update:model-value="categoryStore.rename(category.color, $event)"
        />
        <button
          type="button"
          class="delete-btn"
          aria-label="카테고리 삭제"
          :disabled="categoryStore.activeCategories.length <= 1"
          @click="categoryStore.setActive(category.color, false)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
          </svg>
        </button>
      </div>
    </div>

    <button type="button" class="add-btn" :disabled="!hasInactive" @click="addBack">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg>
      카테고리 추가
    </button>
    <p v-if="!hasInactive" class="hint">Plango는 8가지 고정 색상만 지원해요. 더 추가하려면 먼저 하나를 삭제하세요.</p>

    <template #actions>
      <BaseButton variant="primary" @click="$emit('update:modelValue', false)">완료</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useCategoryStore } from '@/stores/categories'

defineProps({
  modelValue: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])

const categoryStore = useCategoryStore()

const hasInactive = computed(() => categoryStore.categories.some((c) => !c.active))

function addBack() {
  const next = categoryStore.categories.find((c) => !c.active)
  if (next) categoryStore.setActive(next.color, true)
}
</script>

<style scoped>
.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.category-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--dot-color, var(--p-rose));
}
.dot.is-rose {
  --dot-color: var(--p-rose);
}
.dot.is-blue {
  --dot-color: var(--p-blue);
}
.dot.is-green {
  --dot-color: var(--p-green);
}
.dot.is-lavender {
  --dot-color: var(--p-lavender);
}
.dot.is-amber {
  --dot-color: var(--p-amber);
}
.dot.is-teal {
  --dot-color: var(--p-teal);
}
.dot.is-plum {
  --dot-color: var(--p-plum);
}
.dot.is-slate {
  --dot-color: var(--p-slate);
}
.name-input {
  flex: 1;
}
.delete-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-ink-faint);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.delete-btn:hover:not(:disabled) {
  color: var(--p-rose-ink);
}
.delete-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.add-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-lavender);
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 4px;
  margin-top: 16px;
}
.add-btn:disabled {
  color: var(--p-ink-faint);
  cursor: not-allowed;
}
.hint {
  font-size: 0.78rem;
  color: var(--p-ink-faint);
  margin: 0;
  line-height: 1.6;
}
</style>
