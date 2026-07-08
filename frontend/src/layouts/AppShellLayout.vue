<template>
  <div class="shell">
    <AppSidebar />
    <div class="main-col">
      <AppHeader />
      <div class="page-body">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from '@/components/shell/AppSidebar.vue'
import AppHeader from '@/components/shell/AppHeader.vue'
</script>

<style scoped>
.shell {
  display: flex;
  min-height: 100dvh;
  background: var(--p-bg);
}
.main-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.page-body {
  flex: 1;
  padding: 28px 32px 64px;
  min-width: 1024px;
}
</style>
