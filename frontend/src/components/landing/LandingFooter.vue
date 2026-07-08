<template>
  <footer class="landing-footer">
    <div class="wrap footer-inner">
      <div class="logo">
        <span class="logo-mark" aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--p-rose)"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 21c0-4 3-5 3-9a3 3 0 0 0-6 0c0 2 1 3 1 5" />
            <path d="M9 21h6" />
          </svg>
        </span>
        Plango
      </div>
      <p class="footer-copy">© 2026 Plango. Plan + Go.</p>
    </div>
  </footer>
</template>

<script setup></script>

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
.logo-mark {
  width: 26px;
  height: 26px;
  border-radius: 10px;
  background: var(--p-surface);
  box-shadow: var(--p-shadow-raised-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}
.footer-copy {
  font-size: 0.82rem;
  color: var(--p-ink-faint);
}
</style>
