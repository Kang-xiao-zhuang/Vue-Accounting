<template>
  <div class="card chart-card">
    <div class="chart-head">
      <h2>{{ $t('chart.breakdown') }}</h2>
      <div class="chart-toggle">
        <button :class="{ active: chartType === 'expense' }" @click="chartType = 'expense'">{{ $t('common.expense') }}</button>
        <button :class="{ active: chartType === 'income' }" @click="chartType = 'income'">{{ $t('common.income') }}</button>
      </div>
    </div>

    <div v-if="breakdown.length === 0" class="empty">{{ $t('chart.noData', { type: $t('common.' + chartType) }) }}</div>

    <div v-else class="chart-body">
      <div class="donut-wrap">
        <svg viewBox="0 0 200 200" width="180" height="180">
          <g transform="rotate(-90 100 100)">
            <circle
              v-for="s in donutSlices"
              :key="s.category"
              cx="100" cy="100" r="70" fill="none"
              :stroke="s.color" stroke-width="30"
              :stroke-dasharray="s.dash + ' ' + (circumference - s.dash)"
              :stroke-dashoffset="s.offset"
            />
          </g>
        </svg>
        <div class="donut-center">
          <div class="dc-label">{{ $t('chart.total', { type: $t('common.' + chartType) }) }}</div>
          <div class="dc-value" :style="{ color: chartType === 'expense' ? 'var(--expense)' : 'var(--income)' }">
            {{ money(chartTotal) }}
          </div>
        </div>
      </div>

      <div class="legend">
        <div class="legend-row" v-for="s in breakdown" :key="s.category">
          <span class="legend-dot" :style="{ background: s.color }"></span>
          <span class="lg-cat">{{ s.icon }} {{ $catLabel(s.category) }}</span>
          <span class="lg-pct">{{ s.percent.toFixed(0) }}%</span>
          <span class="lg-amt">{{ money(s.amount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { palette, iconFor } from '../categories'
import { sumAmount } from '../utils'
import { money } from '../currency'

export default {
  name: 'CategoryChart',
  props: {
    records: { type: Array, default: () => [] }
  },
  data() {
    return { chartType: 'expense', circumference: 2 * Math.PI * 70 }
  },
  methods: { money },
  computed: {
    chartTotal() {
      return sumAmount(this.records.filter(r => r.type === this.chartType))
    },
    breakdown() {
      const cents = {}
      this.records
        .filter(r => r.type === this.chartType)
        .forEach(r => { cents[r.category] = (cents[r.category] || 0) + Math.round(Number(r.amount) * 100) })
      const totalCents = Object.values(cents).reduce((s, c) => s + c, 0) || 1
      return Object.keys(cents)
        .map(cat => ({
          category: cat,
          amount: cents[cat] / 100,
          percent: (cents[cat] / totalCents) * 100,
          icon: iconFor(this.chartType, cat)
        }))
        .sort((a, b) => b.amount - a.amount)
        .map((s, i) => ({ ...s, color: palette[i % palette.length] }))
    },
    donutSlices() {
      let cumulative = 0
      return this.breakdown.map(s => {
        const dash = (s.percent / 100) * this.circumference
        const slice = { ...s, dash, offset: -cumulative }
        cumulative += dash
        return slice
      })
    }
  }
}
</script>

<style scoped>
.chart-card { margin-bottom: 20px; }
.chart-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.chart-head h2 { font-size: 17px; }
.chart-toggle { display: flex; gap: 6px; }
.chart-toggle button {
  padding: 5px 12px; font-size: 13px; font-weight: 600; cursor: pointer;
  border-radius: 8px; border: 1px solid var(--border);
  background: var(--input); color: var(--muted); transition: .15s;
}
.chart-toggle button.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.chart-body { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.donut-wrap { position: relative; width: 180px; height: 180px; flex-shrink: 0; margin: 0 auto; }
.donut-center {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; pointer-events: none;
}
.donut-center .dc-label { font-size: 12px; color: var(--muted); }
.donut-center .dc-value { font-size: 20px; font-weight: 700; }
.legend { flex: 1; min-width: 200px; }
.legend-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; font-size: 14px; }
.legend-dot { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
.legend-row .lg-cat { flex: 1; }
.legend-row .lg-pct { color: var(--muted); font-size: 13px; margin-left: 8px; }
.legend-row .lg-amt { font-weight: 600; white-space: nowrap; }
</style>
