<!--
  임시 파일 — 병합 후 삭제해도 된다.
  왼쪽: 실제 컴포넌트(토큰 기반) / 오른쪽: 목업에 있던 원본 hex 스와치.
  두 색이 같아 보이면 토큰이 목업을 정확히 반영한 것이고,
  다르면(라벨에 표시) 목업 원본값과 토큰 통합 과정에서 값이 약간 조정된 지점이다.
-->
<template>
  <div class="gallery">
    <h1>컴포넌트 ↔ 목업 색상 대조</h1>

    <div class="row">
      <div class="comp"><BaseButton variant="primary">오늘 확정</BaseButton></div>
      <ColorSwatch hex="#FF4E7E" label="mockup .btn-primary bg" />
      <span class="note">일치</span>
    </div>

    <div class="row">
      <div class="comp"><BaseCard style="width: 160px; height: 40px" /></div>
      <ColorSwatch hex="#FFFFFF" label="mockup .panel bg" />
      <span class="note">일치</span>
    </div>

    <div class="row">
      <div class="comp"><BaseStepper v-model="hours" unit="h" /></div>
      <ColorSwatch hex="#F2F4F6" label="mockup .stepper bg" />
      <ColorSwatch hex="#E8EBEF" label="mockup .stepper button:hover" />
      <span class="note">배경 일치 · hover는 --border(#E5E8EB)로 근사(목업 #E8EBEF와 약간 다름)</span>
    </div>

    <div class="row">
      <div class="comp" style="width: 160px"><ProgressBar :percent="60" color="blue" /></div>
      <ColorSwatch hex="#3182F6" label="mockup --cat-blue" />
      <span class="note">일치</span>
    </div>

    <div class="row">
      <div class="comp"><Chip variant="category" color="blue">결과 파트 작성</Chip></div>
      <ColorSwatch hex="#E8F1FE" label="mockup .chip.on bg" />
      <ColorSwatch hex="#1B5FBF" label="mockup .chip.on text" />
      <span class="note">텍스트 일치 · 배경은 --cat-blue-tint(#DEEBFE)로 근사(목업 #E8F1FE와 약간 다름)</span>
    </div>

    <div class="row">
      <div class="comp"><Chip variant="time">90분</Chip></div>
      <ColorSwatch hex="#EAF6F4" label="mockup .chip.tm bg" />
      <ColorSwatch hex="#00806E" label="mockup .chip.tm text" />
      <span class="note">텍스트 일치 · 배경은 --cat-mint-tint(#D6F5F1)로 근사(목업 #EAF6F4와 약간 다름)</span>
    </div>

    <div class="row">
      <div class="comp"><Dot color="blue" /></div>
      <ColorSwatch hex="#3182F6" label="mockup .dot bg" />
      <span class="note">일치</span>
    </div>

    <section class="dark-demo reflect-week-dark">
      <h2>.reflect-week-dark 스코프 (오늘 만든 다크 토큰)</h2>
      <div class="row">
        <div class="comp"><BaseButton variant="primary">CTA</BaseButton></div>
        <div class="comp"><BaseCard style="width: 140px">카드</BaseCard></div>
        <div class="comp"><Chip variant="category" color="blue">3주째</Chip></div>
        <div class="comp"><ProgressBar :percent="60" color="blue" /></div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from './shared/ui/BaseButton.vue'
import BaseCard from './shared/ui/BaseCard.vue'
import BaseStepper from './shared/ui/BaseStepper.vue'
import ProgressBar from './shared/ui/ProgressBar.vue'
import Chip from './shared/ui/Chip.vue'
import Dot from './shared/ui/Dot.vue'
import ColorSwatch from './ColorSwatch.vue'

const hours = ref(6)
</script>

<style scoped>
.gallery {
  padding: 32px;
  max-width: 720px;
  margin: 0 auto;
}
h1 {
  font-size: 20px;
  margin-bottom: 24px;
}
.row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.comp {
  flex: none;
}
.note {
  font-size: 12px;
  color: var(--text-muted);
}
.dark-demo {
  margin-top: 32px;
  padding: 24px;
  border-radius: var(--radius-card);
  background: var(--surface-page);
}
.dark-demo h2 {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}
</style>
