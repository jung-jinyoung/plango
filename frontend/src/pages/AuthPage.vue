<template>
  <div class="auth-page">
    <div class="auth-card neu-raised">
      <router-link to="/" class="logo">
        <AppLogo :size="32" />
      </router-link>
      <PagePlaceholder
        code="A2"
        title="회원가입 / 로그인"
        purpose="계정 생성 또는 인증을 진행합니다."
        :actions="[
          'Input — 이메일 / 비밀번호',
          'Button — 로그인 또는 가입',
          '소셜 로그인 버튼',
          '최초 가입 시 → /onboarding, 기존 사용자 → /app/dashboard/monthly',
        ]"
      />
    </div>
  </div>
</template>

<script setup>
import PagePlaceholder from '@/components/shell/PagePlaceholder.vue'
import AppLogo from '@/components/ui/AppLogo.vue'
</script>

<style scoped>
.auth-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--p-bg);
  padding: 24px;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--p-ink);
  text-decoration: none;
  margin-bottom: 20px;
}
</style>
