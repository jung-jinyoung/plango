<template>
  <div class="acc">
    <div class="big">{{ ratio.toFixed(1) }}<small>배</small></div>
    <div class="text">
      <slot />
    </div>
    <div class="spark-wrap">
      <div class="spark">
        <i
          v-for="(v, i) in barHeights"
          :key="i"
          :class="{ cur: i === barHeights.length - 1 }"
          :style="{ height: `${v}%` }"
        />
      </div>
      <div class="spark-labels">
        <span v-for="label in trendLabels" :key="label">{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  ratio: number
  /** 시간순(과거 → 최근) accuracyRatio 배열. 마지막이 가장 최근(지난주) */
  trend: number[]
  trendLabels: string[]
}>()

// 막대 높이는 추세 중 최댓값(가장 부정확했던 주) 대비 상대값 — 실제 배수를
// 그대로 픽셀에 쓰면 1.0 근처 값들의 차이가 잘 안 보인다.
const barHeights = computed(() => {
  const max = Math.max(...props.trend)
  if (max <= 0) return props.trend.map(() => 0)
  return props.trend.map((v) => (v / max) * 100)
})
</script>

<style scoped>
.acc {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}
.big {
  font-size: 44px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--cat-amber-deep);
  flex: none;
  font-variant-numeric: tabular-nums;
}
.big small {
  font-size: 17px;
  font-weight: 600;
  margin-left: 2px;
}
.text {
  color: var(--text-secondary);
  font-size: 14px;
  flex: 1;
  min-width: 160px;
  line-height: 1.6;
}
.spark-wrap {
  flex: none;
}
.spark {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 52px;
}
/* 과거 막대는 amber-tint(반투명 배경용 색)가 아니라 amber 본색 + opacity —
   목업(.spark i.on)과 동일한 처리. tint를 쓰면 다크 카드 배경과 명암비가
   거의 없어서 막대가 안 보인다. */
.spark i {
  width: 16px;
  border-radius: 3px 3px 0 0;
  background: var(--cat-amber);
  opacity: 0.85;
  display: block;
}
.spark i.cur {
  opacity: 1;
}
.spark-labels {
  display: flex;
  gap: 6px;
  margin-top: 7px;
}
.spark-labels span {
  width: 16px;
  text-align: center;
  font-size: 10.5px;
  color: var(--text-muted);
}
</style>
