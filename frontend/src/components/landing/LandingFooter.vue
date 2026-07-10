<template>
  <footer class="landing-footer">
    <div class="wrap footer-inner">
      <div class="logo">
        <AppLogo :size="26" />
      </div>
      <p class="footer-copy">© 2026 Plango. Plan + Go.</p>
    </div>
  </footer>
</template>

<script setup>
import AppLogo from '@/components/ui/AppLogo.vue'
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
.landing-footer {
  padding: 36px 0 52px;
}
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 1rem;
}
.footer-copy {
  font-size: 0.82rem;
  color: var(--p-ink-faint);
}
</style>
