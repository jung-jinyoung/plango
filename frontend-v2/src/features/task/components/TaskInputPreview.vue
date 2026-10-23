<template>
  <div class="task-input-preview">
    <!-- 회색 박스 + placeholder만으로는 이미 채워진 칸처럼 보였다 — 흰 입력창에 전면 보더,
         포커스 링, 오른쪽 추가 버튼으로 "여기에 적는다"를 드러낸다 -->
    <div class="field" :class="{ 'has-submit': submittable }">
      <input
        v-model="text"
        type="text"
        class="input"
        :placeholder="placeholder"
        aria-label="할 일 적기"
        @keydown.enter="onEnter"
      />
      <button
        v-if="submittable"
        type="button"
        class="submit"
        :disabled="!canSubmit"
        aria-label="추가"
        @click="submit"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M13 3v5.5a2 2 0 0 1-2 2H3.5M6.5 7.5 3.5 10.5l3 3"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
    <div class="chips">
      <Chip v-if="parsed.title">{{ parsed.title }}</Chip>
      <Chip v-if="parsed.estimatedMin !== null" variant="time">{{ parsed.estimatedMin }}분</Chip>
      <Chip v-if="parsed.matchedGoalTitle" variant="category" dot># {{ parsed.matchedGoalTitle }}</Chip>
    </div>
    <p v-if="submittable" class="hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Chip from '../../../shared/ui/Chip.vue'
import { parseTaskInput, type ParsedTaskInput } from '../lib/parse'
import type { WeeklyGoal } from '../../../entities/types'

const props = defineProps<{
  candidateGoals: WeeklyGoal[]
  // 오늘 화면처럼 이 입력창에서 바로 추가할 때만 켠다. 온보딩은 자체 "할 일 추가" 버튼이 있다
  submittable?: boolean
}>()

// 카테고리 색 해석(resolveCategory)은 여기서 하지 않는다 — pages/ 레벨에서
// goalStore+taskStore를 조합해 처리한다. 이 컴포넌트는 weeklyGoalId까지만
// 알려주고 색은 모른다(features/task가 features/goal을 import하지 않도록).
const emit = defineEmits<{
  'update:parsed': [value: ParsedTaskInput]
  submit: [value: ParsedTaskInput]
}>()

const text = ref('')
const parsed = computed(() => parseTaskInput(text.value, props.candidateGoals))

watch(parsed, (value) => emit('update:parsed', value), { immediate: true })

// 예시는 이번 주 첫 목표 이름의 첫 단어로 만든다 — 따라 치면 실제로 # 매칭이 된다
const placeholder = computed(() => {
  const goalWord = props.candidateGoals[0]?.title.split(' ')[0]
  return goalWord ? `예) 자료 정리 30m #${goalWord}` : '예) 헬스장 운동 45m'
})

// 예상 시간은 사용자가 적는다(R7) — 시간 토큰이 없으면 추가하지 않고 적어달라고 안내한다
const canSubmit = computed(() => parsed.value.title !== '' && parsed.value.estimatedMin !== null)
const hint = computed(() =>
  parsed.value.title !== '' && parsed.value.estimatedMin === null
    ? '45m처럼 시간을 같이 적으면 추가할 수 있어요'
    : 'Enter나 오른쪽 버튼으로 추가해요',
)

function submit() {
  if (!canSubmit.value) return
  emit('submit', parsed.value)
  text.value = ''
}

function onEnter(event: KeyboardEvent) {
  // 한글 조합 중 Enter는 글자 확정용이라 무시한다(안 거르면 마지막 글자가 잘린 채 두 번 들어간다)
  if (event.isComposing) return
  submit()
}
</script>

<style scoped>
.task-input-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.field {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-ctrl);
}
.field:focus-within {
  outline: 2px solid var(--rose-500);
  outline-offset: 2px;
}
.input {
  flex: 1;
  min-width: 0;
  padding: 11px 13px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-family: inherit;
  color: var(--text-primary);
}
.input:focus {
  outline: none;
}
.input::placeholder {
  color: var(--text-muted);
}
.submit {
  flex: none;
  width: 30px;
  height: 30px;
  margin-right: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: var(--text-primary);
  color: var(--surface-card);
  cursor: pointer;
}
.submit:disabled {
  background: var(--surface-sunken);
  color: var(--text-muted);
  cursor: not-allowed;
}
.submit:focus-visible {
  outline: 2px solid var(--rose-500);
  outline-offset: 2px;
}
.hint {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}
.chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.chips:empty {
  display: none;
}
</style>
