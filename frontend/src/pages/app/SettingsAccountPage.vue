<template>
  <BaseCard class="account-card">
    <h1>계정</h1>
    <p class="desc">계정 정보를 수정합니다.</p>

    <form class="form" @submit.prevent>
      <BaseInput v-model="name" label="이름" placeholder="이름을 입력하세요" />
      <BaseInput
        v-model="email"
        label="이메일"
        type="email"
        autocomplete="email"
        :error="touched && email && !isEmailValid ? '올바른 이메일 형식이 아니에요' : ''"
        @blur="touched = true"
      />
      <BaseButton variant="primary" type="submit" style="align-self: flex-start">저장</BaseButton>
    </form>
  </BaseCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const name = ref('Plango 사용자')
const email = ref('user@plango.app')
const touched = ref(false)
const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
</script>

<style scoped>
.account-card {
  max-width: 480px;
}
h1 {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 8px;
}
.desc {
  color: var(--p-ink-muted);
  font-size: 0.92rem;
  margin: 0 0 24px;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
