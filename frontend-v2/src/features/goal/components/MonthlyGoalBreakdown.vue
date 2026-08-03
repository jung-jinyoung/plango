<template>
  <div class="breakdown">
    <div class="weeks">
      <div v-for="(week, i) in editableWeeks" :key="i" class="week" :class="{ now: i === 0 }">
        <div class="week-idx">
          <div class="bead" :style="{ background: i === 0 ? `var(--cat-${color})` : 'var(--border)' }" />
          <div class="lb">{{ i + 1 }}주차</div>
        </div>
        <div class="week-card">
          <div class="week-body">
            <div class="tt">
              {{ week.title }}
              <Chip v-if="i === 0" variant="category" :color="color">이번 주</Chip>
            </div>
            <div class="sub">{{ week.weekOf }}부터</div>
          </div>
          <BaseStepper v-model="week.estimatedHours" :min="1" :max="40" unit="h" />
        </div>
      </div>
    </div>

    <BaseCard class="total">
      <span class="k">한 달 동안 이만큼 쓰게 돼요</span>
      <span class="v">{{ totalHours }}시간<em> · 주 {{ perWeekLabel }}</em></span>
    </BaseCard>

    <p class="note">
      할 일은 그 주가 시작될 때 만들어요. 지금 4주치를 다 짜두면 어차피 바뀌어서, 지우는 일만 늘거든요.
    </p>

    <div class="actions">
      <BaseButton variant="primary" @click="confirm">이대로 시작하기</BaseButton>
      <BaseButton variant="ghost" @click="emit('retry')">다시 나눠주세요</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '../../../shared/ui/BaseButton.vue'
import BaseCard from '../../../shared/ui/BaseCard.vue'
import BaseStepper from '../../../shared/ui/BaseStepper.vue'
import Chip from '../../../shared/ui/Chip.vue'
import type { CategoryColor, WeeklyGoalDraft } from '../../../entities/types'

const props = defineProps<{
  drafts: WeeklyGoalDraft[]
  color: CategoryColor
}>()

// 스테퍼로 조정 가능한 로컬 사본 — 확정하기 전까지는 여기서만 바뀐다(R6).
// decomposeMonthlyGoal 결과는 소수(예: 10/4=2.5h)일 수 있어 정수로 반올림해서
// 스테퍼가 다루기 쉽게 만든다.
const editableWeeks = ref(
  props.drafts.map((d) => ({ ...d, estimatedHours: Math.round(d.estimatedHours) })),
)
watch(
  () => props.drafts,
  (drafts) => {
    editableWeeks.value = drafts.map((d) => ({ ...d, estimatedHours: Math.round(d.estimatedHours) }))
  },
)

const totalHours = computed(() => editableWeeks.value.reduce((sum, w) => sum + w.estimatedHours, 0))
const perWeekLabel = computed(() => {
  const hours = editableWeeks.value.map((w) => w.estimatedHours)
  const min = Math.min(...hours)
  const max = Math.max(...hours)
  return min === max ? `${min}시간` : `${min}~${max}시간`
})

const emit = defineEmits<{
  confirm: [weeks: { title: string; weekOf: string; estimatedHours: number }[]]
  retry: []
}>()

function confirm() {
  emit(
    'confirm',
    editableWeeks.value.map((w) => ({ title: w.title, weekOf: w.weekOf, estimatedHours: w.estimatedHours })),
  )
}
</script>

<style scoped>
.breakdown {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.weeks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.week {
  display: flex;
  gap: 16px;
}
.week-idx {
  width: 56px;
  flex: none;
  padding-top: 20px;
  text-align: center;
}
.week-idx .bead {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-pill);
  margin: 0 auto 8px;
}
.week-idx .lb {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
}
.week-card {
  flex: 1;
  background: var(--surface-card);
  border-radius: var(--radius-card);
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.week.now .week-card {
  box-shadow: 0 0 0 2px var(--rose-500) inset;
}
.week-body {
  flex: 1;
  min-width: 0;
}
.tt {
  font-weight: 600;
  font-size: 15px;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sub {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-top: 4px;
}
.total {
  display: flex;
  align-items: center;
  gap: 16px;
}
.total .k {
  font-size: 13.5px;
  color: var(--text-secondary);
  flex: 1;
}
.total .v {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.total .v em {
  font-style: normal;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  margin-left: 3px;
}
.note {
  padding: 14px 16px;
  background: var(--surface-sunken);
  color: var(--text-secondary);
  border-radius: var(--radius-card);
  font-size: 13.5px;
  line-height: 1.6;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
