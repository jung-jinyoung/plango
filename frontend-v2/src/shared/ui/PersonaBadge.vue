<template>
  <div class="persona-badge">
    <span class="label">체험 중 · {{ meta.name }} · {{ meta.role }}</span>
    <!-- RouterLink 대신 일반 앵커 — 페르소나 전환은 항상 전체 새로고침이라
    (features/*의 shared/ui는 store 재초기화 방식을 몰라도 되도록) router 주입에
    의존하지 않는다. 이 컴포넌트가 라우터 없는 단독 마운트 테스트에서도 동작한다. -->
    <a href="/demo" class="switch">바꾸기</a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getSelectedPersona, PERSONA_META } from '../lib/persona'

const meta = computed(() => PERSONA_META[getSelectedPersona()])
</script>

<style scoped>
.persona-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 6px 16px;
  background: var(--surface-sunken);
  color: var(--text-secondary);
  font-size: 12.5px;
}

.switch {
  color: var(--text-secondary);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.switch:hover {
  color: var(--text-primary);
}
</style>
