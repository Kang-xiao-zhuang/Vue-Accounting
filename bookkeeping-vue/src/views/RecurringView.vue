<template>
  <div>
    <div class="sub-head">
      <button class="back" @click="$router.back()" aria-label="Back">‹</button>
      <h2 class="view-title">{{ $t('recur.title') }}</h2>
      <button class="run-btn" @click="runNow">{{ $t('recur.runNow') }}</button>
    </div>

    <!-- Add / edit form -->
    <div class="card form-card">
      <div class="form-head">
        <span>{{ editingId ? $t('recur.editRule') : $t('recur.newRule') }}</span>
        <button v-if="editingId" class="cancel-link" @click="resetForm">{{ $t('common.cancel') }}</button>
      </div>
      <div class="type-toggle">
        <button :class="{ 'active-expense': form.type === 'expense' }" @click="setType('expense')">{{ $t('common.expense') }}</button>
        <button :class="{ 'active-income': form.type === 'income' }" @click="setType('income')">{{ $t('common.income') }}</button>
      </div>
      <div class="grid2">
        <div>
          <label>{{ $t('common.category') }}</label>
          <select v-model="form.category">
            <option v-for="c in categories[form.type]" :key="c.name" :value="c.name">{{ c.icon }} {{ $catLabel(c.name) }}</option>
          </select>
        </div>
        <div>
          <label>{{ $t('common.amount') }}</label>
          <input type="number" min="0" step="0.01" v-model.number="form.amount" placeholder="0" />
        </div>
        <div>
          <label>{{ $t('recur.frequency') }}</label>
          <select v-model="form.frequency">
            <option value="DAILY">{{ $t('recur.daily') }}</option>
            <option value="WEEKLY">{{ $t('recur.weekly') }}</option>
            <option value="MONTHLY">{{ $t('recur.monthly') }}</option>
          </select>
        </div>
        <div>
          <label>{{ $t('recur.nextRun') }}</label>
          <input type="date" v-model="form.nextRunDate" />
        </div>
      </div>
      <input class="note" type="text" v-model="form.note" :placeholder="$t('recur.notePh')" maxlength="255" />
      <button class="btn-primary" :disabled="!(form.amount > 0)" @click="submit">{{ editingId ? $t('recur.saveBtn') : $t('recur.addBtn') }}</button>
    </div>

    <div v-if="store.rules.length === 0" class="empty">{{ $t('recur.none') }}</div>

    <div v-for="r in store.rules" :key="r.id" class="card rule" :class="{ paused: !r.active }">
      <div class="rule-icon">{{ icon(r.type, r.category) }}</div>
      <div class="rule-info">
        <div class="rule-top">
          <span class="rule-cat">{{ $catLabel(r.category) }}</span>
          <span class="rule-amt" :class="r.type">{{ r.type === 'income' ? '+' : '-' }}{{ money(r.amount) }}</span>
        </div>
        <div class="rule-meta">{{ freqLabel(r.frequency) }} · {{ $t('recur.nextLabel', { date: r.nextRunDate }) }}<span v-if="r.note"> · {{ r.note }}</span></div>
      </div>
      <button class="edit" title="Edit" :aria-label="'Edit recurring ' + r.category" @click="startEdit(r)">✎</button>
      <button class="toggle" :class="{ on: r.active }" :title="r.active ? 'Pause' : 'Resume'" @click="toggleActive(r)">{{ r.active ? '⏸' : '▶' }}</button>
      <button class="del" title="Delete" :aria-label="'Delete recurring ' + r.category" @click="store.remove(r.id)">🗑</button>
    </div>
  </div>
</template>

<script>
import { categories, iconFor } from '../categories'
import { todayString } from '../utils'
import { money } from '../currency'
import { t } from '../i18n'
import { toast } from '../toast'
import { useRecurringStore } from '../stores/recurring'
import { useRecordsStore } from '../stores/records'

export default {
  name: 'RecurringView',
  setup() {
    return { store: useRecurringStore(), records: useRecordsStore() }
  },
  data() {
    return {
      categories,
      editingId: null,
      form: { type: 'expense', category: categories.expense[0].name, amount: null, frequency: 'MONTHLY', nextRunDate: todayString(), note: '', active: true }
    }
  },
  methods: {
    money,
    icon: iconFor,
    freqLabel(f) { return t('recur.' + String(f).toLowerCase()) },
    setType(t) {
      this.form.type = t
      if (!categories[t].some(c => c.name === this.form.category)) {
        this.form.category = categories[t][0].name
      }
    },
    resetForm() {
      this.editingId = null
      this.form = { type: 'expense', category: categories.expense[0].name, amount: null, frequency: 'MONTHLY', nextRunDate: todayString(), note: '', active: true }
    },
    submit() {
      if (!(this.form.amount > 0)) return
      const payload = {
        type: this.form.type, category: this.form.category, amount: this.form.amount,
        note: (this.form.note || '').trim(), frequency: this.form.frequency,
        nextRunDate: this.form.nextRunDate, active: this.form.active
      }
      if (this.editingId) this.store.update(this.editingId, payload)
      else this.store.create(payload)
      this.resetForm()
    },
    startEdit(r) {
      this.editingId = r.id
      this.form = {
        type: r.type, category: r.category, amount: r.amount, frequency: r.frequency,
        nextRunDate: r.nextRunDate, note: r.note || '', active: r.active
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    toggleActive(r) {
      this.store.update(r.id, {
        type: r.type, category: r.category, amount: r.amount, note: r.note,
        frequency: r.frequency, nextRunDate: r.nextRunDate, active: !r.active
      })
    },
    async runNow() {
      const created = await this.store.run()
      await this.records.load()
      await this.store.load()
      toast.success(created > 0 ? t('recur.created', { n: created }) : t('recur.nothingDue'))
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
.run-btn {
  padding: 7px 12px; border-radius: 9px; border: 1px solid var(--primary);
  background: var(--input); color: var(--primary); font-size: 13px; font-weight: 600; cursor: pointer;
}
.run-btn:hover { background: var(--primary); color: #fff; }

.form-card { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.type-toggle { display: flex; gap: 8px; }
.type-toggle button {
  flex: 1; padding: 10px; border: 1px solid var(--border);
  background: var(--input); border-radius: 10px; cursor: pointer;
  font-size: 14px; font-weight: 600; color: var(--muted); transition: .15s;
}
.type-toggle button.active-expense { background: var(--expense); color: #fff; border-color: var(--expense); }
.type-toggle button.active-income { background: var(--income); color: #fff; border-color: var(--income); }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.grid2 label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 4px; }
.note { width: 100%; }
.btn-primary {
  padding: 12px; border: none; background: var(--primary); color: #fff;
  border-radius: 11px; font-size: 15px; font-weight: 700; cursor: pointer;
}
.btn-primary:hover:not(:disabled) { background: var(--primary-dark); }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }

.rule { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.rule.paused { opacity: .55; }
.rule-icon {
  width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; background: var(--input);
  display: flex; align-items: center; justify-content: center; font-size: 19px;
}
.rule-info { flex: 1; min-width: 0; }
.rule-top { display: flex; justify-content: space-between; gap: 8px; }
.rule-cat { font-weight: 600; }
.rule-amt { font-weight: 700; white-space: nowrap; }
.rule-amt.income { color: var(--income); }
.rule-amt.expense { color: var(--expense); }
.rule-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }
.edit, .toggle, .del {
  flex-shrink: 0; background: none; border: none; cursor: pointer;
  font-size: 16px; padding: 4px 6px; border-radius: 8px; color: var(--muted);
}
.toggle.on { color: var(--primary); }
.edit:hover, .toggle:hover, .del:hover { background: var(--input); }
.edit:hover { color: var(--primary); }
.del:hover { color: var(--expense); }

.form-head { display: flex; align-items: center; justify-content: space-between; font-size: 13px; font-weight: 700; color: var(--muted); }
.cancel-link { background: none; border: none; color: var(--primary); font-size: 13px; font-weight: 600; cursor: pointer; }
</style>
