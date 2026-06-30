import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView from '../views/LoginView.vue'
import AddView from '../views/AddView.vue'
import RecordsView from '../views/RecordsView.vue'
import HabitsView from '../views/HabitsView.vue'
import TodosView from '../views/TodosView.vue'
import TimerView from '../views/TimerView.vue'
import StatsView from '../views/StatsView.vue'
import ProfileView from '../views/ProfileView.vue'
import BudgetsView from '../views/BudgetsView.vue'
import RecurringView from '../views/RecurringView.vue'

const routes = [
  { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
  { path: '/add', name: 'add', component: AddView },
  { path: '/records', name: 'records', component: RecordsView },
  { path: '/habits', name: 'habits', component: HabitsView },
  { path: '/daily', name: 'daily', component: TodosView },
  { path: '/timer', name: 'timer', component: TimerView },
  { path: '/stats', name: 'stats', component: StatsView },
  { path: '/budgets', name: 'budgets', component: BudgetsView },
  { path: '/recurring', name: 'recurring', component: RecurringView },
  { path: '/me', name: 'me', component: ProfileView },
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
