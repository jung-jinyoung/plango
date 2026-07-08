<template>
  <section class="wrap" id="features">
    <div class="section-head">
      <p class="section-eyebrow">Key Feature</p>
      <h2>순서 없이 적어도, AI가 우선순위를 정리합니다</h2>
      <p class="section-desc">
        여섯 가지 필요에서 출발했습니다 — 목표를 잃지 않으면서도, 오늘 할 일을 자유롭게 적을 수
        있도록.
      </p>
    </div>
    <div class="feature-grid">
      <div v-for="f in features" :key="f.title" class="neu-raised feature-tile">
        <span class="feature-icon neu-sunken" v-html="f.icon"></span>
        <h3>{{ f.title }}</h3>
        <p>{{ f.desc }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
const ICONS = {
  clarity:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--p-rose)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>',
  priority:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--p-blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V10M12 19V5M20 19v-7"/></svg>',
  efficiency:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--p-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>',
  flexibility:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--p-rose)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3 7 13M17 3v6M17 3h-6M7 21l10-10M7 21v-6M7 21h6"/></svg>',
  integration:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--p-blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  insight:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--p-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
}

const features = [
  { title: 'Clarity', desc: '월간·주간·일간을 오가지 않고, 한 화면에서 확인합니다.', icon: ICONS.clarity },
  {
    title: 'Priority',
    desc: '목표는 사이드에, 일정은 캘린더에 — 섞이지 않게 구분합니다.',
    icon: ICONS.priority,
  },
  {
    title: 'Efficiency',
    desc: '소요시간과 마감일만으로, AI가 우선순위와 시간을 자동 배치합니다.',
    icon: ICONS.efficiency,
  },
  {
    title: 'Flexibility',
    desc: '일정이 바뀌면 드래그 한 번으로 하루 전체를 재배치합니다.',
    icon: ICONS.flexibility,
  },
  {
    title: 'Integration',
    desc: '계획, 실행, 회고를 하나의 화면에서 — 노션과 다이어리를 오가지 않아도 됩니다.',
    icon: ICONS.integration,
  },
  {
    title: 'Insight',
    desc: '매주, 무엇을 해냈는지 완료율과 패턴을 AI가 자동으로 요약합니다.',
    icon: ICONS.insight,
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
section {
  padding: 64px 0;
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
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}
@media (max-width: 880px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 560px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
.feature-tile {
  padding: 26px 24px;
}
.feature-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.feature-tile h3 {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}
.feature-tile p {
  font-size: 0.9rem;
  color: var(--p-ink-muted);
  margin: 0;
}
</style>
