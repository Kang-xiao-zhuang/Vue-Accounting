<template>
  <div class="card">
    <div class="list-header">
      <h2>Records</h2>
      <div class="list-actions">
        <button class="btn-export" @click="exportCSV" :disabled="filteredRecords.length === 0">⬇ Export CSV</button>
        <select class="filter" v-model="filter">
          <option value="all">All types</option>
          <option value="expense">Expense only</option>
          <option value="income">Income only</option>
        </select>
      </div>
    </div>

    <div v-if="filteredRecords.length === 0" class="empty">No records for this period. Start logging above!</div>

    <div v-for="r in filteredRecords" :key="r.id" class="record">
      <div class="icon">{{ iconFor(r.type, r.category) }}</div>
      <div class="info">
        <div class="cat">{{ r.category }}</div>
        <div class="meta">{{ r.date }}<span v-if="r.note"> · {{ r.note }}</span></div>
      </div>
      <div class="amt" :class="r.type">{{ r.type === 'income' ? '+' : '-' }}${{ money(r.amount) }}</div>
      <button class="edit" @click="$emit('edit', r)" title="Edit" :aria-label="'Edit ' + r.category">✎</button>
      <button class="del" @click="$emit('remove', r.id)" title="Delete" :aria-label="'Delete ' + r.category">✕</button>
    </div>
  </div>
</template>

<script>
import { iconFor } from '../categories'
import { formatMoney, sumAmount, round2 } from '../utils'

export default {
  name: 'RecordList',
  props: {
    records: { type: Array, default: () => [] }
  },
  emits: ['edit', 'remove'],
  data() {
    return { filter: 'all' }
  },
  computed: {
    filteredRecords() {
      const list = this.filter === 'all'
        ? this.records
        : this.records.filter(r => r.type === this.filter)
      return [...list].sort((a, b) =>
        a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id
      )
    },
    totals() {
      const inc = sumAmount(this.filteredRecords.filter(r => r.type === 'income'))
      const exp = sumAmount(this.filteredRecords.filter(r => r.type === 'expense'))
      return { inc, exp, bal: round2(inc - exp) }
    }
  },
  methods: {
    iconFor,
    money: formatMoney,
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
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 8px; flex-wrap: wrap; }
.list-header h2 { font-size: 17px; }
.list-actions { display: flex; gap: 8px; }
.filter { width: auto; padding: 6px 10px; font-size: 13px; border-radius: 8px; border: 1px solid var(--border); }
.btn-export {
  padding: 6px 12px; font-size: 13px; font-weight: 600; cursor: pointer;
  border-radius: 8px; border: 1px solid var(--primary);
  background: var(--input); color: var(--primary); transition: .15s;
}
.btn-export:hover:not(:disabled) { background: var(--primary); color: #fff; }
.btn-export:disabled { opacity: .5; cursor: not-allowed; }

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
