<template>
  <div class="intake-form">
    <label class="field">
      <span class="label">무슨 목표예요?</span>
      <input v-model="title" type="text" class="input" placeholder="논문 초고 완성" />
    </label>

    <div class="field">
      <span class="label">어떤 분류예요?</span>
      <div class="categories">
        <button
          v-for="cat in props.categories"
          :key="cat.id"
          type="button"
          class="cat-pick"
          :class="{ active: categoryId === cat.id }"
          @click="categoryId = cat.id"
        >
          <Dot :color="cat.color" />
          {{ cat.name }}
        </button>
      </div>
    </div>

    <div class="field">
      <span class="label">이번 달에 몇 시간 정도 쓸 수 있어요?</span>
      <BaseStepper v-model="baselineHours" :min="4" :max="80" :step="2" unit="h" />
    </div>

    <BaseButton variant="primary" :disabled="!canSubmit" @click="submit">다음</BaseButton>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '../../../shared/ui/BaseButton.vue'
import BaseStepper from '../../../shared/ui/BaseStepper.vue'
import Dot from '../../../shared/ui/Dot.vue'
import type { Category } from '../../../entities/types'

const props = defineProps<{
  categories: Category[]
}>()

const emit = defineEmits<{
  submit: [value: { title: string; categoryId: string; baselineHours: number }]
}>()

const title = ref('')
const categoryId = ref<string | null>(null)
const baselineHours = ref(20)

const canSubmit = computed(() => title.value.trim().length > 0 && categoryId.value !== null)

function submit() {
  if (!canSubmit.value || categoryId.value === null) return
  emit('submit', { title: title.value.trim(), categoryId: categoryId.value, baselineHours: baselineHours.value })
}
</script>

<style scoped>
.intake-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.label {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-secondary);
}
.input {
  width: 100%;
  padding: 13px 14px;
  border-radius: var(--radius-ctrl);
  border: none;
  background: var(--surface-sunken);
  font-size: 15px;
  font-family: inherit;
  color: var(--text-primary);
}
.input:focus-visible {
  outline: 2px solid var(--rose-500);
  outline-offset: 2px;
}
.categories {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.cat-pick {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  border-radius: var(--radius-pill);
  background: var(--surface-sunken);
  color: var(--text-secondary);
  font-size: 13.5px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
.cat-pick.active {
  background: var(--surface-card);
  color: var(--text-primary);
  box-shadow: 0 0 0 2px var(--rose-500) inset;
}
.cat-pick:focus-visible {
  outline: 2px solid var(--rose-500);
  outline-offset: 2px;
}
</style>
