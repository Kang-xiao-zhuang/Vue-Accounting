<template>
  <div>
    <h2 class="view-title">Add Record</h2>

    <p v-if="!hasUser" class="error-banner">Add a user on the “Me” tab first, then tap a category to log a record.</p>

    <div class="type-toggle">
      <button :class="{ 'active-expense': type === 'expense' }" @click="type = 'expense'">Expense</button>
      <button :class="{ 'active-income': type === 'income' }" @click="type = 'income'">Income</button>
    </div>

    <p class="hint">Tap a category to add a {{ type }}.</p>

    <div class="cat-grid">
      <button
        v-for="c in categories[type]"
        :key="c.name"
        class="cat-btn"
        :disabled="!hasUser"
        @click="$emit('pick', { type, category: c.name })"
      >
        <span class="ci">{{ c.icon }}</span>
        <span class="cn">{{ c.name }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { categories } from '../categories'

export default {
  name: 'AddView',
  props: {
    hasUser: { type: Boolean, default: false }
  },
  emits: ['pick'],
  data() {
    return { categories, type: 'expense' }
  }
}
</script>

<style scoped>
.type-toggle { display: flex; gap: 8px; margin-bottom: 12px; }
.type-toggle button {
  flex: 1; padding: 11px; border: 1px solid var(--border);
  background: var(--input); border-radius: 10px; cursor: pointer;
  font-size: 15px; font-weight: 600; color: var(--muted); transition: .15s;
}
.type-toggle button.active-expense { background: var(--expense); color: #fff; border-color: var(--expense); }
.type-toggle button.active-income { background: var(--income); color: #fff; border-color: var(--income); }

.hint { font-size: 13px; color: var(--muted); margin-bottom: 14px; }

.cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.cat-btn {
  background: var(--card); border: 1px solid var(--border); border-radius: 14px;
  padding: 12px 4px; cursor: pointer; color: var(--text);
  display: flex; flex-direction: column; align-items: center; gap: 6px; transition: .12s;
}
.cat-btn:hover:not(:disabled) { border-color: var(--primary); transform: translateY(-2px); }
.cat-btn:active:not(:disabled) { transform: scale(0.96); }
.cat-btn:disabled { opacity: .45; cursor: not-allowed; }
.cat-btn .ci { font-size: 26px; line-height: 1; }
.cat-btn .cn { font-size: 11px; color: var(--muted); text-align: center; line-height: 1.2; }
</style>
