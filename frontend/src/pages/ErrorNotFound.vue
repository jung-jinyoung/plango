<template>
  <div class="not-found">
    <div class="not-found-card neu-raised">
      <div class="code">404</div>
      <p class="msg">페이지를 찾을 수 없어요.</p>
      <router-link to="/" class="btn btn-primary neu-interactive">홈으로 돌아가기</router-link>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.not-found {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--p-bg);
  padding: 24px;
}
.not-found-card {
  padding: 48px 40px;
  text-align: center;
  max-width: 360px;
}
.code {
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--p-rose-ink);
  letter-spacing: -0.02em;
}
.msg {
  color: var(--p-ink-muted);
  margin: 8px 0 24px;
}
.btn {
  display: inline-flex;
  appearance: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 999px;
  padding: 13px 26px;
  color: #fff;
  text-decoration: none;
  background: linear-gradient(145deg, var(--p-rose), var(--p-rose-ink));
  box-shadow: var(--p-shadow-raised);
  transition:
    box-shadow 150ms ease,
    transform 150ms ease;
}
</style>
