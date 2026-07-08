<template>
  <section class="hero wrap">
    <div>
      <span class="eyebrow neu-raised">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"
          />
        </svg>
        AI 기반 개인 일정 플래너
      </span>
      <h1>계획은 세우고,<br />하루는 살아내고,<br />매주 돌아봅니다</h1>
      <p class="slogan">"Plan it, Live it, Reflect on it."</p>
      <p class="hero-sub">
        넓은 화면 위에서 한눈에 — 이번 달 목표부터 오늘의 일정, 지난주 회고까지 하나의 화면에서
        이어집니다.
      </p>
      <div class="hero-ctas">
        <a href="#start" class="btn btn-primary neu-interactive">무료로 시작하기</a>
        <a href="#loop" class="btn btn-ghost neu-interactive">Plango Loop 살펴보기</a>
      </div>
      <div class="proof-inline">
        <span><strong>42%</strong> 더 높은 목표 달성률 · Dominican University</span>
        <span><strong>208명</strong> 지식노동자 대상 회고 효과 연구 · JOOP 2023</span>
      </div>
    </div>

    <TodayPreviewCard />
  </section>
</template>

<script setup>
import TodayPreviewCard from './TodayPreviewCard.vue'
</script>

<style scoped>
.wrap {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 32px;
}
@media (max-width: 640px) {
  .wrap {
    padding: 0 20px;
  }
}
.hero {
  padding: 40px 0 80px;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 56px;
  align-items: center;
}
@media (max-width: 960px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 32px 0 48px;
  }
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--p-rose-ink);
  padding: 8px 16px;
  border-radius: 999px;
  margin-bottom: 22px;
}
h1 {
  font-size: clamp(2.1rem, 4vw, 3.35rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.22;
  text-wrap: balance;
  margin: 0 0 18px;
}
.slogan {
  font-size: 0.95rem;
  font-style: italic;
  font-weight: 600;
  color: var(--p-lavender);
  margin: 0 0 20px;
}
.hero-sub {
  font-size: 1.08rem;
  color: var(--p-ink-muted);
  max-width: 46ch;
  margin: 0 0 34px;
}
.hero-ctas {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 34px;
}
.btn {
  appearance: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 999px;
  padding: 13px 26px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition:
    box-shadow 150ms ease,
    transform 150ms ease;
}
.btn-primary {
  color: #fff;
  background: linear-gradient(145deg, var(--p-rose), var(--p-rose-ink));
  box-shadow: var(--p-shadow-raised);
}
.btn-primary:active {
  box-shadow:
    inset 4px 4px 9px rgba(122, 44, 66, 0.55),
    inset -3px -3px 7px rgba(255, 190, 205, 0.25);
}
.btn-ghost {
  color: var(--p-ink);
  background: var(--p-surface);
  box-shadow: var(--p-shadow-raised);
}
.proof-inline {
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: var(--p-ink-faint);
}
.proof-inline strong {
  color: var(--p-ink);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
</style>
