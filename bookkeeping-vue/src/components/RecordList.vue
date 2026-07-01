<template>
  <div class="card">
    <div class="list-header">
      <h2>{{ $t('rec.title') }}</h2>
      <button class="btn-export" @click="exportCSV" :disabled="filteredRecords.length === 0">{{ $t('rec.exportCsv') }}</button>
    </div>

    <div class="filters">
      <input class="search" v-model="search" :placeholder="$t('rec.search')" />
      <select class="filter" v-model="filter">
        <option value="all">{{ $t('common.all') }}</option>
        <option value="expense">{{ $t('common.expense') }}</option>
        <option value="income">{{ $t('common.income') }}</option>
      </select>
      <button class="adv-toggle" :class="{ active: showAdv }" @click="showAdv = !showAdv" :title="$t('rec.filterAmount')" :aria-label="$t('rec.filterAmount')">⚙</button>
    </div>

    <div v-if="showAdv" class="amount-filter">
      <input type="number" min="0" step="0.01" v-model.number="minAmt" :placeholder="$t('rec.min')" />
      <span class="dash">–</span>
      <input type="number" min="0" step="0.01" v-model.number="maxAmt" :placeholder="$t('rec.max')" />
      <button v-if="hasFilters" class="clear" @click="clearFilters">{{ $t('rec.clear') }}</button>
    </div>

    <div v-if="filteredRecords.length === 0" class="empty">
      {{ records.length ? $t('rec.emptyFiltered') : $t('rec.empty') }}
    </div>

    <template v-for="g in grouped" :key="g.date">
      <div class="day-head">
        <span class="day-date">{{ g.label }}</span>
        <span class="day-net" :class="g.net >= 0 ? 'income' : 'expense'">{{ g.net >= 0 ? '+' : '-' }}{{ money(Math.abs(g.net)) }}</span>
      </div>
      <div v-for="r in g.records" :key="r.id" class="record">
        <div class="icon">{{ iconFor(r.type, r.category) }}</div>
        <div class="info">
          <div class="cat">{{ $catLabel(r.category) }}</div>
          <div class="meta" v-if="r.note">{{ r.note }}</div>
        </div>
        <div class="amt" :class="r.type">{{ r.type === 'income' ? '+' : '-' }}{{ money(r.amount) }}</div>
        <button class="edit" @click="$emit('edit', r)" title="Edit" :aria-label="'Edit ' + r.category">✎</button>
        <button class="del" @click="$emit('remove', r.id)" title="Delete" :aria-label="'Delete ' + r.category">✕</button>
      </div>
    </template>
  </div>
</template>

<script>
import { iconFor } from '../categories'
import { sumAmount, round2 } from '../utils'
import { money, currencyState } from '../currency'
import { localeDate } from '../i18n'

export default {
  name: 'RecordList',
  props: {
    records: { type: Array, default: () => [] }
  },
  emits: ['edit', 'remove'],
  data() {
    return { filter: 'all', search: '', minAmt: '', maxAmt: '', showAdv: false }
  },
  computed: {
    hasFilters() {
      return this.filter !== 'all' || this.search.trim() !== '' || this.minAmt !== '' || this.maxAmt !== ''
    },
    filteredRecords() {
      let list = this.records
      if (this.filter !== 'all') list = list.filter(r => r.type === this.filter)

      const q = this.search.trim().toLowerCase()
      if (q) {
        list = list.filter(r =>
          (r.category || '').toLowerCase().includes(q) || (r.note || '').toLowerCase().includes(q))
      }
      const min = Number(this.minAmt)
      if (this.minAmt !== '' && !isNaN(min)) list = list.filter(r => Number(r.amount) >= min)
      const max = Number(this.maxAmt)
      if (this.maxAmt !== '' && !isNaN(max)) list = list.filter(r => Number(r.amount) <= max)

      return [...list].sort((a, b) =>
        a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id
      )
    },
    totals() {
      const inc = sumAmount(this.filteredRecords.filter(r => r.type === 'income'))
      const exp = sumAmount(this.filteredRecords.filter(r => r.type === 'expense'))
      return { inc, exp, bal: round2(inc - exp) }
    },
    grouped() {
      // filteredRecords is already sorted by date desc, so group consecutively.
      const out = []
      let cur = null
      for (const r of this.filteredRecords) {
        if (!cur || cur.date !== r.date) {
          cur = { date: r.date, label: this.dayLabel(r.date), records: [], incomeCents: 0, expenseCents: 0 }
          out.push(cur)
        }
        cur.records.push(r)
        const c = Math.round(Number(r.amount) * 100)
        if (r.type === 'income') cur.incomeCents += c
        else cur.expenseCents += c
      }
      return out.map(g => ({ ...g, net: (g.incomeCents - g.expenseCents) / 100 }))
    }
  },
  methods: {
    iconFor,
    money,
    dayLabel(d) {
      return localeDate(d, { weekday: 'short', month: 'short', day: 'numeric' })
    },
    clearFilters() {
      this.filter = 'all'
      this.search = ''
      this.minAmt = ''
      this.maxAmt = ''
    },
    exportCSV() {
      if (this.filteredRecords.length === 0) return
      const headers = ['Date', 'Type', 'Category', 'Amount', 'Note']
      const typeLabel = { income: 'Income', expense: 'Expense' }
      const escape = v => '"' + String(v).replace(/"/g, '""') + '"'
      const rows = this.filteredRecords.map(r =>
        [r.date, typeLabel[r.type], r.category, r.amount, r.note || ''].map(escape).join(',')
      )
      rows.push('')
      rows.push([escape('Total Income'), escape(this.totals.inc)].join(','))
      rows.push([escape('Total Expense'), escape(this.totals.exp)].join(','))
      rows.push([escape('Balance'), escape(this.totals.bal)].join(','))
      rows.push([escape('Currency'), escape(currencyState.symbol)].join(','))
      const csv = '﻿' + headers.map(escape).join(',') + '\n' + rows.join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bookkeeping_' + new Date().toISOString().slice(0, 10) + '.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }
}
</script>

<style scoped>
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 8px; }
.list-header h2 { font-size: 17px; }
.btn-export {
  padding: 6px 12px; font-size: 13px; font-weight: 600; cursor: pointer;
  border-radius: 8px; border: 1px solid var(--primary);
  background: var(--input); color: var(--primary); transition: .15s;
}
.btn-export:hover:not(:disabled) { background: var(--primary); color: #fff; }
.btn-export:disabled { opacity: .5; cursor: not-allowed; }

.filters { display: flex; gap: 8px; margin-bottom: 10px; }
.search { flex: 1; min-width: 0; }
.filter { width: auto; padding: 8px 10px; font-size: 13px; border-radius: 8px; border: 1px solid var(--border); }
.adv-toggle {
  width: 40px; flex-shrink: 0; border: 1px solid var(--border); background: var(--input);
  color: var(--muted); border-radius: 8px; font-size: 16px; cursor: pointer;
}
.adv-toggle.active, .adv-toggle:hover { color: var(--primary); border-color: var(--primary); }
.amount-filter { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.amount-filter input { flex: 1; min-width: 0; }
.amount-filter .dash { color: var(--muted); }
.amount-filter .clear {
  flex-shrink: 0; padding: 8px 12px; border: 1px solid var(--border); background: var(--input);
  color: var(--muted); border-radius: 8px; font-size: 13px; cursor: pointer;
}
.amount-filter .clear:hover { color: var(--expense); }

.day-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 0 5px; margin-top: 4px; border-bottom: 1px solid var(--border);
}
.day-date { font-size: 12px; font-weight: 700; color: var(--muted); letter-spacing: .3px; }
.day-net { font-size: 13px; font-weight: 700; }
.day-net.income { color: var(--income); }
.day-net.expense { color: var(--expense); }

.record { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
.record:last-child { border-bottom: none; }
.icon {
  width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 19px;
  background: var(--input);
}
.info { flex: 1; min-width: 0; }
.cat { font-weight: 600; font-size: 15px; }
.meta { font-size: 12px; color: var(--muted); margin-top: 2px; }
.amt { font-weight: 700; font-size: 16px; white-space: nowrap; }
.amt.income { color: var(--income); }
.amt.expense { color: var(--expense); }
.edit { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 6px; }
.edit:hover { color: var(--primary); background: rgba(109, 134, 255, 0.12); }
.del { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 18px; padding: 4px 8px; border-radius: 6px; }
.del:hover { color: var(--expense); background: rgba(255, 107, 122, 0.12); }
</style>
