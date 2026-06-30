<template>
  <div class="toast-stack" aria-live="polite" aria-atomic="true">
    <transition-group name="toast">
      <div
        v-for="t in items"
        :key="t.id"
        class="toast"
        :class="t.type"
        role="status"
        @click="dismiss(t.id)"
      >
        <span class="toast-ico">{{ icon(t.type) }}</span>
        <span class="toast-msg">{{ t.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { toastState, removeToast } from '../toast'

export default {
  name: 'Toast',
  computed: {
    items() { return toastState.items }
  },
  methods: {
    dismiss(id) { removeToast(id) },
    icon(type) {
      return type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'
    }
  }
}
</script>

<style scoped>
.toast-stack {
  position: absolute; left: 0; right: 0; top: 0; z-index: 50;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 12px 14px; pointer-events: none;
}
.toast {
  pointer-events: auto; cursor: pointer;
  display: flex; align-items: center; gap: 9px;
  width: 100%; max-width: 380px;
  padding: 11px 14px; border-radius: 12px;
  background: var(--card); color: var(--text);
  border: 1px solid var(--border); box-shadow: var(--frame-shadow);
  font-size: 14px; font-weight: 500;
}
.toast.success { border-color: var(--income); }
.toast.error { border-color: var(--expense); }
.toast-ico { flex-shrink: 0; }
.toast-msg { flex: 1; word-break: break-word; }

.toast-enter-active, .toast-leave-active { transition: all .25s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-12px); }
.toast-leave-to { opacity: 0; transform: translateY(-12px); }
.toast-leave-active { position: absolute; }
</style>
