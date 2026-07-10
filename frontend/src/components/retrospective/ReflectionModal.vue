<template>
  <BaseModal :model-value="modelValue" title="오늘 회고 작성" width="480px" @update:model-value="$emit('update:modelValue', $event)">
    <div class="reflection">
      <label :for="`reflect-${dateISO}`" class="label">오늘 한 줄 회고</label>
      <textarea
        :id="`reflect-${dateISO}`"
        v-model="text"
        class="input neu-sunken"
        rows="6"
        placeholder="오늘 하루는 어땠나요?"
      />
    </div>

    <template #actions>
      <BaseButton variant="secondary" @click="close">취소</BaseButton>
      <BaseButton variant="primary" @click="submit">등록</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useRetrospectiveStore } from '@/stores/retrospective'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  dateISO: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const retrospectiveStore = useRetrospectiveStore()
const text = ref('')

watch(
  () => props.modelValue,
  (open) => {
    if (open) text.value = retrospectiveStore.reflectionsByDate[props.dateISO] || ''
  },
)

function close() {
  emit('update:modelValue', false)
}
function submit() {
  retrospectiveStore.setReflection(props.dateISO, text.value)
  emit('update:modelValue', false)
  router.push('/app/retrospective/weekly')
}
</script>

<style scoped>
.reflection {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--p-ink-muted);
}
.input {
  border: none;
  padding: 14px 16px;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--p-ink);
  resize: vertical;
  line-height: 1.6;
  width: 100%;
}
.input::placeholder {
  color: var(--p-ink-faint);
}
</style>
