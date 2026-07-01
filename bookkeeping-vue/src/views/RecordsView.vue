<template>
  <div>
    <h2 class="view-title">{{ $t('rec.title') }}</h2>
    <WeatherCard />
    <BudgetAlert />
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
import BudgetAlert from '../components/BudgetAlert.vue'
import WeatherCard from '../components/WeatherCard.vue'
import { useRecordsStore } from '../stores/records'
import { useUiStore } from '../stores/ui'

export default {
  name: 'RecordsView',
  components: { PeriodNav, SummaryCards, RecordList, BudgetAlert, WeatherCard },
  setup() {
    return { store: useRecordsStore(), ui: useUiStore() }
  }
}
</script>
