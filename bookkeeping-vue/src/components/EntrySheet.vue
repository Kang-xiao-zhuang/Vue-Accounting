<template>
  <BottomSheet :visible="visible" :title="editing ? $t('sheet.edit') : $t('sheet.new')" @close="$emit('close')">
    <div class="type-toggle">
      <button type="button" :class="{ 'active-expense': form.type === 'expense' }" @click="setType('expense')">{{ $t('common.expense') }}</button>
      <button type="button" :class="{ 'active-income': form.type === 'income' }" @click="setType('income')">{{ $t('common.income') }}</button>
    </div>

    <div class="field">
      <label>{{ $t('common.category') }}</label>
      <select v-model="form.category">
        <option v-for="c in categories[form.type]" :key="c.name" :value="c.name">{{ c.icon }} {{ $catLabel(c.name) }}</option>
      </select>
    </div>

    <div class="field">
      <label>{{ $t('common.amount') }}</label>
      <input ref="amount" type="number" inputmode="decimal" v-model.number="form.amount" min="0" step="0.01" placeholder="0" />
      <div class="quick-amt">
        <button v-for="q in quickAmts" :key="q" type="button" @click="bumpAmount(q)">+{{ q }}</button>
        <button type="button" class="qa-clear" @click="form.amount = null" :aria-label="$t('sheet.clearAmount')">×</button>
      </div>
    </div>

    <div class="row2">
      <div class="field">
        <label>{{ $t('common.date') }}</label>
        <input type="date" v-model="form.date" />
      </div>
      <div class="field">
        <label>{{ $t('common.note') }}</label>
        <input type="text" v-model="form.note" :placeholder="$t('sheet.optional')" list="entry-note-suggestions" />
        <datalist id="entry-note-suggestions">
          <option v-for="n in noteSuggestions" :key="n" :value="n" />
        </datalist>
      </div>
    </div>

    <button class="sheet-save" @click="save">{{ editing ? $t('sheet.update') : $t('sheet.save') }}</button>
  </BottomSheet>
</template>

<script>
import { categories } from '../categories'
import { todayString, round2 } from '../utils'
import { useRecordsStore } from '../stores/records'
import BottomSheet from './BottomSheet.vue'

export default {
  name: 'EntrySheet',
  components: { BottomSheet },
  props: {
    visible: { type: Boolean, default: false },
    editing: { type: Boolean, default: false },
    initial: { type: Object, default: null }
  },
  emits: ['save', 'close'],
  setup() {
    return { records: useRecordsStore() }
  },
  data() {
    return { categories, quickAmts: [10, 50, 100, 500], form: this.blank() }
  },
  computed: {
    // Recent notes, with same-type+category ones surfaced first.
    noteSuggestions() {
      const all = this.records.recentNotes
      const sameCat = all.filter(x => x.type === this.form.type && x.category === this.form.category)
      const rest = all.filter(x => !(x.type === this.form.type && x.category === this.form.category))
      return [...sameCat, ...rest].map(x => x.note)
    }
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
    bumpAmount(q) {
      this.form.amount = round2((Number(this.form.amount) || 0) + q)
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
.field label { display: block; font-size: 13px; color: var(--muted); margin-bottom: 5px; }
.row2 { display: flex; gap: 12px; }
.row2 .field { flex: 1; }

.quick-amt { display: flex; gap: 6px; margin-top: 8px; }
.quick-amt button {
  flex: 1; padding: 7px 0; border: 1px solid var(--border);
  background: var(--input); color: var(--text); border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: .12s;
}
.quick-amt button:hover { border-color: var(--primary); color: var(--primary); }
.quick-amt .qa-clear { flex: 0 0 40px; color: var(--muted); font-size: 18px; line-height: 1; }
.quick-amt .qa-clear:hover { border-color: var(--expense); color: var(--expense); }

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
</style>
