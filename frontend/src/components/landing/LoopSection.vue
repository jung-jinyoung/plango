<template>
  <section class="wrap" id="loop">
    <div class="section-head">
      <p class="section-eyebrow">Plango Loop</p>
      <h2>계획은 매번 처음부터 세우지 않습니다</h2>
      <p class="section-desc">
        월간 목표에서 시작해 주간, 일간의 실행으로 좁혀지고, 회고를 거쳐 다시 다음 목표로 되돌아가는
        순환 구조입니다.
      </p>
    </div>
    <div class="neu-raised">
      <div class="loop-track">
        <div v-for="(node, i) in nodes" :key="node.label" class="loop-item">
          <div class="loop-node">
            <div class="loop-dot neu-sunken" :style="{ color: node.color }">{{ node.badge }}</div>
            <span v-html="node.label"></span>
          </div>
          <svg
            v-if="i < nodes.length - 1"
            class="loop-arrow"
            width="28"
            height="16"
            viewBox="0 0 28 16"
            fill="none"
          >
            <path
              d="M2 8h22M18 2l6 6-6 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
      <p class="loop-caption">
        "이 루프가 반복될수록, 계획은 매번 처음부터 다시 세우는 것이 아니라 점점 더 자신에게 맞게
        다듬어집니다."
      </p>
    </div>
  </section>
</template>

<script setup>
const nodes = [
  { badge: '월간', label: '월간 목표', color: 'var(--p-rose-ink)' },
  { badge: '주간', label: '주간 목표', color: 'var(--p-blue)' },
  { badge: '일간', label: '매일 실행<br />(반복)', color: 'var(--p-green)' },
  { badge: '회고', label: '주간 회고', color: 'var(--p-lavender)' },
  { badge: '회고', label: '월간 회고', color: 'var(--p-rose-ink)' },
]
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
section.wrap {
  padding-top: 64px;
  padding-bottom: 64px;
}
.section-head {
  max-width: 640px;
  margin: 0 0 40px;
}
.section-eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--p-lavender);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 10px;
}
h2 {
  font-size: clamp(1.6rem, 2.6vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.015em;
  margin: 0 0 14px;
  text-wrap: balance;
}
.section-desc {
  color: var(--p-ink-muted);
  font-size: 1.02rem;
  max-width: 56ch;
}
.loop-track {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  overflow-x: auto;
  padding: 30px 24px;
}
.loop-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}
.loop-node {
  text-align: center;
  min-width: 128px;
}
.loop-dot {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
}
.loop-node span {
  font-size: 0.85rem;
  color: var(--p-ink-muted);
  font-weight: 600;
  display: block;
}
.loop-arrow {
  color: var(--p-ink-faint);
  flex-shrink: 0;
}
.loop-caption {
  text-align: center;
  color: var(--p-ink-muted);
  font-size: 0.92rem;
  margin: 20px 0 0;
  font-style: italic;
  padding: 0 24px 8px;
}
</style>
