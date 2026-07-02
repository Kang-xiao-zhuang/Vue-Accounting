<template>
  <div>
    <div class="more-subhead">
      <button class="page-back" @click="$router.back()" aria-label="Back">‹</button>
      <h2 class="view-title">{{ $t('history.title') }}</h2>
      <span class="count">{{ $t('history.count', { n: total }) }}</span>
    </div>

    <div class="filters">
      <input class="search" v-model="q" :placeholder="$t('rec.search')" @input="onFilter" />
      <select class="filter" v-model="type" @change="applyNow">
        <option value="all">{{ $t('common.all') }}</option>
        <option value="expense">{{ $t('common.expense') }}</option>
        <option value="income">{{ $t('common.income') }}</option>
      </select>
    </div>
    <div class="date-row">
      <label>{{ $t('history.from') }} <input type="date" v-model="from" @change="applyNow" /></label>
      <label>{{ $t('history.to') }} <input type="date" v-model="to" @change="applyNow" /></label>
    </div>

    <div v-if="loading" class="app-loading"><span class="spinner"></span></div>

    <template v-else>
      <div v-if="items.length === 0" class="empty">{{ $t('history.empty') }}</div>

      <div v-for="r in items" :key="r.id" class="record">
        <div class="icon">{{ iconFor(r.type, r.category) }}</div>
        <div class="info">
          <div class="cat">{{ $catLabel(r.category) }}</div>
          <div class="meta">{{ dateLabel(r.date) }}<span v-if="r.note"> · {{ r.note }}</span></div>
        </div>
        <div class="amt" :class="r.type">{{ r.type === 'income' ? '+' : '-' }}{{ money(r.amount) }}</div>
        <button class="del" :aria-label="'Delete ' + r.category" @click="remove(r)">✕</button>
      </div>

      <div v-if="pages > 1" class="pager">
        <button class="pg" :disabled="page <= 1" @click="go(page - 1)">‹</button>
        <span class="pg-info">{{ $t('history.pageOf', { c: page, p: pages }) }}</span>
        <button class="pg" :disabled="page >= pages" @click="go(page + 1)">›</button>
      </div>
    </template>
  </div>
</template>

<script>
import api from '../api'
import { iconFor } from '../categories'
import { money } from '../currency'
import { localeDate, catLabel } from '../i18n'
import { confirmDialog } from '../confirm'
import { toast } from '../toast'

export default {
  name: 'HistoryView',
  data() {
    return { items: [], total: 0, pages: 1, page: 1, size: 20, q: '', type: 'all', from: '', to: '', loading: false }
  },
  methods: {
    money,
    iconFor,
    dateLabel(d) { return localeDate(d, { year: 'numeric', month: 'short', day: 'numeric' }) },
    async fetch() {
      this.loading = true
      try {
        const params = { page: this.page, size: this.size }
        if (this.type !== 'all') params.type = this.type
        if (this.q.trim()) params.q = this.q.trim()
        if (this.from) params.from = this.from
        if (this.to) params.to = this.to
        const res = await api.recordsPage(params)
        this.items = res.records || []
        this.total = res.total || 0
        this.pages = res.pages || 1
      } catch (e) { /* handled by interceptor */ }
      finally { this.loading = false }
    },
    applyNow() { this.page = 1; this.fetch() },
    onFilter() {
      clearTimeout(this._timer)
      this._timer = setTimeout(() => this.applyNow(), 350)
    },
    go(p) { this.page = p; this.fetch() },
    async remove(r) {
      const ok = await confirmDialog(catLabel(r.category) + ' · ' + r.date, { danger: true, confirmText: this.$t('common.delete') })
      if (!ok) return
      try {
        await api.remove(r.id)
        toast.success(this.$t('toast.recordDeleted'))
        if (this.items.length === 1 && this.page > 1) this.page--
        this.fetch()
      } catch (e) { /* handled by interceptor */ }
    }
  },
  mounted() { this.fetch() }
}
</script>

<style scoped>
.more-subhead { display: flex; align-items: center; gap: 10px; margin: 4px 0 14px; }
.more-subhead .view-title { margin: 0; flex: 1; }
.count { font-size: 13px; color: var(--muted); }

.filters { display: flex; gap: 8px; margin-bottom: 10px; }
.search { flex: 1; min-width: 0; }
.filter { width: auto; padding: 8px 10px; font-size: 13px; border-radius: 8px; border: 1px solid var(--border); }
.date-row { display: flex; gap: 10px; margin-bottom: 14px; }
.date-row label { flex: 1; font-size: 12px; color: var(--muted); display: flex; flex-direction: column; gap: 4px; }

.record { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
.icon { width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 19px; background: var(--input); }
.info { flex: 1; min-width: 0; }
.cat { font-weight: 600; font-size: 15px; }
.meta { font-size: 12px; color: var(--muted); margin-top: 2px; }
.amt { font-weight: 700; font-size: 16px; white-space: nowrap; }
.amt.income { color: var(--income); }
.amt.expense { color: var(--expense); }
.del { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 18px; padding: 4px 8px; border-radius: 6px; }
.del:hover { color: var(--expense); background: rgba(255, 107, 122, 0.12); }

.pager { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; }
.pg {
  width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--border);
  background: var(--card); color: var(--text); font-size: 16px; cursor: pointer;
}
.pg:disabled { opacity: .4; cursor: not-allowed; }
.pg:hover:not(:disabled) { border-color: var(--primary); }
.pg-info { font-size: 14px; color: var(--muted); }
</style>
