import { defineStore } from 'pinia'
import api from '../api'
import { toast } from '../toast'

export const useRecurringStore = defineStore('recurring', {
  state: () => ({
    rules: []
  }),
  actions: {
    async load() {
      try {
        this.rules = await api.listRecurring()
      } catch (e) { /* handled by interceptor */ }
    },
    async create(rule) {
      try {
        await api.createRecurring(rule)
        await this.load()
        toast.success('Recurring rule added')
      } catch (e) { /* handled by interceptor */ }
    },
    async update(id, rule) {
      try {
        await api.updateRecurring(id, rule)
        await this.load()
      } catch (e) { /* handled by interceptor */ }
    },
    async remove(id) {
      try {
        await api.deleteRecurring(id)
        await this.load()
        toast.success('Recurring rule deleted')
      } catch (e) { /* handled by interceptor */ }
    },
    /** Catch up due occurrences. Returns the number of records created. */
    async run() {
      try {
        const res = await api.runRecurring()
        return res && res.created ? res.created : 0
      } catch (e) {
        return 0
      }
    }
  }
})
