<template>
  <!-- 폰에서 오늘 화면(3열 캘린더)에 들어왔을 때 — 모바일에는 캘린더 전체를 넣지 않는다(CLAUDE.md 13절) -->
  <div class="wide-screen-notice">
    <BaseCard class="card">
      <h1>오늘 계획은 넓은 화면에서 볼 수 있어요</h1>
      <p>폰에서는 지금 할 일 하나만 크게 보여줘요. 다 했으면 바로 기록할 수 있어요.</p>
      <RouterLink :to="{ name: 'mobile-run' }" class="cta">지금 할 일 보기</RouterLink>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseCard from './BaseCard.vue'
</script>

<style scoped>
.wide-screen-notice {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}
.card {
  max-width: 360px;
  text-align: center;
}
h1 {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.4;
}
p {
  margin: 10px 0 20px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
}
/* 화면의 유일한 주 CTA — BaseButton primary와 같은 모양의 링크 */
.cta {
  display: inline-block;
  padding: 12px 22px;
  border-radius: var(--radius-ctrl);
  background: var(--rose-500);
  color: var(--text-on-rose);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}
.cta:hover {
  background: var(--rose-600);
}
.cta:focus-visible {
  outline: 2px solid var(--rose-500);
  outline-offset: 2px;
}
</style>
