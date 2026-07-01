import { defineStore } from 'pinia'
import api from '../api'
import { toast } from '../toast'
import { fmt, weekRange, todayString, sumAmount, round2 } from '../utils'
import { t, localeDate } from '../i18n'

export const useRecordsStore = defineStore('records', {
  state: () => ({
    records: [],
    period: 'day',          // day | week | month | all
    anchor: todayString(),  // the date the current period is anchored on
    today: todayString()
  }),
  getters: {
    periodLabel(state) {
      const d = new Date(state.anchor + 'T00:00:00')
      if (state.period === 'day') {
        const pretty = localeDate(d, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
        return (state.anchor === state.today ? t('common.today') + ' · ' : '') + pretty
      } else if (state.period === 'week') {
        const { start, end } = weekRange(d)
        return fmt(start) + ' – ' + fmt(end)
      } else if (state.period === 'month') {
        return localeDate(d, { year: 'numeric', month: 'long' })
      }
      return t('common.all')
    },
    isCurrentPeriod(state) {
      if (state.period === 'all') return true
      if (state.period === 'month') return state.anchor.slice(0, 7) === state.today.slice(0, 7)
      if (state.period === 'week') {
        const a = weekRange(new Date(state.anchor + 'T00:00:00'))
        const n = weekRange(new Date(state.today + 'T00:00:00'))
        return fmt(a.start) === fmt(n.start)
      }
      return state.anchor === state.today
    },
    periodRecords(state) {
      if (state.period === 'all') return state.records
      const t = new Date(state.anchor + 'T00:00:00')
      if (state.period === 'day') {
        return state.records.filter(r => r.date === state.anchor)
      } else if (state.period === 'week') {
        const { start, end } = weekRange(t)
        const s = fmt(start), e = fmt(end)
        return state.records.filter(r => r.date >= s && r.date <= e)
      } else if (state.period === 'month') {
        const prefix = state.anchor.slice(0, 7)
        return state.records.filter(r => r.date.slice(0, 7) === prefix)
      }
      return state.records
    },
    totalIncome() {
      return sumAmount(this.periodRecords.filter(r => r.type === 'income'))
    },
    totalExpense() {
      return sumAmount(this.periodRecords.filter(r => r.type === 'expense'))
    },
    balance() {
      return round2(this.totalIncome - this.totalExpense)
    }
  },
  actions: {
    async load() {
      try {
        this.records = await api.list()
      } catch (e) { /* error toast shown by the axios interceptor */ }
    },
    setPeriod(p) { this.period = p },
    shift(dir) {
      const t = new Date(this.anchor + 'T00:00:00')
      if (this.period === 'day') t.setDate(t.getDate() + dir)
      else if (this.period === 'week') t.setDate(t.getDate() + dir * 7)
      else if (this.period === 'month') t.setMonth(t.getMonth() + dir)
      this.anchor = fmt(t)
    },
    goToday() { this.anchor = this.today },
    async create(payload) {
      try {
        await api.create(payload)
        await this.load()
        toast.success(t('toast.recordSaved'))
      } catch (e) { /* handled by interceptor */ }
    },
    async update(id, payload) {
      try {
        await api.update(id, payload)
        await this.load()
        toast.success(t('toast.recordUpdated'))
      } catch (e) { /* handled by interceptor */ }
    },
    async remove(id) {
      try {
        await api.remove(id)
        await this.load()
        toast.success(t('toast.recordDeleted'))
      } catch (e) { /* handled by interceptor */ }
    },
    async clear() {
      try {
        await api.clear()
        await this.load()
        toast.success(t('toast.recordsCleared'))
      } catch (e) { /* handled by interceptor */ }
    }
  }
})
