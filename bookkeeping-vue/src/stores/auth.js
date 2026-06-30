import { defineStore } from 'pinia'
import api from '../api'
import { useRecordsStore } from './records'
import { useHabitsStore } from './habits'
import { useTodosStore } from './todos'

const TOKEN_KEY = 'bookkeeping-token'
const USER_KEY = 'bookkeeping-user'

function readUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch (e) { return null }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: readUser() // { id, name }
  }),
  getters: {
    isAuthed: (s) => !!s.token
  },
  actions: {
    persist() {
      if (this.token) localStorage.setItem(TOKEN_KEY, this.token)
      else localStorage.removeItem(TOKEN_KEY)
      if (this.user) localStorage.setItem(USER_KEY, JSON.stringify(this.user))
      else localStorage.removeItem(USER_KEY)
    },
    async login(name, password) {
      const res = await api.login(name, password)
      this.token = res.token
      this.user = { id: res.id, name: res.name }
      this.persist()
    },
    async register(name, password) {
      const res = await api.register(name, password)
      this.token = res.token
      this.user = { id: res.id, name: res.name }
      this.persist()
    },
    async fetchMe() {
      const me = await api.me()
      this.user = { id: me.id, name: me.name }
      this.persist()
    },
    logout() {
      this.token = null
      this.user = null
      this.persist()
      // Drop any in-memory data from the previous session.
      useRecordsStore().$reset()
      useHabitsStore().$reset()
      useTodosStore().$reset()
    }
  }
})
