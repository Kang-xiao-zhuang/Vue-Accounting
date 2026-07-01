<template>
  <div v-if="overspends.length" class="budget-alert">
    <div class="ba-row" v-for="o in overspends" :key="o.key">
      <span class="ba-ico">⚠️</span>
      <span class="ba-text">
        <strong>{{ o.label }}</strong> over budget by {{ money(o.over) }}
        <span class="ba-sub">({{ money(o.spend) }} / {{ money(o.limit) }})</span>
      </span>
    </div>
  </div>
</template>

<script>
import { sumAmount, round2, todayString } from '../utils'
import { money } from '../currency'
import { useBudgetsStore } from '../stores/budgets'
import { useRecordsStore } from '../stores/records'

export default {
  name: 'BudgetAlert',
  setup() {
    return { budgets: useBudgetsStore(), records: useRecordsStore() }
  },
  computed: {
    monthExpenses() {
      const month = todayString().slice(0, 7)
      return this.records.records.filter(r => r.type === 'expense' && r.date.slice(0, 7) === month)
    },
    overspends() {
      const list = []
      const overall = this.budgets.overall
      if (overall) {
        const spend = sumAmount(this.monthExpenses)
        const limit = Number(overall.monthlyLimit)
        if (spend > limit) list.push({ key: 'overall', label: 'Overall', spend, limit, over: round2(spend - limit) })
      }
      for (const b of this.budgets.byCategory) {
        const spend = sumAmount(this.monthExpenses.filter(r => r.category === b.category))
        const limit = Number(b.monthlyLimit)
        if (spend > limit) list.push({ key: b.category, label: b.category, spend, limit, over: round2(spend - limit) })
      }
      return list
    }
  },
  methods: { money }
}
</script>

<style scoped>
.budget-alert {
  background: rgba(255, 107, 122, 0.12);
  border: 1px solid var(--expense);
  border-radius: 12px; padding: 10px 12px; margin-bottom: 14px;
  display: flex; flex-direction: column; gap: 6px;
}
.ba-row { display: flex; align-items: baseline; gap: 8px; font-size: 13px; color: var(--text); }
.ba-ico { flex-shrink: 0; }
.ba-text { flex: 1; }
.ba-sub { color: var(--muted); font-size: 12px; }
</style>
