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
    </div>

    <div class="row2">
      <div class="field">
        <label>{{ $t('common.date') }}</label>
        <input type="date" v-model="form.date" />
      </div>
      <div class="field">
        <label>{{ $t('common.note') }}</label>
        <input type="text" v-model="form.note" :placeholder="$t('sheet.optional')" />
      </div>
    </div>

    <button class="sheet-save" @click="save">{{ editing ? $t('sheet.update') : $t('sheet.save') }}</button>
  </BottomSheet>
</template>

<script>
import { categories } from '../categories'
import { todayString } from '../utils'
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
</style>
