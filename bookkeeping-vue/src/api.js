import axios from 'axios'
import { toast } from './toast'

const TOKEN_KEY = 'bookkeeping-token'

// The auth store registers a logout callback here, so api.js stays decoupled
// from the store (no circular import).
let onUnauthorized = () => {}
export function setUnauthorizedHandler(fn) { onUnauthorized = fn }

// In dev, Vite proxies /api -> http://localhost:8030 (see vite.config.js).
const http = axios.create({ baseURL: '/api' })

// Attach the bearer token to every request.
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Surface backend/network problems as a toast automatically, and log out on 401.
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const res = error.response
    const url = (error.config && error.config.url) || ''
    const isAuthCall = url.includes('/auth/')

    if (res && res.status === 401 && !isAuthCall) {
      onUnauthorized()
      toast.error('Session expired. Please log in again.')
      return Promise.reject(error)
    }

    let msg
    if (!res) {
      msg = 'Cannot reach the server. Is the Spring Boot backend running on port 8030?'
    } else if (res.status >= 500) {
      msg = 'Server error. Please try again.'
    } else {
      msg = (res.data && res.data.message) || `Request failed (${res.status}).`
    }
    toast.error(msg)
    return Promise.reject(error)
  }
)

export default {
  // ---- auth ----
  register(name, password) {
    return http.post('/auth/register', { name, password }).then(r => r.data)
  },
  login(name, password) {
    return http.post('/auth/login', { name, password }).then(r => r.data)
  },
  me() {
    return http.get('/auth/me').then(r => r.data)
  },

  // ---- records (scoped to the logged-in user on the backend) ----
  list() {
    return http.get('/records').then(r => r.data)
  },
  create(record) {
    return http.post('/records', record).then(r => r.data)
  },
  update(id, record) {
    return http.put(`/records/${id}`, record).then(r => r.data)
  },
  remove(id) {
    return http.delete(`/records/${id}`)
  },
  clear() {
    return http.delete('/records')
  },

  // ---- habits ----
  listHabits() {
    return http.get('/habits').then(r => r.data)
  },
  createHabit(habit) {
    return http.post('/habits', habit).then(r => r.data)
  },
  updateHabit(id, habit) {
    return http.put(`/habits/${id}`, habit).then(r => r.data)
  },
  deleteHabit(id) {
    return http.delete(`/habits/${id}`)
  },
  toggleHabit(id, date) {
    return http.post(`/habits/${id}/toggle`, null, { params: { date } }).then(r => r.data)
  },

  // ---- todos (daily checklist) ----
  listTodos() {
    return http.get('/todos').then(r => r.data)
  },
  createTodo(todo) {
    return http.post('/todos', todo).then(r => r.data)
  },
  updateTodo(id, todo) {
    return http.put(`/todos/${id}`, todo).then(r => r.data)
  },
  toggleTodo(id) {
    return http.post(`/todos/${id}/toggle`).then(r => r.data)
  },
  deleteTodo(id) {
    return http.delete(`/todos/${id}`)
  },

  // ---- budgets ----
  listBudgets() {
    return http.get('/budgets').then(r => r.data)
  },
  upsertBudget(budget) {
    return http.put('/budgets', budget).then(r => r.data)
  },
  deleteBudget(id) {
    return http.delete(`/budgets/${id}`)
  },

  // ---- recurring transactions ----
  listRecurring() {
    return http.get('/recurring').then(r => r.data)
  },
  createRecurring(rule) {
    return http.post('/recurring', rule).then(r => r.data)
  },
  updateRecurring(id, rule) {
    return http.put(`/recurring/${id}`, rule).then(r => r.data)
  },
  deleteRecurring(id) {
    return http.delete(`/recurring/${id}`)
  },
  runRecurring() {
    return http.post('/recurring/run').then(r => r.data)
  },

  // ---- backup / restore ----
  backup() {
    return http.get('/backup').then(r => r.data)
  },
  restore(data) {
    return http.post('/backup/restore', data).then(r => r.data)
  },

  // ---- paginated record history ----
  recordsPage(params) {
    return http.get('/records/page', { params }).then(r => r.data)
  }
}
