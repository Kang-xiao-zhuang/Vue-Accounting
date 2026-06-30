import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Route components are lazy-loaded (code-split) so the initial bundle stays small;
// each view's chunk is fetched on first navigation to it.
const routes = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  { path: '/add', name: 'add', component: () => import('../views/AddView.vue') },
  { path: '/records', name: 'records', component: () => import('../views/RecordsView.vue') },
  { path: '/habits', name: 'habits', component: () => import('../views/HabitsView.vue') },
  { path: '/daily', name: 'daily', component: () => import('../views/TodosView.vue') },
  { path: '/timer', name: 'timer', component: () => import('../views/TimerView.vue') },
  { path: '/stats', name: 'stats', component: () => import('../views/StatsView.vue') },
  { path: '/more', name: 'more', component: () => import('../views/MoreView.vue') },
  { path: '/budgets', name: 'budgets', component: () => import('../views/BudgetsView.vue') },
  { path: '/recurring', name: 'recurring', component: () => import('../views/RecurringView.vue') },
  { path: '/me', name: 'me', component: () => import('../views/ProfileView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/records' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Auth guard: public routes are always allowed; everything else needs a token.
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.public) {
    if (auth.isAuthed && to.name === 'login') return { name: 'records' }
    return true
  }
  if (!auth.isAuthed) return { name: 'login' }
  return true
})

export default router
