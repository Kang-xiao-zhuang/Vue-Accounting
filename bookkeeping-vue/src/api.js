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
  }
}
