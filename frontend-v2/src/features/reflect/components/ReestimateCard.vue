<template>
  <div class="reestimate-card">
    <div class="re-h">
      <b>{{ title }}</b>
      <Chip variant="category" color="blue">{{ carryCount + 1 }}주째</Chip>
    </div>
    <p class="re-desc">{{ spentLabel }}를 썼는데 아직 안 끝났어요. 남은 양을 다시 잡아볼게요.</p>
    <div class="re-in">
      <BaseStepper v-model="draftHours" :min="1" :step="1" unit="h" />
      <p class="hint">{{ hintText }}</p>
    </div>
    <div class="re-actions">
      <BaseButton variant="primary" :disabled="confirmed" @click="onConfirm">
        {{ confirmed ? '다시 잡았어요' : '다시 잡기' }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatMinutesAsHours } from '../../../shared/lib/time'
import BaseButton from '../../../shared/ui/BaseButton.vue'
import BaseStepper from '../../../shared/ui/BaseStepper.vue'
import Chip from '../../../shared/ui/Chip.vue'

const props = defineProps<{
  title: string
  carryCount: number
  spentMin: number
  /** 지난주 예상 정확도 배율 — 힌트 문구의 근거 (CLAUDE.md 6-2절) */
  ratio: number
  initialHours: number
}>()

// R6: 제안(힌트) → 사용자 수락(확정 버튼) → 변경. 힌트를 보여주는 이 시점엔
// 스토어를 절대 건드리지 않는다 — 값은 로컬 draft에만 있다가 onConfirm에서
// emit('confirm', ...)으로만 상위(페이지)에 전달되고, 실제 store.updateWeeklyGoal
// 호출은 페이지가 확정 버튼 클릭 이후에만 한다.
const draftHours = ref(props.initialHours)
const confirmed = ref(false)

const spentLabel = computed(() => formatMinutesAsHours(props.spentMin))

const hintText = computed(() => {
  const low = Math.floor(draftHours.value * props.ratio)
  const high = Math.ceil(draftHours.value * props.ratio)
  const range = low === high ? `${low}시간` : `${low}~${high}시간`
  return `이번 주 예상이 평균 ${props.ratio.toFixed(1)}배 길었어요. ${draftHours.value}시간으로 보면 실제로는 ${range}일 수 있어요.`
})

const emit = defineEmits<{
  confirm: [hours: number]
}>()

function onConfirm() {
  emit('confirm', draftHours.value)
  confirmed.value = true
}
</script>

<style scoped>
.re-h {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.re-h b {
  font-weight: 600;
  font-size: 15px;
}
.re-desc {
  color: var(--text-secondary);
  font-size: 13.5px;
  margin-bottom: 14px;
}
.re-in {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hint {
  flex: 1;
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.5;
}
.re-actions {
  margin-top: 14px;
}
</style>
