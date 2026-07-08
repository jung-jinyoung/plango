<template>
  <header class="landing-header">
    <div class="wrap header-inner">
      <div class="logo">
        <span class="logo-mark" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--p-rose)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 21c0-4 3-5 3-9a3 3 0 0 0-6 0c0 2 1 3 1 5" />
            <path d="M9 21h6" />
            <circle cx="13" cy="7" r="1.4" fill="var(--p-rose)" stroke="none" />
          </svg>
        </span>
        Plango
      </div>
      <a href="#start" class="btn btn-primary btn-sm neu-interactive">무료로 시작하기</a>
    </div>
  </header>
</template>

<script setup></script>

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
.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: var(--p-surface);
  box-shadow: var(--p-shadow-raised-sm);
  display: flex;
  align-items: center;
  justify-content: center;
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
