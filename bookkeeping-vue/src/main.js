import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setUnauthorizedHandler } from './api'
import { useAuthStore } from './stores/auth'
import { i18n } from './i18n'
import './style.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(i18n)

// On a 401, log out and bounce to the login screen.
setUnauthorizedHandler(() => {
  useAuthStore().logout()
  router.push({ name: 'login' })
})

app.mount('#app')

// Register the service worker for offline support (production builds only,
// so it never interferes with Vite's dev HMR).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* ignore */ })
  })
}
