<template>
  <section class="wrap closing" id="start">
    <div class="neu-raised closing-slab">
      <p class="section-eyebrow" style="justify-content: center">지금 시작하기</p>
      <h2>"Plan it, Live it, Reflect on it."</h2>
      <p class="section-desc" style="margin: 0 auto">
        오늘의 계획부터 이번 달 회고까지, 첫 목표를 지금 적어보세요.
      </p>
      <form class="closing-form" @submit.prevent="handleSubmit">
        <label for="email" class="sr-only">이메일 주소</label>
        <input
          id="email"
          v-model="email"
          class="email-input neu-sunken"
          type="email"
          placeholder="이메일 주소"
          autocomplete="email"
          required
          @blur="touched = true"
        />
        <button type="submit" class="btn btn-primary neu-interactive">무료로 시작하기</button>
      </form>
      <p v-if="touched && email && !isValid" class="error-text">올바른 이메일 형식이 아니에요</p>
      <p v-else class="micro">신용카드 필요 없음 · 1분이면 충분해요</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const email = ref('')
const touched = ref(false)
const isValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))

function handleSubmit() {
  touched.value = true
  if (!isValid.value) return
  // TODO: 실제 가입 플로우 연결
}
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
.closing {
  padding: 60px 0 84px;
}
.closing-slab {
  padding: 56px 48px;
  text-align: center;
}
@media (max-width: 640px) {
  .closing-slab {
    padding: 40px 24px;
  }
}
.section-eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--p-lavender);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 10px;
  display: flex;
}
h2 {
  font-size: clamp(1.6rem, 2.6vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.015em;
  margin: 0 auto 14px;
  max-width: 20ch;
  text-wrap: balance;
}
.section-desc {
  color: var(--p-ink-muted);
  font-size: 1.02rem;
  max-width: 56ch;
}
.closing-form {
  display: flex;
  gap: 12px;
  max-width: 440px;
  margin: 30px auto 14px;
}
@media (max-width: 500px) {
  .closing-form {
    flex-direction: column;
  }
}
.email-input {
  flex: 1;
  border: none;
  padding: 15px 20px;
  border-radius: 999px;
  font-size: 0.95rem;
  color: var(--p-ink);
  transition: box-shadow 150ms ease;
}
.email-input::placeholder {
  color: var(--p-ink-faint);
}
.btn {
  appearance: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 999px;
  padding: 13px 26px;
  transition:
    box-shadow 150ms ease,
    transform 150ms ease;
}
.btn-primary {
  color: #fff;
  background: linear-gradient(145deg, var(--p-rose), var(--p-rose-ink));
  box-shadow: var(--p-shadow-raised);
}
.btn-primary:active {
  box-shadow:
    inset 4px 4px 9px rgba(122, 44, 66, 0.55),
    inset -3px -3px 7px rgba(255, 190, 205, 0.25);
}
.micro {
  font-size: 0.8rem;
  color: var(--p-ink-faint);
}
.error-text {
  font-size: 0.8rem;
  color: var(--p-rose-ink);
  font-weight: 600;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
</style>
