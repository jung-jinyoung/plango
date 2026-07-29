<template>
  <div class="preview">
    <h1>디자인 시스템 — 1단계 미리보기</h1>

    <section>
      <h2>BaseButton</h2>
      <div class="row">
        <BaseButton variant="primary">오늘 확정</BaseButton>
        <BaseButton variant="ghost">이번 주</BaseButton>
        <BaseButton variant="primary" disabled>비활성</BaseButton>
      </div>
    </section>

    <section>
      <h2>BaseCard</h2>
      <div class="row">
        <BaseCard style="width: 220px">기본 카드</BaseCard>
        <BaseCard style="width: 220px" hoverable>호버 시 그림자</BaseCard>
      </div>
    </section>

    <section>
      <h2>BaseStepper</h2>
      <div class="row">
        <BaseStepper v-model="hours" :min="0" :max="20" unit="h" />
      </div>
      <p class="hint">현재 값: {{ hours }}h</p>
    </section>

    <section>
      <h2>ProgressBar</h2>
      <div class="col" style="width: 280px">
        <ProgressBar :percent="45" color="blue" />
        <ProgressBar :percent="100" color="blue" muted />
        <ProgressBar :percent="50" color="mint" />
      </div>
    </section>

    <section>
      <h2>BaseStepper (step=15, 예상 시간용)</h2>
      <div class="row">
        <BaseStepper v-model="minutes" :min="0" :max="180" :step="15" unit="분" />
      </div>
    </section>

    <section>
      <h2>Chip</h2>
      <div class="row">
        <Chip>결과 파트 작성</Chip>
        <Chip variant="category" color="blue">결과 파트 작성</Chip>
        <Chip variant="category" color="blue" dot>8월 목표 · 연구</Chip>
        <Chip variant="time">90분</Chip>
      </div>
    </section>

    <section>
      <h2>Dot</h2>
      <div class="row">
        <Dot color="blue" />
        <Dot color="mint" />
        <Dot color="amber" />
        <Dot color="purple" />
        <Dot color="green" />
        <Dot color="gray" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from './shared/ui/BaseButton.vue'
import BaseCard from './shared/ui/BaseCard.vue'
import BaseStepper from './shared/ui/BaseStepper.vue'
import ProgressBar from './shared/ui/ProgressBar.vue'
import Chip from './shared/ui/Chip.vue'
import Dot from './shared/ui/Dot.vue'

const hours = ref(6)
const minutes = ref(90)
</script>

<style scoped>
.preview {
  padding: 32px;
  max-width: 640px;
  margin: 0 auto;
}
h1 {
  font-size: 20px;
  margin-bottom: 24px;
}
h2 {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 10px;
}
section {
  margin-bottom: 32px;
}
.row {
  display: flex;
  gap: 12px;
  align-items: center;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.hint {
  margin-top: 10px;
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
