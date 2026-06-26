<template>
  <transition name="sheet">
    <div v-if="visible" class="sheet-overlay" @click.self="$emit('close')">
      <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <span class="sheet-title">{{ editing ? 'Edit Record' : 'New Record' }}</span>
          <button class="sheet-x" @click="$emit('close')">✕</button>
        </div>

        <div class="type-toggle">
          <button type="button" :class="{ 'active-expense': form.type === 'expense' }" @click="setType('expense')">Expense</button>
          <button type="button" :class="{ 'active-income': form.type === 'income' }" @click="setType('income')">Income</button>
        </div>

        <div class="field">
          <label>Category</label>
          <select v-model="form.category">
            <option v-for="c in categories[form.type]" :key="c.name" :value="c.name">{{ c.icon }} {{ c.name }}</option>
          </select>
        </div>

        <div class="field">
          <label>Amount</label>
          <input ref="amount" type="number" inputmode="decimal" v-model.number="form.amount" min="0" step="0.01" placeholder="0" />
        </div>

        <div class="row2">
          <div class="field">
            <label>Date</label>
            <input type="date" v-model="form.date" />
          </div>
          <div class="field">
            <label>Note</label>
            <input type="text" v-model="form.note" placeholder="Optional..." />
          </div>
        </div>

        <button class="sheet-save" @click="save">{{ editing ? '✓ Update' : '✓ Save' }}</button>
      </div>
    </div>
  </transition>
</template>

<script>
import { categories } from '../categories'
import { todayString } from '../utils'

export default {
  name: 'EntrySheet',
  props: {
    visible: { type: Boolean, default: false },
    editing: { type: Boolean, default: false },
    initial: { type: Object, default: null }
  },
  emits: ['save', 'close'],
  data() {
    return { categories, form: this.blank() }
  },
  watch: {
    visible(open) {
      if (open) {
        const i = this.initial
        this.form = i
          ? { type: i.type, category: i.category, amount: i.amount, date: i.date, note: i.note || '' }
          : this.blank()
        this.$nextTick(() => { if (this.$refs.amount) this.$refs.amount.focus() })
      }
    }
  },
  methods: {
    blank() {
      return { type: 'expense', category: categories.expense[0].name, amount: null, date: todayString(), note: '' }
    },
    setType(t) {
      this.form.type = t
      if (!categories[t].some(c => c.name === this.form.category)) {
        this.form.category = categories[t][0].name
      }
    },
    save() {
      if (!this.form.amount || this.form.amount <= 0) return
      this.$emit('save', {
        type: this.form.type,
        category: this.form.category,
        amount: this.form.amount,
        date: this.form.date,
        note: (this.form.note || '').trim()
      })
    }
  }
}
</script>

<style scoped>
.sheet-overlay {
  position: absolute; inset: 0; z-index: 30;
  background: rgba(0, 0, 0, 0.55);
  display: flex; align-items: flex-end;
}
.sheet {
  width: 100%; background: var(--card);
  border-radius: 20px 20px 0 0;
  padding: 10px 18px calc(18px + env(safe-area-inset-bottom));
  display: flex; flex-direction: column; gap: 12px;
}
.sheet-handle { width: 40px; height: 4px; border-radius: 2px; background: var(--border); margin: 4px auto 6px; }
.sheet-head { display: flex; align-items: center; justify-content: space-between; }
.sheet-title { font-size: 16px; font-weight: 700; }
.sheet-x { background: none; border: none; color: var(--muted); font-size: 18px; cursor: pointer; }
.field label { display: block; font-size: 13px; color: var(--muted); margin-bottom: 5px; }
.row2 { display: flex; gap: 12px; }
.row2 .field { flex: 1; }

.type-toggle { display: flex; gap: 8px; }
.type-toggle button {
  flex: 1; padding: 10px; border: 1px solid var(--border);
  background: var(--input); border-radius: 10px; cursor: pointer;
  font-size: 15px; font-weight: 600; color: var(--muted); transition: .15s;
}
.type-toggle button.active-expense { background: var(--expense); color: #fff; border-color: var(--expense); }
.type-toggle button.active-income { background: var(--income); color: #fff; border-color: var(--income); }

.sheet-save {
  margin-top: 4px; padding: 13px; border: none;
  background: var(--primary); color: #fff; border-radius: 11px;
  font-size: 16px; font-weight: 700; cursor: pointer;
}
.sheet-save:hover { background: var(--primary-dark); }

.sheet-enter-active, .sheet-leave-active { transition: opacity .2s; }
.sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform .25s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }
</style>
