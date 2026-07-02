import { defineStore } from 'pinia'
import api from '../api'
import { fmt, todayString } from '../utils'
import { t, localeDate } from '../i18n'

export const useTodosStore = defineStore('todos', {
  state: () => ({
    todos: [],
    anchor: todayString(),
    today: todayString()
  }),
  getters: {
    isToday(state) { return state.anchor === state.today },
    dateLabel(state) {
      const pretty = localeDate(state.anchor, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      return (state.anchor === state.today ? t('common.today') + ' · ' : '') + pretty
    },
    forDay(state) {
      return state.todos.filter(t => t.date === state.anchor)
    }
  },
  actions: {
    async load() {
      try {
        this.todos = await api.listTodos()
      } catch (e) { /* handled by interceptor */ }
    },
    shift(dir) {
      const t = new Date(this.anchor + 'T00:00:00')
      t.setDate(t.getDate() + dir)
      this.anchor = fmt(t)
    },
    goToday() { this.anchor = this.today },
    async add(payload) {
      try {
        await api.createTodo({ date: this.anchor, priority: 0, ...payload })
        await this.load()
      } catch (e) { /* handled by interceptor */ }
    },
    async toggle(id) {
      const t = this.todos.find(x => x.id === id)
      if (t) t.done = !t.done // optimistic
      try {
        await api.toggleTodo(id)
      } catch (e) {
        await this.load() // revert; interceptor showed the error
      }
    },
    async update(id, patch) {
      try {
        await api.updateTodo(id, patch)
        await this.load()
      } catch (e) { /* handled by interceptor */ }
    },
    async remove(id) {
      try {
        await api.deleteTodo(id)
        await this.load()
      } catch (e) { /* handled by interceptor */ }
    }
  }
})
