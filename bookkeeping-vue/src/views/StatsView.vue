<template>
  <div>
    <h2 class="view-title">Statistics</h2>
    <PeriodNav
      :period="period"
      :label="periodLabel"
      :is-current="isCurrent"
      @update:period="$emit('update:period', $event)"
      @shift="$emit('shift', $event)"
      @today="$emit('today')"
    />
    <SummaryCards :income="income" :expense="expense" :balance="balance" />
    <CategoryChart :records="records" />
  </div>
</template>

<script>
import PeriodNav from '../components/PeriodNav.vue'
import SummaryCards from '../components/SummaryCards.vue'
import CategoryChart from '../components/CategoryChart.vue'

export default {
  name: 'StatsView',
  components: { PeriodNav, SummaryCards, CategoryChart },
  props: {
    period: String,
    periodLabel: String,
    isCurrent: Boolean,
    income: Number,
    expense: Number,
    balance: Number,
    records: { type: Array, default: () => [] }
  },
  emits: ['update:period', 'shift', 'today']
}
</script>
