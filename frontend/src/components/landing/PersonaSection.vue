<template>
  <section class="wrap">
    <div class="section-head">
      <p class="section-eyebrow">For you</p>
      <h2>이런 하루를 보내고 있다면</h2>
    </div>
    <div class="persona-grid">
      <div v-for="p in personas" :key="p.name" class="neu-raised persona-card">
        <div class="persona-top">
          <span class="persona-avatar" :style="{ background: p.avatarBg }">{{ p.initial }}</span>
          <div>
            <div class="persona-name">{{ p.name }}</div>
            <div class="persona-tag">{{ p.tag }}</div>
          </div>
        </div>
        <p class="persona-quote">{{ p.quote }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
const personas = [
  {
    initial: '김',
    name: '김도윤 · 32세',
    tag: '재택근무 직장인',
    avatarBg: 'linear-gradient(145deg, var(--p-blue), #0f3f91)',
    quote:
      '"예고 없이 끼어드는 회의, 뒤죽박죽되는 우선순위. 지금 쓰는 도구는 하루 전체 흐름을 보여주지 못해요."',
  },
  {
    initial: '이',
    name: '이서연 · 27세',
    tag: '갓생 지망 대학원생',
    avatarBg: 'linear-gradient(145deg, var(--p-rose), var(--p-rose-ink))',
    quote: '"노션엔 목표, 다이어리엔 기록. 이번 달 목표를 어디에 적어뒀는지도 잘 기억이 안 나요."',
  },
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
  margin: 0;
  text-wrap: balance;
}
.persona-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
@media (max-width: 760px) {
  .persona-grid {
    grid-template-columns: 1fr;
  }
}
.persona-card {
  padding: 30px;
}
.persona-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.persona-avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #fff;
}
.persona-name {
  font-weight: 700;
  font-size: 1.02rem;
}
.persona-tag {
  font-size: 0.82rem;
  color: var(--p-ink-faint);
}
.persona-quote {
  font-size: 0.95rem;
  color: var(--p-ink-muted);
  margin: 0;
}
</style>
