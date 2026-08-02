<template>
  <div class="next-week-suggestions">
    <div v-for="s in displaySuggestions" :key="s.key" class="sug">
      <Dot :color="s.color" />
      <div class="txt">
        <b>{{ s.title }}</b>
        <span>{{ s.subtitle }}</span>
      </div>
      <span class="hrs">{{ formatMinutesAsHours(Math.round(s.hours * 60)) }}</span>
      <button
        v-if="!confirmed"
        class="x"
        type="button"
        aria-label="빼기"
        @click="remove(s.key)"
      >
        ✕
      </button>
    </div>
    <p v-if="displaySuggestions.length === 0" class="empty">다음 주에 새로 잡을 목표가 없어요.</p>

    <div class="cap">
      <div class="cap-top">
        <b>{{ formatMinutesAsHours(Math.round(totalHours * 60)) }} 잡았어요</b>
        <span>쓸 수 있는 시간 {{ formatMinutesAsHours(Math.round(availableHours * 60)) }}</span>
      </div>
      <ProgressBar :percent="percent" color="mint" />
      <p class="cap-note">지난 4주 동안 실제로 쓴 시간을 기준으로 계산했어요.</p>
    </div>

    <div class="confirm-row">
      <BaseButton variant="primary" :disabled="confirmed || activeSuggestions.length === 0" @click="onConfirm">
        {{ confirmed ? '다음 주 목표로 확정했어요' : '다음 주 목표로 확정하기' }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatMinutesAsHours } from '../../../shared/lib/time'
import BaseButton from '../../../shared/ui/BaseButton.vue'
import Dot from '../../../shared/ui/Dot.vue'
import ProgressBar from '../../../shared/ui/ProgressBar.vue'
import type { NextWeekSuggestion } from '../lib/suggestNextWeekGoals'

const props = defineProps<{
  suggestions: NextWeekSuggestion[]
  availableHours: number
}>()

// R6: ✕로 빼는 것도, 남은 후보를 보여주는 것도 전부 로컬 상태다 — 확정 버튼을
// 눌러야만 emit('confirm', ...)이 나가고, 실제 store.addWeeklyGoal 호출은
// 상위(페이지)가 그 이벤트를 받을 때만 한다.
const removedKeys = ref(new Set<string>())
const confirmed = ref(false)

const activeSuggestions = computed(() => props.suggestions.filter((s) => !removedKeys.value.has(s.key)))
const totalHours = computed(() => displaySuggestions.value.reduce((sum, s) => sum + s.hours, 0))
const percent = computed(() =>
  props.availableHours > 0 ? (totalHours.value / props.availableHours) * 100 : 0,
)

// 확정 순간의 목록을 얼려서 보여준다 — 확정 즉시 store.addWeeklyGoal이 반영되고
// props.suggestions(상위의 suggestNextWeekGoals computed)가 그 새 상태를 입력
// 삼아 다시 계산되면서, 방금 만든 이월 후속 목표가 또 다른 "이월 이어짐" 후보로
// 잡혀 목록이 확정 직후에 조용히 바뀌어 보이는 문제가 있었다.
const confirmedSuggestions = ref<NextWeekSuggestion[] | null>(null)
const displaySuggestions = computed(() => confirmedSuggestions.value ?? activeSuggestions.value)

function remove(key: string) {
  removedKeys.value = new Set([...removedKeys.value, key])
}

const emit = defineEmits<{
  confirm: [accepted: NextWeekSuggestion[]]
}>()

function onConfirm() {
  confirmedSuggestions.value = activeSuggestions.value
  emit('confirm', activeSuggestions.value)
  confirmed.value = true
}
</script>

<style scoped>
.sug {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
}
.sug:last-of-type {
  border-bottom: none;
}
.txt {
  flex: 1;
}
.txt b {
  display: block;
  font-weight: 600;
  font-size: 15px;
}
.txt span {
  font-size: 12.5px;
  color: var(--text-muted);
}
.hrs {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}
.x {
  color: var(--text-muted);
  font-size: 15px;
  padding: 6px 8px;
  border-radius: var(--radius-ctrl);
  background: none;
  border: none;
  cursor: pointer;
}
.x:hover {
  background: var(--surface-sunken);
  color: var(--text-secondary);
}
.x:focus-visible {
  outline: 2px solid var(--rose-500);
  outline-offset: -2px;
}
.empty {
  font-size: 13.5px;
  color: var(--text-muted);
  padding: 12px 0;
}
.cap {
  margin-top: 12px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}
.cap-top {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 9px;
}
.cap-top b {
  font-weight: 600;
}
.cap-top span {
  color: var(--text-muted);
}
.cap-note {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-top: 9px;
}
.confirm-row {
  margin-top: 16px;
}
</style>
