<template>
  <div v-if="autoSelecting" class="redirecting">
    <p>{{ PERSONA_META[autoSelecting].name }}의 하루로 들어가고 있어요…</p>
  </div>

  <div v-else class="landing">
    <header class="hero">
      <svg class="flam" width="72" height="72" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <ellipse cx="56" cy="58" rx="19" ry="13" fill="var(--rose-500)" />
        <path
          d="M68 51C78 35 58 20 39 28"
          stroke="var(--rose-500)"
          stroke-width="4.6"
          stroke-linecap="round"
        />
        <circle cx="36" cy="29.5" r="4.6" fill="var(--rose-500)" />
        <path d="M32 27.5L23 31L32 34Z" fill="var(--rose-500)" />
        <path
          d="M52 70L55 82L48 92"
          stroke="var(--rose-500)"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path d="M41 92H55" stroke="var(--rose-500)" stroke-width="3" stroke-linecap="round" />
      </svg>
      <h1>Plango</h1>
      <p class="tagline">계획하고, 실행하고, 회고하는 개인 플랫폼</p>
      <p class="positioning">회고가 본체고, 계획은 회고할 거리를 만드는 장치예요.</p>
      <BaseButton variant="ghost" @click="scrollToDemo">체험해보기 ↓</BaseButton>
    </header>

    <section class="story">
      <div class="story-block">
        <h2>대부분의 플래너는 미래만 봐요</h2>
        <p>지나간 일정은 흐리게 처리되다 화면 밖으로 밀려나요. Plango는 이 방향을 뒤집었어요.</p>
      </div>
      <div class="story-block">
        <h2>회고는 쓰는 일이 아니라 확인하는 일이에요</h2>
        <p>
          회고 도구는 다들 원한다고 말하지만 막상 하지 않아요. 그래서 자동으로 잡힌 기록에서 AI가
          초안을 채우고, 사용자는 틀린 것만 고치면 되도록 만들었어요.
        </p>
      </div>
    </section>

    <section class="features">
      <h2 class="features-title">이런 걸 할 수 있어요</h2>
      <div class="feature-grid">
        <BaseCard v-for="feature in features" :key="feature.title" class="feature">
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.body }}</p>
        </BaseCard>
      </div>
    </section>

    <section id="demo-cta" ref="demoSectionEl" class="demo-cta">
      <h2>누구로 체험해볼까요?</h2>
      <p class="lead">두 사람의 한 주가 이미 채워져 있어요. 골라서 바로 들어가볼 수 있어요.</p>

      <div class="cards">
        <BaseCard v-for="meta in personas" :key="meta.id" hoverable class="persona-card">
          <h3>{{ meta.name }}</h3>
          <span class="role">{{ meta.role }}</span>
          <p class="desc">{{ meta.description }}</p>
          <BaseButton variant="primary" @click="choose(meta.id)">체험하기</BaseButton>
        </BaseCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PERSONA_META, setSelectedPersona, type PersonaId } from '../shared/lib/persona'
import BaseButton from '../shared/ui/BaseButton.vue'
import BaseCard from '../shared/ui/BaseCard.vue'

const route = useRoute()
const router = useRouter()
const personas = Object.values(PERSONA_META)
const demoSectionEl = ref<HTMLElement | null>(null)

const features = [
  { title: '계획·실제 병기', body: '계획한 시간과 실제 쓴 시간을 나란히 봐요.' },
  { title: '목표 역산', body: '이번 달 목표 하나만 정하면 4주로 나눠드려요.' },
  { title: '빠른 입력', body: '할 일 한 줄이면 충분해요. 시간·목표는 자동으로 읽어요.' },
  { title: '재추정', body: '밀린 일은 실패가 아니라 조정이에요. 다음 주 계획에 자연스럽게 반영돼요.' },
]

function isPersonaId(value: unknown): value is PersonaId {
  return value === 'seyeon' || value === 'doyoon'
}

// ?p=seyeon / ?p=doyoon 직행 QR·URL용 — 랜딩 없이 바로 선택 처리한다.
const autoSelecting = computed<PersonaId | null>(() => {
  const p = route.query.p
  return isPersonaId(p) ? p : null
})

function scrollToDemo() {
  demoSectionEl.value?.scrollIntoView({ behavior: 'smooth' })
}

// 페르소나를 바꿀 때마다 완전히 새로고침한다(router.push가 아님) — Pinia
// 스토어가 모듈 스코프 싱글턴이고 리포지토리가 store 초기화 시점에 한 번만
// 배열을 읽어오므로, 스토어 상태가 깨끗하게 다시 만들어지려면 리로드가 필요하다.
// 도착지는 진입 라우팅을 거치지 않고 항상 today — 방문 시각에 따라 첫 화면이
// 달라지지 않게 한다.
function choose(id: PersonaId) {
  setSelectedPersona(id)
  window.location.assign(router.resolve({ name: 'today' }).href)
}

if (autoSelecting.value) {
  choose(autoSelecting.value)
}
</script>

<style scoped>
.redirecting {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 14px;
  background: var(--surface-page);
}

.landing {
  background: var(--surface-page);
}

.hero {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  gap: 4px;
}

.hero .flam {
  margin-bottom: 12px;
}

.hero h1 {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

.tagline {
  color: var(--text-secondary);
  font-size: 15px;
}

.positioning {
  color: var(--text-muted);
  font-size: 13.5px;
  margin-bottom: 20px;
}

.story {
  max-width: 640px;
  margin: 0 auto;
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.story-block h2 {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.story-block p {
  color: var(--text-secondary);
  font-size: 14.5px;
  line-height: 1.6;
}

.features {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 24px 60px;
}

.features-title {
  text-align: center;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.feature h3 {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.feature p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.demo-cta {
  max-width: 640px;
  margin: 0 auto;
  padding: 60px 24px 80px;
  text-align: center;
  scroll-margin-top: 24px;
}

.demo-cta h2 {
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

.persona-card h3 {
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
  .feature-grid,
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
