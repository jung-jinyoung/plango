<template>
  <div v-if="autoSelecting" class="redirecting">
    <p>{{ PERSONA_META[autoSelecting].name }}의 하루로 들어가고 있어요…</p>
  </div>

  <div v-else class="landing">
    <header class="hero">
      <div class="hero-text">
        <div class="brand">
          <!-- 브랜드 마크 = 서서 앞을 보는 포즈(계획·실행). 회고 포즈는 회고 화면 전용(기획서 9-8절) -->
          <svg width="26" height="33" viewBox="0 0 18 23" fill="none" aria-hidden="true">
            <ellipse cx="8" cy="14.5" rx="6.2" ry="4.4" fill="var(--rose-500)" />
            <path
              d="M12 12.4C15.2 9.6 15 5 11.6 3.6"
              stroke="var(--rose-500)"
              stroke-width="2.4"
              stroke-linecap="round"
            />
            <circle cx="10.9" cy="3" r="2.1" fill="var(--rose-500)" />
            <path d="M12.6 2.1L16 3.4L12.6 4.4Z" fill="var(--rose-500)" />
            <path
              d="M6.6 18.6L7.7 20.4L6 21.9"
              stroke="var(--rose-500)"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Plango
        </div>
        <h1>계획을 지우지 않고,<br />실제와 나란히 남겨요</h1>
        <p class="lead">
          계획하고, 실행하고, 회고하는 개인 플래너예요. 예상보다 오래 걸린 시간도 그대로 남아서 다음
          계획이 점점 정확해져요.
        </p>
        <div class="hero-actions">
          <BaseButton variant="primary" class="hero-cta" @click="scrollToPersonas">
            체험해보기
          </BaseButton>
        </div>
        <p class="note">가입 없이 바로 둘러볼 수 있어요.</p>
      </div>
      <PlanActualDiagram class="hero-visual" />
    </header>

    <section class="steps">
      <h2>계획하고, 실행하고, 돌아봐요</h2>
      <ol class="step-list">
        <li v-for="(step, i) in steps" :key="step.title" class="step">
          <span class="num">{{ i + 1 }}</span>
          <span class="stage">{{ step.stage }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.body }}</p>
        </li>
      </ol>
    </section>

    <section ref="personaSectionEl" class="personas">
      <h2>어떤 한 주를 볼까요?</h2>
      <p class="section-lead">두 사람의 한 주가 미리 채워져 있어요.</p>

      <div class="cards">
        <BaseCard v-for="meta in personas" :key="meta.id" hoverable class="persona-card">
          <h3>{{ meta.situation }}</h3>
          <span class="who">{{ meta.name }} · {{ meta.role }}</span>
          <ul class="preview">
            <li v-for="line in meta.preview" :key="line">{{ line }}</li>
          </ul>
          <!-- 로즈는 히어로 CTA 하나만 — 카드 버튼은 중립 톤(CLAUDE.md 7절 주 CTA 화면당 1개) -->
          <BaseButton variant="ghost" @click="choose(meta.id)">체험해보기</BaseButton>
        </BaseCard>
      </div>
    </section>

    <footer class="foot">
      <p>체험용 데이터는 방문한 주에 맞춰 날짜가 옮겨져요.</p>
      <p>바꾼 내용은 새로고침하면 처음 상태로 돌아가요.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PERSONA_META, setSelectedPersona, type PersonaId } from '../shared/lib/persona'
import BaseButton from '../shared/ui/BaseButton.vue'
import BaseCard from '../shared/ui/BaseCard.vue'
import PlanActualDiagram from '../shared/ui/PlanActualDiagram.vue'
import { isNarrowViewport } from '../shared/lib/viewport'

const route = useRoute()
const router = useRouter()
const personas = Object.values(PERSONA_META)
const personaSectionEl = ref<HTMLElement | null>(null)

// 체험에서 바로 확인할 수 있는 흐름만 쓴다 — AI 초안·목표 역산(온보딩)은 페르소나 체험에서 보이지 않는다
const steps = [
  {
    stage: '계획',
    title: '한 줄로 적으면 돼요',
    body: '"서론 초안 90m #결과"처럼 적으면 시간과 목표를 알아서 나눠요. 하루는 웹에서 넓게 보며 짜요.',
  },
  {
    stage: '실행',
    title: '지금 할 일 하나만',
    body: '폰에서는 지금 할 일 하나만 크게 보여줘요. "다 했어요"를 누르면 실제로 쓴 시간이 남아요.',
  },
  {
    stage: '회고',
    title: '쓰지 않고 확인만',
    body: '한 주가 끝나면 예상이 얼마나 맞았는지 숫자로 보여줘요. 밀린 일은 다시 재서 다음 주 계획에 반영해요.',
  },
]

function isPersonaId(value: unknown): value is PersonaId {
  return value === 'seyeon' || value === 'doyoon'
}

// ?p=seyeon / ?p=doyoon 직행 QR·URL용 — 랜딩 없이 바로 선택 처리한다.
const autoSelecting = computed<PersonaId | null>(() => {
  const p = route.query.p
  return isPersonaId(p) ? p : null
})

function scrollToPersonas() {
  personaSectionEl.value?.scrollIntoView({ behavior: 'smooth' })
}

// 페르소나를 바꿀 때마다 완전히 새로고침한다(router.push가 아님) — Pinia
// 스토어가 모듈 스코프 싱글턴이고 리포지토리가 store 초기화 시점에 한 번만
// 배열을 읽어오므로, 스토어 상태가 깨끗하게 다시 만들어지려면 리로드가 필요하다.
// 도착지는 진입 라우팅을 거치지 않고 정해진 화면 — 방문 시각에 따라 첫 화면이
// 달라지지 않게 한다. 넓은 화면은 today, 폰은 모바일 실행(캘린더 전체는 넓은 화면 전용).
function choose(id: PersonaId) {
  setSelectedPersona(id)
  const target = isNarrowViewport() ? 'mobile-run' : 'today'
  window.location.assign(router.resolve({ name: target }).href)
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
  color: var(--text-primary);
}

/* ---------- 히어로 ---------- */
.hero {
  max-width: 1080px;
  margin: 0 auto;
  padding: 96px 24px 48px;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 64px;
  align-items: center;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.hero h1 {
  margin-top: 28px;
  font-size: 44px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.04em;
}
.lead {
  margin-top: 20px;
  font-size: 17px;
  line-height: 1.65;
  color: var(--text-secondary);
}
.hero-actions {
  display: flex;
  gap: 8px;
  margin-top: 32px;
}
.hero-cta {
  padding-left: 28px;
  padding-right: 28px;
}
.note {
  margin-top: 12px;
  font-size: 13px;
  color: var(--text-muted);
}

/* ---------- 3단계 ---------- */
.steps,
.personas {
  max-width: 1080px;
  margin: 0 auto;
  padding: 56px 24px;
}
.steps h2,
.personas h2 {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.035em;
}
.step-list {
  list-style: none;
  margin: 32px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.step {
  background: var(--surface-card);
  border-radius: var(--radius-card);
  padding: 24px;
}
.num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-pill);
  background: var(--text-primary);
  color: var(--surface-card);
  font-size: 14px;
  font-weight: 800;
}
.stage {
  margin-left: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary);
}
.step h3 {
  margin-top: 18px;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.step p {
  margin-top: 8px;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* ---------- 페르소나 ---------- */
.section-lead {
  margin-top: 8px;
  font-size: 16px;
  color: var(--text-secondary);
}
.cards {
  margin-top: 32px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.personas {
  scroll-margin-top: 24px;
}
.persona-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.persona-card h3 {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.4;
}
.who {
  font-size: 13px;
  color: var(--text-muted);
}
.preview {
  list-style: none;
  margin: 8px 0 16px;
  padding: 0;
  display: grid;
  gap: 6px;
}
.preview li {
  position: relative;
  padding-left: 14px;
  font-size: 14.5px;
  color: var(--text-secondary);
}
.preview li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  width: 5px;
  height: 5px;
  border-radius: var(--radius-pill);
  background: var(--text-muted);
}
/* 흰 카드 위에선 ghost가 글자만 남아 링크처럼 보인다 — 회색 배경으로 버튼임을 드러낸다.
   로즈는 히어로 CTA 하나만 쓴다(CLAUDE.md 7절) */
.persona-card :deep(.base-btn) {
  margin-top: auto;
  background: var(--surface-sunken);
  color: var(--text-primary);
  font-weight: 600;
  padding: 10px 20px;
}
.persona-card :deep(.base-btn:hover) {
  background: var(--border);
}

/* ---------- 푸터 ---------- */
.foot {
  max-width: 1080px;
  margin: 0 auto;
  padding: 24px 24px 64px;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.7;
}
.foot p {
  margin: 0;
}

@media (max-width: 860px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 40px;
    padding-top: 56px;
    padding-bottom: 48px;
  }
  .hero h1 {
    font-size: 34px;
  }
  .step-list,
  .cards {
    grid-template-columns: 1fr;
  }
  .steps,
  .personas {
    padding-top: 48px;
    padding-bottom: 48px;
  }
}
</style>
