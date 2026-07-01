import { reactive } from 'vue'

const KEY = 'bookkeeping-theme'

// Each theme maps to a [data-theme] block in style.css.
// `chips` = [primary, income, expense, bg] used for the picker preview.
export const themes = [
  { key: 'light', name: 'Light', icon: '☀️', chips: ['#4f6ef7', '#1f9d6b', '#e25563', '#f4f6fb'] },
  { key: 'dark', name: 'Dark', icon: '🌙', chips: ['#6d86ff', '#3dd6a3', '#ff6b7a', '#0f1320'] },
  { key: 'duotone', name: 'Duotone', icon: '🎨', chips: ['#ff5fa2', '#2bd9c4', '#ff8a5c', '#241043'] },
  { key: 'ocean', name: 'Ocean', icon: '🌊', chips: ['#33c9dc', '#3dd6a3', '#ff7a8a', '#0b1f2a'] },
  { key: 'forest', name: 'Forest', icon: '🌲', chips: ['#4caf6a', '#6fd08c', '#ff7a6b', '#0e1f12'] },
  { key: 'sunset', name: 'Sunset', icon: '🌇', chips: ['#ff9f45', '#ffd24d', '#ff6b6b', '#2a1710'] },
  { key: 'rose', name: 'Rose', icon: '🌸', chips: ['#e6568c', '#1f9d6b', '#e2556a', '#fdf5f7'] },
  { key: 'slate', name: 'Slate', icon: '🪨', chips: ['#7c8aa5', '#5fb08c', '#d9707e', '#16181d'] },
  { key: 'auto', name: 'Auto', icon: '🌗', chips: ['#6d86ff', '#3dd6a3', '#ff6b7a', '#888888'] }
]

export const themeState = reactive({
  key: localStorage.getItem(KEY) || 'dark'
})

function systemDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyTheme() {
  // 'auto' follows the OS; every other key maps directly to a data-theme.
  const resolved = themeState.key === 'auto' ? (systemDark() ? 'dark' : 'light') : themeState.key
  document.documentElement.setAttribute('data-theme', resolved)
}

export function setTheme(key) {
  themeState.key = key
  localStorage.setItem(KEY, key)
  applyTheme()
}

export function cycleTheme() {
  const i = themes.findIndex(t => t.key === themeState.key)
  setTheme(themes[(i + 1) % themes.length].key)
}

export function initTheme() {
  const saved = localStorage.getItem(KEY)
  if (saved && themes.some(t => t.key === saved)) themeState.key = saved
  applyTheme()
  // Re-apply when the OS theme changes, but only while in 'auto'.
  if (window.matchMedia) {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => { if (themeState.key === 'auto') applyTheme() }
    if (mql.addEventListener) mql.addEventListener('change', onChange)
    else if (mql.addListener) mql.addListener(onChange)
  }
}
