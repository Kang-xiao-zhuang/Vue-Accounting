import { reactive } from 'vue'

// A tiny global toast store. Import { toast } anywhere and call toast.error('...') etc.
let seq = 0
export const toastState = reactive({ items: [] })

export function pushToast(message, type = 'info', timeout = 3000) {
  if (!message) return
  const id = ++seq
  toastState.items.push({ id, message, type })
  if (timeout) setTimeout(() => removeToast(id), timeout)
  return id
}

export function removeToast(id) {
  const i = toastState.items.findIndex(t => t.id === id)
  if (i >= 0) toastState.items.splice(i, 1)
}

export const toast = {
  info: (m) => pushToast(m, 'info'),
  success: (m) => pushToast(m, 'success'),
  error: (m) => pushToast(m, 'error', 4500)
}
