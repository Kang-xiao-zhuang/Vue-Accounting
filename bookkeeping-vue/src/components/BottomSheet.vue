<template>
  <teleport to=".phone">
    <transition name="sheet">
      <div v-if="visible" class="sheet-overlay" @click.self="$emit('close')">
        <div
          ref="sheet"
          class="sheet"
          role="dialog"
          aria-modal="true"
          :aria-label="title || undefined"
          tabindex="-1"
        >
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
      if (open) {
        this.trigger = document.activeElement
        document.addEventListener('keydown', this.onKey)
        // Move focus into the sheet, unless an inner field already grabbed it
        // (e.g. EntrySheet auto-focuses the amount input).
        setTimeout(() => {
          const el = this.$refs.sheet
          if (el && !el.contains(document.activeElement)) {
            const f = this.focusables()
            ;(f[0] || el).focus()
          }
        }, 30)
      } else {
        document.removeEventListener('keydown', this.onKey)
        if (this.trigger && this.trigger.focus) this.trigger.focus() // return focus to opener
        this.trigger = null
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKey)
  },
  methods: {
    onKey(e) {
      if (e.key === 'Escape') { this.$emit('close'); return }
      if (e.key === 'Tab') this.trapTab(e)
    },
    focusables() {
      const el = this.$refs.sheet
      if (!el) return []
      const sel = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
      return Array.from(el.querySelectorAll(sel)).filter(n => n.offsetParent !== null)
    },
    trapTab(e) {
      const el = this.$refs.sheet
      if (!el) return
      const f = this.focusables()
      if (!f.length) { e.preventDefault(); el.focus(); return }
      const first = f[0]
      const last = f[f.length - 1]
      const active = document.activeElement
      if (!el.contains(active)) { e.preventDefault(); first.focus(); return }
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus() }
    }
  }
}
</script>

<style scoped>
.sheet-overlay { position: absolute; inset: 0; z-index: 40; background: rgba(0, 0, 0, 0.55); display: flex; align-items: flex-end; }
.sheet {
  width: 100%; background: var(--card); border-radius: 20px 20px 0 0;
  padding: 10px 18px calc(18px + env(safe-area-inset-bottom));
  display: flex; flex-direction: column; gap: 12px; max-height: 85%; overflow-y: auto;
  outline: none;
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
