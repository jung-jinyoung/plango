<template>
  <div class="onboarding-page">
    <div class="onboarding-card neu-raised">
      <PagePlaceholder
        code="A3"
        title="온보딩 — 첫 목표 설정"
        purpose="첫 사용 진입 시 월간 목표를 입력하도록 유도합니다."
        :actions="[
          'Progress Bar — 온보딩 진행 단계',
          'Input — 목표 입력 (다건 추가 가능)',
          'Button — 시작하기 → 완료 시 /app/dashboard/monthly',
        ]"
      />
    </div>
  </div>
</template>

<script setup>
import PagePlaceholder from '@/components/shell/PagePlaceholder.vue'
</script>

<style scoped>
.onboarding-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--p-bg);
  padding: 24px;
}
.onboarding-card {
  width: 100%;
  max-width: 480px;
  padding: 40px;
}
</style>
