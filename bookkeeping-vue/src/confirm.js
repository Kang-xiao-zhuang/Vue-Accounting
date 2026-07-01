import { reactive } from 'vue'

// Global confirm dialog. Usage: if (await confirmDialog('Delete?', { danger: true })) { ... }
export const confirmState = reactive({
  open: false,
  title: 'Please confirm',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  danger: false,
  _resolve: null
})

export function confirmDialog(message, opts = {}) {
  return new Promise((resolve) => {
    confirmState.title = opts.title || 'Please confirm'
    confirmState.message = message
    confirmState.confirmText = opts.confirmText || 'Confirm'
    confirmState.cancelText = opts.cancelText || 'Cancel'
    confirmState.danger = !!opts.danger
    confirmState._resolve = resolve
    confirmState.open = true
  })
}

export function settleConfirm(value) {
  const resolve = confirmState._resolve
  confirmState.open = false
  confirmState._resolve = null
  if (resolve) resolve(value)
}
