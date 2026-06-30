import { defineStore } from 'pinia'
import api from '../api'
import { toast } from '../toast'

export const useBudgetsStore = defineStore('budgets', {
  state: () => ({
    budgets: [] // { id, category, monthlyLimit }  (category "" = overall)
  }),
  getters: {
    overall(state) { return state.budgets.find(b => !b.category) || null },
    byCategory(state) { return state.budgets.filter(b => b.category) }
  },
  actions: {
    async load() {
      try {
        this.budgets = await api.listBudgets()
      } catch (e) { /* handled by interceptor */ }
    },
    async upsert(category, monthlyLimit) {
      try {
        await api.upsertBudget({ category: category || '', monthlyLimit })
        await this.load()
        toast.success('Budget saved')
      } catch (e) { /* handled by interceptor */ }
    },
    async remove(id) {
      try {
        await api.deleteBudget(id)
        await this.load()
        toast.success('Budget removed')
      } catch (e) { /* handled by interceptor */ }
    }
  }
})
