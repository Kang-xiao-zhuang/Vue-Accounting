import { defineStore } from 'pinia'
import api from '../api'
import { toast } from '../toast'
import { t } from '../i18n'

export const useHabitsStore = defineStore('habits', {
  state: () => ({
    habits: []
  }),
  actions: {
    async load() {
      try {
        this.habits = await api.listHabits()
      } catch (e) { /* handled by interceptor */ }
    },
    async add({ name, icon, color, weeklyTarget }) {
      try {
        await api.createHabit({ name, icon, color, weeklyTarget })
        await this.load()
      } catch (e) { /* handled by interceptor */ }
    },
    async update({ id, name, icon, color, weeklyTarget }) {
      try {
        await api.updateHabit(id, { name, icon, color, weeklyTarget })
        await this.load()
      } catch (e) { /* handled by interceptor */ }
    },
    async remove(id) {
      try {
        await api.deleteHabit(id)
        await this.load()
        toast.success(t('habit.deleted'))
      } catch (e) { /* handled by interceptor */ }
    },
    async toggle(id, date) {
      const habit = this.habits.find(h => h.id === id)
      if (!habit) return
      // Optimistic update for instant feedback.
      const i = habit.checkins.indexOf(date)
      if (i >= 0) habit.checkins.splice(i, 1)
      else habit.checkins.push(date)
      try {
        await api.toggleHabit(id, date)
      } catch (e) {
        await this.load() // revert; interceptor showed the error
      }
    }
  }
})
