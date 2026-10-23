<template>
  <div class="task-input-preview">
    <!-- 회색 박스 + placeholder만으로는 이미 채워진 칸처럼 보였다 — 흰 입력창에 전면 보더,
         포커스 링, 오른쪽 추가 버튼으로 "여기에 적는다"를 드러낸다 -->
    <div class="field" :class="{ 'has-submit': submittable }">
      <input
        ref="inputEl"
        v-model="text"
        type="text"
        class="input"
        :placeholder="placeholder"
        aria-label="할 일 적기"
        role="combobox"
        :aria-expanded="suggestions.length > 0"
        aria-controls="goal-suggestions"
        @keydown.enter="onEnter"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.esc="dismissed = true"
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
      <!-- # 자동완성 — 이번 주 목표 중에서 고른다(CLAUDE.md 9절) -->
      <ul v-if="suggestions.length > 0" id="goal-suggestions" class="suggestions" role="listbox">
        <li
          v-for="(goal, i) in suggestions"
          :key="goal.id"
          role="option"
          :aria-selected="i === activeIndex"
          class="suggestion"
          :class="{ active: i === activeIndex }"
          @mousedown.prevent="pick(goal)"
        >
          # {{ goal.title }}
        </li>
      </ul>
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
import {
  activeGoalQuery,
  goalKeyword,
  parseTaskInput,
  type ParsedTaskInput,
} from '../lib/parse'
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
const inputEl = ref<HTMLInputElement | null>(null)
const parsed = computed(() => parseTaskInput(text.value, props.candidateGoals))

watch(parsed, (value) => emit('update:parsed', value), { immediate: true })

// 예시는 이번 주 첫 목표 이름의 첫 단어로 만든다 — 따라 치면 실제로 # 매칭이 된다
const placeholder = computed(() => {
  const goalWord = props.candidateGoals[0]?.title.split(' ')[0]
  return goalWord ? `예) 자료 정리 30m #${goalWord}` : '예) 헬스장 운동 45m'
})

// 예상 시간은 사용자가 적는다(R7) — 시간 토큰이 없으면 추가하지 않고 적어달라고 안내한다
const canSubmit = computed(() => parsed.value.title !== '' && parsed.value.estimatedMin !== null)
// 4시간 초과는 쪼개도록 제안만 한다(기획서 7-6절) — 회고의 해상도는 블록 크기가 결정한다
const hint = computed(() => {
  if (parsed.value.title !== '' && parsed.value.estimatedMin === null)
    return '45m처럼 시간을 같이 적으면 추가할 수 있어요'
  if ((parsed.value.estimatedMin ?? 0) > 240)
    return '4시간이 넘어요. 나눠서 적으면 회고할 때 더 정확하게 볼 수 있어요'
  return 'Enter나 오른쪽 버튼으로 추가해요'
})

// ---------- # 자동완성 ----------
const dismissed = ref(false)
const activeIndex = ref(0)
const suggestions = computed(() => {
  const query = activeGoalQuery(text.value)
  if (query === null || dismissed.value) return []
  const q = query.toLowerCase()
  return props.candidateGoals.filter((g) => g.title.toLowerCase().includes(q))
})
watch(text, () => {
  dismissed.value = false
  activeIndex.value = 0
})

function move(step: number) {
  if (suggestions.value.length === 0) return
  const n = suggestions.value.length
  activeIndex.value = (activeIndex.value + step + n) % n
}

// 고른 목표를 이 목표에만 매칭되는 한 단어로 # 뒤에 넣는다(goalKeyword)
function pick(goal: WeeklyGoal) {
  text.value = text.value.replace(/#\S*$/, `#${goalKeyword(goal, props.candidateGoals)} `)
  dismissed.value = true
  inputEl.value?.focus()
}

function submit() {
  if (!canSubmit.value) return
  emit('submit', parsed.value)
  text.value = ''
}

function onEnter(event: KeyboardEvent) {
  // 한글 조합 중 Enter는 글자 확정용이라 무시한다(안 거르면 마지막 글자가 잘린 채 두 번 들어간다)
  if (event.isComposing) return
  // 자동완성이 열려 있으면 Enter는 목표 선택이다
  const selected = suggestions.value[activeIndex.value]
  if (selected) return pick(selected)
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
.suggestions {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 10;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-ctrl);
}
.suggestion {
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13.5px;
  color: var(--text-primary);
  cursor: pointer;
}
.suggestion.active,
.suggestion:hover {
  background: var(--surface-sunken);
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
