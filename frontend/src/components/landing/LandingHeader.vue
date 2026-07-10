<template>
  <header class="landing-header">
    <div class="wrap header-inner">
      <div class="logo">
        <AppLogo :size="34" />
      </div>
      <a href="#start" class="btn btn-primary btn-sm neu-interactive">무료로 시작하기</a>
    </div>
  </header>
</template>

<script setup>
import AppLogo from '@/components/ui/AppLogo.vue'
</script>

<style scoped>
.landing-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--p-bg) 88%, transparent);
  backdrop-filter: blur(10px);
}
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
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.01em;
}
.btn {
  appearance: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 999px;
  padding: 13px 26px;
  color: var(--p-ink);
  background: var(--p-surface);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  box-shadow: var(--p-shadow-raised-sm);
  transition:
    box-shadow 150ms ease,
    transform 150ms ease;
}
.btn-primary {
  color: #fff;
  background: linear-gradient(145deg, var(--p-rose), var(--p-rose-ink));
}
.btn-primary:active {
  box-shadow:
    inset 4px 4px 9px rgba(122, 44, 66, 0.55),
    inset -3px -3px 7px rgba(255, 190, 205, 0.25);
}
.btn-sm {
  padding: 10px 20px;
  font-size: 0.875rem;
}
</style>
