<template>
  <div class="landing-page">
    <LandingHeader />
    <main>
      <HeroSection />
      <FeatureGrid />
      <LoopSection />
      <PersonaSection />
      <ClosingCta />
    </main>
    <LandingFooter />
  </div>
</template>

<script setup>
import LandingHeader from '@/components/landing/LandingHeader.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import FeatureGrid from '@/components/landing/FeatureGrid.vue'
import LoopSection from '@/components/landing/LoopSection.vue'
import PersonaSection from '@/components/landing/PersonaSection.vue'
import ClosingCta from '@/components/landing/ClosingCta.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
</script>

<style scoped>
.landing-page {
  background: var(--p-bg);
  min-height: 100dvh;
  overflow-x: hidden;
}
</style>
