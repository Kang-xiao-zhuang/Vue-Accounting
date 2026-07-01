<template>
  <div class="card trend-card">
    <div class="chart-head">
      <h2>{{ $t('trend.title') }}</h2>
      <div class="legend">
        <span class="lg"><span class="dot inc"></span>{{ $t('common.income') }}</span>
        <span class="lg"><span class="dot exp"></span>{{ $t('common.expense') }}</span>
      </div>
    </div>

    <div v-if="empty" class="empty">No data yet.</div>

    <div v-else class="trend">
      <div class="t-col" v-for="m in months" :key="m.key">
        <div class="t-bars">
          <div class="t-bar inc" :style="{ height: barH(m.income) }" :title="'Income ' + money(m.income)"></div>
          <div class="t-bar exp" :style="{ height: barH(m.expense) }" :title="'Expense ' + money(m.expense)"></div>
        </div>
        <div class="t-label">{{ m.label }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { todayString } from '../utils'
import { money } from '../currency'
import { localeDate } from '../i18n'

export default {
  name: 'TrendChart',
  props: {
    records: { type: Array, default: () => [] }
  },
  computed: {
    months() {
      const now = new Date(todayString() + 'T00:00:00')
      const buckets = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
        buckets.push({ key, label: localeDate(d, { month: 'short' }), incomeCents: 0, expenseCents: 0 })
      }
      const map = {}
      buckets.forEach(b => { map[b.key] = b })
      for (const r of this.records) {
        const b = map[r.date.slice(0, 7)]
        if (!b) continue
        const c = Math.round(Number(r.amount) * 100)
        if (r.type === 'income') b.incomeCents += c
        else b.expenseCents += c
      }
      return buckets.map(b => ({ key: b.key, label: b.label, income: b.incomeCents / 100, expense: b.expenseCents / 100 }))
    },
    maxVal() {
      let max = 0
      for (const m of this.months) max = Math.max(max, m.income, m.expense)
      return max
    },
    empty() {
      return this.maxVal === 0
    }
  },
  methods: {
    money,
    barH(v) {
      if (!v || this.maxVal === 0) return '0%'
      return Math.max(6, Math.round((v / this.maxVal) * 100)) + '%'
    }
  }
}
</script>

<style scoped>
.trend-card { margin-bottom: 20px; }
.chart-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.chart-head h2 { font-size: 17px; }
.legend { display: flex; gap: 12px; font-size: 12px; color: var(--muted); }
.legend .lg { display: flex; align-items: center; gap: 5px; }
.legend .dot { width: 10px; height: 10px; border-radius: 3px; }
.dot.inc, .t-bar.inc { background: var(--income); }
.dot.exp, .t-bar.exp { background: var(--expense); }

.trend { display: flex; align-items: flex-end; justify-content: space-between; gap: 6px; }
.t-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.t-bars { height: 130px; width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 4px; }
.t-bar { width: 14px; border-radius: 4px 4px 0 0; transition: height .3s ease; }
.t-label { font-size: 11px; color: var(--muted); }
</style>
