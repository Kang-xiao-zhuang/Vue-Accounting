<template>
  <div class="summary">
    <div class="card">
      <div class="label">Income</div>
      <div class="value income">${{ income.toLocaleString() }}</div>
    </div>
    <div class="card">
      <div class="label">Expense</div>
      <div class="value expense">${{ expense.toLocaleString() }}</div>
    </div>
    <div class="card">
      <div class="label">Balance</div>
      <div class="value balance">${{ balance.toLocaleString() }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SummaryCards',
  props: {
    income: { type: Number, default: 0 },
    expense: { type: Number, default: 0 },
    balance: { type: Number, default: 0 }
  }
}
</script>

<style scoped>
.summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
.summary .card { text-align: center; }
.summary .label { font-size: 13px; color: var(--muted); margin-bottom: 6px; }
.value { font-size: 22px; font-weight: 700; }
.value.income { color: var(--income); }
.value.expense { color: var(--expense); }
.value.balance { color: var(--primary); }
</style>
