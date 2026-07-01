<template>
  <div>
    <div class="sub-head">
      <button class="back" @click="$router.back()" aria-label="Back">‹</button>
      <h2 class="view-title">{{ $t('budget.title') }}</h2>
      <span class="month">{{ monthLabel }}</span>
    </div>

    <!-- Overall monthly budget -->
    <div class="card">
      <div class="row-top">
        <strong>{{ $t('budget.overall') }}</strong>
        <button v-if="store.overall" class="link-del" @click="store.remove(store.overall.id)">{{ $t('budget.remove') }}</button>
      </div>
      <template v-if="store.overall">
        <Bar :spend="overallSpend" :limit="num(store.overall.monthlyLimit)" />
        <div class="bar-cap">
          <span>{{ money(overallSpend) }} / {{ money(store.overall.monthlyLimit) }}</span>
          <span :class="{ over: overallSpend > num(store.overall.monthlyLimit) }">{{ remaining(overallSpend, store.overall.monthlyLimit) }}</span>
        </div>
      </template>
      <div class="set-row">
        <input type="number" min="0" step="0.01" v-model.number="overallInput" :placeholder="$t('budget.setLimit')" />
        <button class="btn-mini" :disabled="!(overallInput > 0)" @click="saveOverall">{{ $t('common.save') }}</button>
      </div>
    </div>

    <h3 class="section">{{ $t('budget.byCategory') }}</h3>

    <div v-if="store.byCategory.length === 0" class="empty">{{ $t('budget.none') }}</div>

    <div v-for="b in store.byCategory" :key="b.id" class="card cat-card">
      <div class="row-top">
        <span class="cat-name">{{ icon(b.category) }} {{ $catLabel(b.category) }}</span>
        <button class="link-del" @click="store.remove(b.id)">{{ $t('budget.remove') }}</button>
      </div>
      <Bar :spend="spendFor(b.category)" :limit="num(b.monthlyLimit)" />
      <div class="bar-cap">
        <span>{{ money(spendFor(b.category)) }} / {{ money(b.monthlyLimit) }}</span>
        <span :class="{ over: spendFor(b.category) > num(b.monthlyLimit) }">{{ remaining(spendFor(b.category), b.monthlyLimit) }}</span>
      </div>
    </div>

    <!-- Add a category budget -->
    <div class="card add-card">
      <select v-model="newCat">
        <option value="" disabled>{{ $t('budget.pick') }}</option>
        <option v-for="c in availableCategories" :key="c.name" :value="c.name">{{ c.icon }} {{ $catLabel(c.name) }}</option>
      </select>
      <input type="number" min="0" step="0.01" v-model.number="newAmount" :placeholder="$t('budget.limit')" />
      <button class="btn-mini" :disabled="!newCat || !(newAmount > 0)" @click="addCategory">{{ $t('budget.add') }}</button>
    </div>
  </div>
</template>

<script>
import { categories, iconFor } from '../categories'
import { sumAmount, todayString } from '../utils'
import { money } from '../currency'
import { t, localeDate } from '../i18n'
import { useBudgetsStore } from '../stores/budgets'
import { useRecordsStore } from '../stores/records'

// Small inline progress bar component.
const Bar = {
  name: 'Bar',
  props: { spend: Number, limit: Number },
  computed: {
    pct() { return this.limit > 0 ? Math.min(100, Math.round((this.spend / this.limit) * 100)) : 0 },
    color() {
      if (this.spend > this.limit) return 'var(--expense)'
      if (this.limit > 0 && this.spend / this.limit >= 0.8) return '#ffb84d'
      return 'var(--income)'
    }
  },
  template: `<div class="bbar"><div class="bbar-fill" :style="{ width: pct + '%', background: color }"></div></div>`
}

export default {
  name: 'BudgetsView',
  components: { Bar },
  setup() {
    return { store: useBudgetsStore(), records: useRecordsStore() }
  },
  data() {
    return { overallInput: null, newCat: '', newAmount: null }
  },
  computed: {
    month() { return todayString().slice(0, 7) },
    monthLabel() {
      return localeDate(todayString(), { year: 'numeric', month: 'long' })
    },
    monthExpenses() {
      return this.records.records.filter(r => r.type === 'expense' && r.date.slice(0, 7) === this.month)
    },
    overallSpend() { return sumAmount(this.monthExpenses) },
    availableCategories() {
      const taken = new Set(this.store.byCategory.map(b => b.category))
      return categories.expense.filter(c => !taken.has(c.name))
    }
  },
  methods: {
    money,
    icon(cat) { return iconFor('expense', cat) },
    num(v) { return Number(v) },
    spendFor(cat) { return sumAmount(this.monthExpenses.filter(r => r.category === cat)) },
    remaining(spend, limit) {
      const diff = Number(limit) - spend
      return diff >= 0 ? t('budget.left', { x: money(diff) }) : t('budget.over', { x: money(-diff) })
    },
    saveOverall() {
      if (!(this.overallInput > 0)) return
      this.store.upsert('', this.overallInput)
      this.overallInput = null
    },
    addCategory() {
      if (!this.newCat || !(this.newAmount > 0)) return
      this.store.upsert(this.newCat, this.newAmount)
      this.newCat = ''
      this.newAmount = null
    }
  },
  mounted() {
    this.store.load()
  }
}
</script>

<style scoped>
.sub-head { display: flex; align-items: center; gap: 10px; margin: 4px 0 14px; }
.sub-head .view-title { margin: 0; flex: 1; }
.back {
  width: 32px; height: 32px; border-radius: 9px; border: 1px solid var(--border);
  background: var(--card); color: var(--text); font-size: 20px; line-height: 1; cursor: pointer;
}
.back:hover { border-color: var(--primary); }
.month { font-size: 13px; color: var(--muted); }

.card { margin-bottom: 12px; }
.row-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.link-del { background: none; border: none; color: var(--muted); font-size: 12px; cursor: pointer; }
.link-del:hover { color: var(--expense); }
.cat-name { font-weight: 600; }

.bbar { height: 9px; background: var(--input); border-radius: 999px; overflow: hidden; }
.bbar-fill { height: 100%; border-radius: 999px; transition: width .3s ease; }
.bar-cap { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); margin-top: 6px; }
.bar-cap .over { color: var(--expense); font-weight: 700; }

.section { font-size: 14px; margin: 18px 0 10px; }
.set-row, .add-card { display: flex; gap: 8px; align-items: center; margin-top: 12px; }
.add-card input { flex: 1; }
.add-card select { flex: 1; }
.btn-mini {
  flex-shrink: 0; padding: 10px 14px; border: none; border-radius: 9px;
  background: var(--primary); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
}
.btn-mini:hover:not(:disabled) { background: var(--primary-dark); }
.btn-mini:disabled { opacity: .5; cursor: not-allowed; }
</style>
