<template>
  <div>
    <h2 class="view-title">Records</h2>
    <PeriodNav
      :period="store.period"
      :label="store.periodLabel"
      :is-current="store.isCurrentPeriod"
      @update:period="store.setPeriod"
      @shift="store.shift"
      @today="store.goToday"
    />
    <SummaryCards :income="store.totalIncome" :expense="store.totalExpense" :balance="store.balance" />
    <RecordList :records="store.periodRecords" @edit="ui.openForEdit" @remove="store.remove" />
  </div>
</template>

<script>
import PeriodNav from '../components/PeriodNav.vue'
import SummaryCards from '../components/SummaryCards.vue'
import RecordList from '../components/RecordList.vue'
import { useRecordsStore } from '../stores/records'
import { useUiStore } from '../stores/ui'

export default {
  name: 'RecordsView',
  components: { PeriodNav, SummaryCards, RecordList },
  setup() {
    return { store: useRecordsStore(), ui: useUiStore() }
  }
}
</script>
