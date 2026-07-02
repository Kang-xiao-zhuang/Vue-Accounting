<template>
  <div>
    <div class="view-head">
      <button class="page-back" @click="$router.push('/more')" aria-label="Back to More">‹</button>
      <h2 class="view-title">{{ $t('habit.title') }}</h2>
      <button class="add-btn" :class="{ open: showForm }" @click="toggleForm" :title="showForm ? $t('common.cancel') : $t('habit.new')" :aria-label="$t('habit.new')">＋</button>
    </div>

    <!-- Add / edit form -->
    <div class="card form-card" v-if="showForm">
      <div class="form-row">
        <span class="icon-preview" :style="{ background: form.color }">{{ form.icon }}</span>
        <input ref="name" v-model="form.name" class="name-input" :placeholder="editingId ? $t('habit.editName') : $t('habit.newName')" maxlength="64" @keyup.enter="submit" />
      </div>

      <div class="picker-label">{{ $t('habit.icon') }}</div>
      <div class="icons">
        <button
          v-for="ic in habitIcons"
          :key="ic"
          class="icon-opt"
          :class="{ active: form.icon === ic }"
          @click="form.icon = ic"
        >{{ ic }}</button>
      </div>

      <div class="picker-label">{{ $t('habit.color') }}</div>
      <div class="swatches">
        <button
          v-for="c in colors"
          :key="c"
          class="swatch"
          :class="{ active: form.color === c }"
          :style="{ background: c }"
          :aria-label="'Pick color ' + c"
          @click="form.color = c"
        ></button>
      </div>

      <div class="picker-label">{{ $t('habit.weeklyGoal') }}</div>
      <div class="goal-pick">
        <button
          v-for="n in [0, 1, 2, 3, 4, 5, 6, 7]"
          :key="n"
          class="goal-opt"
          :class="{ active: form.weeklyTarget === n }"
          @click="form.weeklyTarget = n"
        >{{ n === 0 ? $t('habit.goalNone') : n }}</button>
      </div>

      <div class="form-actions">
        <button class="btn-primary" :disabled="!form.name.trim()" @click="submit">
          {{ editingId ? $t('habit.saveBtn') : $t('habit.addBtn') }}
        </button>
        <button class="btn-cancel" @click="cancel">{{ $t('common.cancel') }}</button>
      </div>
    </div>

    <div v-if="store.habits.length === 0 && !showForm" class="empty">{{ $t('habit.none') }}</div>

    <div v-if="store.habits.length > 0" class="habit-views">
      <button v-for="v in views" :key="v.key" :class="{ active: view === v.key }" @click="setView(v.key)">{{ $t(v.labelKey) }}</button>
    </div>

    <div v-if="view !== 'grid' && store.habits.length > 0" class="period-nav">
      <button class="nav-arrow" @click="shiftPeriod(-1)" aria-label="Previous">◀</button>
      <span class="period-label">{{ navLabel }}</span>
      <button class="nav-arrow" :disabled="offset >= 0" @click="shiftPeriod(1)" aria-label="Next">▶</button>
    </div>

    <HabitCard
      v-for="h in store.habits"
      :key="h.id"
      :habit="h"
      :today="today"
      :view="view"
      :offset="offset"
      @toggle="(date) => store.toggle(h.id, date)"
      @edit="startEdit(h)"
      @delete="confirmDelete(h)"
    />
  </div>
</template>

<script>
import HabitCard from '../components/HabitCard.vue'
import { useHabitsStore } from '../stores/habits'
import { todayString, weekRange, fmt } from '../utils'
import { habitIcons } from '../categories'
import { confirmDialog } from '../confirm'
import { t, localeDate } from '../i18n'

const COLORS = ['#3dd6a3', '#6d86ff', '#ff6b7a', '#ffb84d', '#a07bff', '#4dd2ff', '#ff8fcf', '#5fd06f']

export default {
  name: 'HabitsView',
  components: { HabitCard },
  setup() {
    return { store: useHabitsStore() }
  },
  data() {
    return {
      colors: COLORS,
      habitIcons,
      today: todayString(),
      editingId: null,
      showForm: false,
      form: { name: '', icon: habitIcons[0], color: COLORS[0], weeklyTarget: 0 },
      view: localStorage.getItem('bookkeeping-habit-view') || 'grid',
      offset: 0,
      views: [
        { key: 'grid', labelKey: 'habit.viewGrid' },
        { key: 'ring', labelKey: 'habit.viewRing' },
        { key: 'week', labelKey: 'habit.viewWeek' },
        { key: 'month', labelKey: 'habit.viewMonth' }
      ]
    }
  },
  computed: {
    navLabel() {
      const base = new Date(this.today + 'T00:00:00')
      if (this.view === 'week') {
        const d = new Date(base); d.setDate(base.getDate() + this.offset * 7)
        const { start, end } = weekRange(d)
        return fmt(start) + ' – ' + fmt(end)
      }
      if (this.view === 'month') {
        return localeDate(new Date(base.getFullYear(), base.getMonth() + this.offset, 1), { year: 'numeric', month: 'long' })
      }
      // ring: 30-day window
      const end = new Date(base); end.setDate(base.getDate() + this.offset * 30)
      const start = new Date(end); start.setDate(end.getDate() - 29)
      return localeDate(start, { month: 'short', day: 'numeric' }) + ' – ' + localeDate(end, { month: 'short', day: 'numeric' })
    }
  },
  methods: {
    toggleForm() {
      if (this.showForm) this.cancel()
      else this.openAdd()
    },
    openAdd() {
      this.editingId = null
      this.form = { name: '', icon: habitIcons[0], color: COLORS[0], weeklyTarget: 0 }
      this.showForm = true
      this.focusName()
    },
    submit() {
      const name = this.form.name.trim()
      if (!name) return
      const payload = { name, icon: this.form.icon, color: this.form.color, weeklyTarget: this.form.weeklyTarget }
      if (this.editingId) this.store.update({ id: this.editingId, ...payload })
      else this.store.add(payload)
      this.cancel()
    },
    startEdit(habit) {
      this.editingId = habit.id
      this.form = { name: habit.name, icon: habit.icon || habitIcons[0], color: habit.color || COLORS[0], weeklyTarget: habit.weeklyTarget || 0 }
      this.showForm = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
      this.focusName()
    },
    async confirmDelete(habit) {
      const ok = await confirmDialog(t('habit.confirmDelete', { name: habit.name }), { danger: true, confirmText: t('common.delete') })
      if (ok) this.store.remove(habit.id)
    },
    cancel() {
      this.editingId = null
      this.showForm = false
      this.form = { name: '', icon: habitIcons[0], color: COLORS[0], weeklyTarget: 0 }
    },
    focusName() {
      this.$nextTick(() => { if (this.$refs.name) this.$refs.name.focus() })
    },
    setView(v) {
      this.view = v
      this.offset = 0
      localStorage.setItem('bookkeeping-habit-view', v)
    },
    shiftPeriod(dir) {
      const n = this.offset + dir
      if (n > 0) return // don't navigate into the future
      this.offset = n
    }
  }
}
</script>

<style scoped>
.view-head { display: flex; align-items: center; gap: 10px; margin: 4px 0 14px; }
.view-head .view-title { margin: 0; flex: 1; }

.form-row { display: flex; align-items: center; gap: 10px; }
.icon-preview {
  width: 42px; height: 42px; flex-shrink: 0; border-radius: 11px;
  display: flex; align-items: center; justify-content: center; font-size: 22px;
}
.name-input { flex: 1; }
.picker-label { font-size: 12px; color: var(--muted); margin-top: 2px; }
.icons { display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 8px; }
.icon-opt {
  height: 40px; border: 1px solid var(--border); background: var(--input);
  border-radius: 10px; font-size: 20px; cursor: pointer; transition: .12s;
}
.icon-opt:hover { border-color: var(--primary); }
.icon-opt.active { border-color: var(--primary); background: var(--card); transform: scale(1.05); }

.goal-pick { display: flex; gap: 6px; flex-wrap: wrap; }
.goal-opt {
  min-width: 40px; height: 38px; padding: 0 10px; border: 1px solid var(--border); background: var(--input);
  color: var(--text); border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: .12s;
}
.goal-opt:hover { border-color: var(--primary); }
.goal-opt.active { border-color: var(--primary); background: var(--primary); color: #fff; }

.habit-views { display: flex; gap: 8px; margin-bottom: 14px; }
.habit-views button {
  flex: 1; padding: 8px; border: 1px solid var(--border);
  background: var(--input); color: var(--muted);
  border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; transition: .12s;
}
.habit-views button.active { background: var(--primary); color: #fff; border-color: var(--primary); }

.period-nav { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.period-nav .nav-arrow {
  width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
  border: 1px solid var(--border); background: var(--card); color: var(--text); font-size: 13px; cursor: pointer;
}
.period-nav .nav-arrow:hover:not(:disabled) { background: var(--input); border-color: var(--primary); }
.period-nav .nav-arrow:disabled { opacity: .4; cursor: not-allowed; }
.period-label { flex: 1; text-align: center; font-size: 13px; font-weight: 600; color: var(--muted); }
.add-btn {
  width: 34px; height: 34px; flex-shrink: 0; border-radius: 50%;
  background: var(--primary); color: #fff; border: none;
  font-size: 22px; line-height: 1; cursor: pointer; transition: .2s;
  display: flex; align-items: center; justify-content: center;
}
.add-btn:hover { background: var(--primary-dark); }
.add-btn.open { transform: rotate(45deg); }

.form-card { margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px; }
.name-input { width: 100%; }
.swatches { display: flex; gap: 8px; flex-wrap: wrap; }
.swatch {
  width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
  border: 2px solid transparent; transition: .12s;
}
.swatch.active { border-color: var(--text); transform: scale(1.1); }
.form-actions { display: flex; gap: 10px; }
.btn-primary {
  flex: 1; padding: 11px; border: none;
  background: var(--primary); color: #fff; border-radius: 10px;
  font-size: 15px; font-weight: 700; cursor: pointer;
}
.btn-primary:hover:not(:disabled) { background: var(--primary-dark); }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }
.btn-cancel {
  padding: 11px 16px; border: 1px solid var(--border); background: var(--input);
  color: var(--muted); border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer;
}
.btn-cancel:hover { color: var(--text); }
</style>
