<template>
  <div class="card mc-card">
    <div class="chart-head">
      <h2>{{ $t('mcompare.title') }}</h2>
      <span class="mc-sub">{{ $t('mcompare.vsLast') }}</span>
    </div>

    <div class="mc-rows">
      <div class="mc-row" v-for="m in metrics" :key="m.key">
        <div class="mc-left">
          <div class="mc-label">{{ m.label }}</div>
          <div class="mc-last">{{ $t('mcompare.lastMonth') }} {{ money(m.last) }}</div>
        </div>
        <div class="mc-right">
          <div class="mc-now" :style="{ color: m.color }">{{ money(m.now) }}</div>
          <div class="mc-delta" :style="{ color: m.deltaColor }">{{ m.deltaText }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { todayString, round2 } from '../utils'
import { money } from '../currency'
import { t } from '../i18n'

export default {
  name: 'MonthCompare',
  props: {
    records: { type: Array, default: () => [] }
  },
  computed: {
    totals() {
      const now = new Date(todayString() + 'T00:00:00')
      const key = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
      const thisKey = key(now)
      const lastKey = key(new Date(now.getFullYear(), now.getMonth() - 1, 1))
      const acc = {
        [thisKey]: { income: 0, expense: 0 },
        [lastKey]: { income: 0, expense: 0 }
      }
      for (const r of this.records) {
        const b = acc[r.date.slice(0, 7)]
        if (!b) continue
        const c = Math.round(Number(r.amount) * 100)
        if (r.type === 'income') b.income += c
        else b.expense += c
      }
      return { now: acc[thisKey], last: acc[lastKey] }
    },
    metrics() {
      const rows = [
        { key: 'expense', label: t('common.expense'), up: 'var(--expense)', down: 'var(--income)', color: 'var(--expense)' },
        { key: 'income', label: t('common.income'), up: 'var(--income)', down: 'var(--expense)', color: 'var(--income)' }
      ]
      return rows.map(r => {
        const now = round2(this.totals.now[r.key] / 100)
        const last = round2(this.totals.last[r.key] / 100)
        return { ...r, now, last, ...this.delta(now, last, r) }
      })
    }
  },
  methods: {
    money,
    delta(now, last, r) {
      if (last === 0) {
        const isUp = now > 0
        return {
          deltaText: isUp ? t('mcompare.new') : '—',
          deltaColor: isUp ? r.up : 'var(--muted)'
        }
      }
      const pct = ((now - last) / last) * 100
      const rounded = Math.round(pct)
      if (rounded === 0) return { deltaText: '±0%', deltaColor: 'var(--muted)' }
      const isUp = rounded > 0
      return {
        deltaText: (isUp ? '▲ +' : '▼ ') + rounded + '%',
        deltaColor: isUp ? r.up : r.down
      }
    }
  }
}
</script>

<style scoped>
.mc-card { margin-bottom: 20px; }
.chart-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; }
.chart-head h2 { font-size: 17px; }
.mc-sub { font-size: 12px; color: var(--muted); }

.mc-rows { display: flex; flex-direction: column; gap: 10px; }
.mc-row {
  display: flex; justify-content: space-between; align-items: center;
  background: var(--input); border-radius: 12px; padding: 12px 14px;
}
.mc-left .mc-label { font-size: 14px; font-weight: 600; }
.mc-left .mc-last { font-size: 12px; color: var(--muted); margin-top: 3px; }
.mc-right { text-align: right; }
.mc-right .mc-now { font-size: 18px; font-weight: 700; }
.mc-right .mc-delta { font-size: 12px; font-weight: 700; margin-top: 2px; }
</style>
