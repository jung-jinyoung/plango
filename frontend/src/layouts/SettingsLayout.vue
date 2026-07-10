<template>
  <div class="settings-layout">
    <nav class="local-nav" aria-label="설정 하위 메뉴">
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="local-nav-item"
        :class="{ 'is-active': route.path === item.to }"
      >
        {{ item.label }}
      </router-link>
      <button type="button" class="local-nav-item" @click="showCategoryModal = true">
        카테고리 관리
      </button>
    </nav>
    <div class="local-body">
      <router-view />
    </div>

    <CategoryManageModal v-model="showCategoryModal" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import CategoryManageModal from '@/components/settings/CategoryManageModal.vue'

const route = useRoute()
const items = [
  { label: '계정', to: '/app/settings/account' },
  { label: '알림', to: '/app/settings/notifications' },
]
const showCategoryModal = ref(false)
</script>

<style scoped>
.settings-layout {
  display: flex;
  gap: 32px;
}
.local-nav {
  width: 180px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.local-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  color: var(--p-ink-muted);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}
.local-nav-item:hover {
  background: var(--p-surface);
}
.local-nav-item.is-active {
  background: color-mix(in srgb, var(--p-rose) 14%, var(--p-surface));
  color: var(--p-rose-ink);
}
.local-body {
  flex: 1;
  min-width: 0;
}
</style>
