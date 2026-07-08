<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="overlay" @mousedown.self="handleOverlayClick">
        <div
          class="panel neu-raised"
          :class="`is-${variant}`"
          :style="{ maxWidth: width }"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <header v-if="title" class="panel-head">
            <h2>{{ title }}</h2>
            <button type="button" class="close-btn" aria-label="닫기" @click="close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </header>

          <div class="panel-body">
            <slot />
          </div>

          <footer v-if="$slots.actions" class="panel-actions">
            <slot name="actions" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  variant: { type: String, default: 'modal' }, // modal | dialog
  title: { type: String, default: '' },
  width: { type: String, default: undefined },
  persistent: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'close'])

function close() {
  if (props.persistent) return
  emit('update:modelValue', false)
  emit('close')
}

function handleOverlayClick() {
  close()
}

function handleKeydown(e) {
  if (e.key === 'Escape' && props.modelValue) close()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(32, 35, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.panel {
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}
.panel.is-dialog {
  max-width: 400px;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 0;
}
.panel-head h2 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.01em;
}
.close-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-ink-faint);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.close-btn:hover {
  color: var(--p-ink);
}
.panel-body {
  padding: 20px 24px;
  overflow-y: auto;
}
.panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 22px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 180ms ease;
}
.modal-fade-enter-active .panel,
.modal-fade-leave-active .panel {
  transition:
    transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 180ms ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .panel,
.modal-fade-leave-to .panel {
  transform: scale(0.96) translateY(6px);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .modal-fade-enter-active .panel,
  .modal-fade-leave-active .panel {
    transition: opacity 180ms ease;
  }
  .modal-fade-enter-from .panel,
  .modal-fade-leave-to .panel {
    transform: none;
  }
}
</style>
