import { defineStore } from 'pinia'
import { todayString } from '../utils'

// Holds transient UI state — currently the global add/edit entry sheet.
export const useUiStore = defineStore('ui', {
  state: () => ({
    sheet: { open: false, editingId: null, initial: null }
  }),
  actions: {
    openForCategory({ type, category }) {
      this.sheet = {
        open: true,
        editingId: null,
        initial: { type, category, amount: null, date: todayString(), note: '' }
      }
    },
    openForEdit(record) {
      this.sheet = {
        open: true,
        editingId: record.id,
        initial: {
          type: record.type, category: record.category,
          amount: record.amount, date: record.date, note: record.note
        }
      }
    },
    close() {
      this.sheet = { open: false, editingId: null, initial: null }
    }
  }
})
