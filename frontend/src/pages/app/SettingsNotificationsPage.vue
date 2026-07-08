<template>
  <BaseCard class="notif-card">
    <span class="ia-code">G1</span>
    <h1>알림</h1>
    <p class="desc">알림 유형별로 수신 여부를 설정합니다.</p>

    <ul class="list">
      <li v-for="item in items" :key="item.key" class="row">
        <div>
          <div class="row-title">{{ item.title }}</div>
          <div class="row-desc">{{ item.desc }}</div>
        </div>
        <BaseToggle v-model="item.enabled" />
      </li>
    </ul>
  </BaseCard>
</template>

<script setup>
import { reactive } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseToggle from '@/components/ui/BaseToggle.vue'

const items = reactive([
  { key: 'daily', title: '일간 계획 리마인드', desc: '매일 아침 할 일 입력을 알려드려요', enabled: true },
  { key: 'conflict', title: '일정 충돌 알림', desc: '새 일정이 기존 계획과 겹칠 때', enabled: true },
  { key: 'retro', title: '회고 알림', desc: '주간/월간 회고가 준비되면', enabled: false },
])
</script>

<style scoped>
.notif-card {
  max-width: 480px;
}
.ia-code {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--p-rose-ink);
  background: color-mix(in srgb, var(--p-rose) 14%, var(--p-surface));
  padding: 4px 10px;
  border-radius: 999px;
  margin-bottom: 12px;
}
h1 {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 8px;
}
.desc {
  color: var(--p-ink-muted);
  font-size: 0.92rem;
  margin: 0 0 24px;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 4px;
}
.row + .row {
  border-top: 1px solid color-mix(in srgb, var(--p-ink) 8%, transparent);
}
.row-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--p-ink);
}
.row-desc {
  font-size: 0.8rem;
  color: var(--p-ink-faint);
  margin-top: 2px;
}
</style>
