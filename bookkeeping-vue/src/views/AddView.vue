<template>
  <div>
    <div class="add-head">
      <h2 class="view-title">{{ $t('add.title') }}</h2>
      <router-link class="recurring-link" to="/recurring">{{ $t('add.recurring') }}</router-link>
    </div>

    <div class="type-toggle">
      <button :class="{ 'active-expense': type === 'expense' }" @click="type = 'expense'">{{ $t('common.expense') }}</button>
      <button :class="{ 'active-income': type === 'income' }" @click="type = 'income'">{{ $t('common.income') }}</button>
    </div>

    <p class="hint">{{ $t('add.hint', { type: $t('common.' + type) }) }}</p>

    <div v-if="frequent.length" class="fav-wrap">
      <div class="fav-label">{{ $t('add.frequent') }}</div>
      <div class="cat-grid">
        <button
          v-for="c in frequent"
          :key="'fav-' + c.name"
          class="cat-btn"
          @click="ui.openForCategory({ type, category: c.name })"
        >
          <span class="ci">{{ c.icon }}</span>
          <span class="cn">{{ $catLabel(c.name) }}</span>
        </button>
      </div>
    </div>

    <div class="cat-grid">
      <button
        v-for="c in categories[type]"
        :key="c.name"
        class="cat-btn"
        @click="ui.openForCategory({ type, category: c.name })"
      >
        <span class="ci">{{ c.icon }}</span>
        <span class="cn">{{ $catLabel(c.name) }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { categories } from '../categories'
import { useUiStore } from '../stores/ui'
import { useRecordsStore } from '../stores/records'

export default {
  name: 'AddView',
  setup() {
    return { ui: useUiStore(), records: useRecordsStore() }
  },
  data() {
    return { categories, type: 'expense' }
  },
  computed: {
    // Top categories for the current type by past usage, most-used first (max 6).
    frequent() {
      const counts = this.records.categoryCounts
      return this.categories[this.type]
        .map(c => ({ c, n: counts[this.type + '::' + c.name] || 0 }))
        .filter(x => x.n > 0)
        .sort((a, b) => b.n - a.n)
        .slice(0, 6)
        .map(x => x.c)
    }
  }
}
</script>

<style scoped>
.add-head { display: flex; align-items: center; justify-content: space-between; }
.add-head .view-title { margin-bottom: 0; }
.recurring-link {
  text-decoration: none; font-size: 13px; font-weight: 600;
  color: var(--primary); background: var(--input); border: 1px solid var(--border);
  padding: 6px 12px; border-radius: 999px;
}
.recurring-link:hover { border-color: var(--primary); }

.type-toggle { display: flex; gap: 8px; margin-bottom: 12px; }
.type-toggle button {
  flex: 1; padding: 11px; border: 1px solid var(--border);
  background: var(--input); border-radius: 10px; cursor: pointer;
  font-size: 15px; font-weight: 600; color: var(--muted); transition: .15s;
}
.type-toggle button.active-expense { background: var(--expense); color: #fff; border-color: var(--expense); }
.type-toggle button.active-income { background: var(--income); color: #fff; border-color: var(--income); }

.hint { font-size: 13px; color: var(--muted); margin-bottom: 14px; }

.fav-wrap { margin-bottom: 16px; }
.fav-label {
  font-size: 12px; font-weight: 700; color: var(--muted);
  letter-spacing: .04em; margin-bottom: 8px;
}
.fav-wrap .cat-grid { margin-bottom: 4px; }

.cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 10px; }
.cat-btn {
  background: var(--card); border: 1px solid var(--border); border-radius: 14px;
  padding: 12px 4px; cursor: pointer; color: var(--text);
  display: flex; flex-direction: column; align-items: center; gap: 6px; transition: .12s;
}
.cat-btn:hover { border-color: var(--primary); transform: translateY(-2px); }
.cat-btn:active { transform: scale(0.96); }
.cat-btn .ci { font-size: 26px; line-height: 1; }
.cat-btn .cn { font-size: 11px; color: var(--muted); text-align: center; line-height: 1.2; }
</style>
