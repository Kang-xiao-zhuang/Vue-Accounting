import axios from 'axios'

// In dev, Vite proxies /api -> http://localhost:8030 (see vite.config.js).
const http = axios.create({ baseURL: '/api' })

export default {
  // ---- records ----
  list(userId) {
    return http.get('/records', { params: { userId } }).then(r => r.data)
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
  clear(userId) {
    return http.delete('/records', { params: { userId } })
  },

  // ---- users ----
  listUsers() {
    return http.get('/users').then(r => r.data)
  },
  createUser(name) {
    return http.post('/users', { name }).then(r => r.data)
  },
  updateUser(id, name) {
    return http.put(`/users/${id}`, { name }).then(r => r.data)
  },
  deleteUser(id) {
    return http.delete(`/users/${id}`)
  },

  // ---- habits ----
  listHabits(userId) {
    return http.get('/habits', { params: { userId } }).then(r => r.data)
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
  listTodos(userId) {
    return http.get('/todos', { params: { userId } }).then(r => r.data)
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
  }
}
