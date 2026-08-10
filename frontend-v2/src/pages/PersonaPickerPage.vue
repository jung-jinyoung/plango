<template>
  <div class="persona-picker-page">
    <div v-if="autoSelecting" class="redirecting">
      <p>{{ PERSONA_META[autoSelecting].name }}의 하루로 들어가고 있어요…</p>
    </div>

    <div v-else class="wrap">
      <h1>누구로 체험해볼까요?</h1>
      <p class="lead">두 사람의 한 주가 이미 채워져 있어요. 골라서 바로 들어가볼 수 있어요.</p>

      <div class="cards">
        <BaseCard v-for="meta in personas" :key="meta.id" hoverable class="persona-card">
          <h2>{{ meta.name }}</h2>
          <span class="role">{{ meta.role }}</span>
          <p class="desc">{{ meta.description }}</p>
          <BaseButton variant="primary" @click="choose(meta.id)">체험하기</BaseButton>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { PERSONA_META, setSelectedPersona, type PersonaId } from '../shared/lib/persona'
import BaseButton from '../shared/ui/BaseButton.vue'
import BaseCard from '../shared/ui/BaseCard.vue'

const route = useRoute()
const personas = Object.values(PERSONA_META)

function isPersonaId(value: unknown): value is PersonaId {
  return value === 'seyeon' || value === 'doyoon'
}

// ?p=seyeon / ?p=doyoon 직행 QR·URL용 — 카드 없이 바로 선택 처리한다.
const autoSelecting = computed<PersonaId | null>(() => {
  const p = route.query.p
  return isPersonaId(p) ? p : null
})

// 페르소나를 바꿀 때마다 완전히 새로고침한다(router.push가 아님) — Pinia
// 스토어가 모듈 스코프 싱글턴이고 리포지토리가 store 초기화 시점에 한 번만
// 배열을 읽어오므로, 스토어 상태가 깨끗하게 다시 만들어지려면 리로드가 필요하다.
function choose(id: PersonaId) {
  setSelectedPersona(id)
  window.location.assign('/')
}

if (autoSelecting.value) {
  choose(autoSelecting.value)
}
</script>

<style scoped>
.persona-picker-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-page);
  padding: 24px;
}

.redirecting {
  color: var(--text-secondary);
  font-size: 14px;
}

.wrap {
  max-width: 560px;
  text-align: center;
}

h1 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

.lead {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 14px;
}

.cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 28px;
}

.persona-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  text-align: left;
}

.persona-card h2 {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
}

.persona-card .role {
  font-size: 12.5px;
  color: var(--text-muted);
}

.persona-card .desc {
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.5;
  min-height: 60px;
}

@media (max-width: 560px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
