<template>
  <div>
    <div class="stats-head">
      <h2 class="view-title">{{ $t('stats.title') }}</h2>
      <router-link class="budget-link" to="/budgets">{{ $t('stats.budgets') }}</router-link>
    </div>
    <PeriodNav
      :period="store.period"
      :label="store.periodLabel"
      :is-current="store.isCurrentPeriod"
      @update:period="store.setPeriod"
      @shift="store.shift"
      @today="store.goToday"
    />
    <SummaryCards :income="store.totalIncome" :expense="store.totalExpense" :balance="store.balance" />
    <CategoryChart :records="store.periodRecords" />
    <TrendChart :records="store.records" />
  </div>
</template>

<script>
import PeriodNav from '../components/PeriodNav.vue'
import SummaryCards from '../components/SummaryCards.vue'
import CategoryChart from '../components/CategoryChart.vue'
import TrendChart from '../components/TrendChart.vue'
import { useRecordsStore } from '../stores/records'

export default {
  name: 'StatsView',
  components: { PeriodNav, SummaryCards, CategoryChart, TrendChart },
  setup() {
    return { store: useRecordsStore() }
  }
}
</script>

<style scoped>
.stats-head { display: flex; align-items: center; justify-content: space-between; }
.stats-head .view-title { margin-bottom: 0; }
.budget-link {
  text-decoration: none; font-size: 13px; font-weight: 600;
  color: var(--primary); background: var(--input); border: 1px solid var(--border);
  padding: 6px 12px; border-radius: 999px;
}
.budget-link:hover { border-color: var(--primary); }
</style>
