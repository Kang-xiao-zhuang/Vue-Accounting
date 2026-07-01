<template>
  <teleport to=".phone">
    <transition name="sheet">
      <div v-if="visible" class="sheet-overlay" @click.self="$emit('close')">
        <div class="sheet">
          <div class="sheet-handle"></div>
          <div v-if="title || $slots.head" class="sheet-head">
            <slot name="head"><span class="sheet-title">{{ title }}</span></slot>
            <button class="sheet-x" @click="$emit('close')" aria-label="Close">✕</button>
          </div>
          <slot />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'BottomSheet',
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '' }
  },
  emits: ['close'],
  watch: {
    visible(open) {
      if (open) document.addEventListener('keydown', this.onKey)
      else document.removeEventListener('keydown', this.onKey)
    }
  },
  methods: {
    onKey(e) { if (e.key === 'Escape') this.$emit('close') }
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKey)
  }
}
</script>

<style scoped>
.sheet-overlay { position: absolute; inset: 0; z-index: 40; background: rgba(0, 0, 0, 0.55); display: flex; align-items: flex-end; }
.sheet {
  width: 100%; background: var(--card); border-radius: 20px 20px 0 0;
  padding: 10px 18px calc(18px + env(safe-area-inset-bottom));
  display: flex; flex-direction: column; gap: 12px; max-height: 85%; overflow-y: auto;
}
.sheet-handle { width: 40px; height: 4px; border-radius: 2px; background: var(--border); margin: 4px auto 6px; flex-shrink: 0; }
.sheet-head { display: flex; align-items: center; justify-content: space-between; }
.sheet-title { font-size: 16px; font-weight: 700; }
.sheet-x { background: none; border: none; color: var(--muted); font-size: 18px; cursor: pointer; }

.sheet-enter-active, .sheet-leave-active { transition: opacity .2s; }
.sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform .25s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }
</style>
