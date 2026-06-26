<template>
  <div>
    <h2 class="view-title">Records</h2>
    <PeriodNav
      :period="period"
      :label="periodLabel"
      :is-current="isCurrent"
      @update:period="$emit('update:period', $event)"
      @shift="$emit('shift', $event)"
      @today="$emit('today')"
    />
    <SummaryCards :income="income" :expense="expense" :balance="balance" />
    <RecordList :records="records" @edit="$emit('edit', $event)" @remove="$emit('remove', $event)" />
  </div>
</template>

<script>
import PeriodNav from '../components/PeriodNav.vue'
import SummaryCards from '../components/SummaryCards.vue'
import RecordList from '../components/RecordList.vue'

export default {
  name: 'RecordsView',
  components: { PeriodNav, SummaryCards, RecordList },
  props: {
    period: String,
    periodLabel: String,
    isCurrent: Boolean,
    income: Number,
    expense: Number,
    balance: Number,
    records: { type: Array, default: () => [] }
  },
  emits: ['update:period', 'shift', 'today', 'edit', 'remove']
}
</script>
