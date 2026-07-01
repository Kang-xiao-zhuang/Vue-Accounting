<template>
  <BottomSheet :visible="s.open" :title="s.title" @close="cancel">
    <div class="c-message">{{ s.message }}</div>
    <div class="c-actions">
      <button class="btn-cancel" @click="cancel">{{ s.cancelText }}</button>
      <button class="btn-ok" :class="{ danger: s.danger }" @click="ok">{{ s.confirmText }}</button>
    </div>
  </BottomSheet>
</template>

<script>
import { confirmState, settleConfirm } from '../confirm'
import BottomSheet from './BottomSheet.vue'

export default {
  name: 'ConfirmSheet',
  components: { BottomSheet },
  computed: { s() { return confirmState } },
  methods: {
    ok() { settleConfirm(true) },
    cancel() { settleConfirm(false) }
  }
}
</script>

<style scoped>
.c-message { font-size: 14px; color: var(--muted); line-height: 1.5; }
.c-actions { display: flex; gap: 10px; margin-top: 4px; }
.btn-cancel {
  flex: 1; padding: 12px; border: 1px solid var(--border); background: var(--input);
  color: var(--text); border-radius: 11px; font-size: 15px; font-weight: 600; cursor: pointer;
}
.btn-ok {
  flex: 1; padding: 12px; border: none; background: var(--primary); color: #fff;
  border-radius: 11px; font-size: 15px; font-weight: 700; cursor: pointer;
}
.btn-ok.danger { background: var(--expense); }
</style>
