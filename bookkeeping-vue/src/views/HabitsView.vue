<template>
  <div>
    <div class="view-head">
      <h2 class="view-title">Habits</h2>
      <button class="add-btn" :class="{ open: showForm }" @click="toggleForm" :title="showForm ? 'Close' : 'New habit'" aria-label="New habit">＋</button>
    </div>

    <!-- Add / edit form -->
    <div class="card form-card" v-if="showForm">
      <input ref="name" v-model="form.name" class="name-input" :placeholder="editingId ? 'Edit habit name...' : 'New habit name...'" maxlength="64" @keyup.enter="submit" />
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
      <div class="form-actions">
        <button class="btn-primary" :disabled="!form.name.trim()" @click="submit">
          {{ editingId ? '✓ Save' : '＋ Add Habit' }}
        </button>
        <button class="btn-cancel" @click="cancel">Cancel</button>
      </div>
    </div>

    <div v-if="store.habits.length === 0 && !showForm" class="empty">No habits yet. Tap ＋ to create one and start your streak!</div>

    <HabitCard
      v-for="h in store.habits"
      :key="h.id"
      :habit="h"
      :today="today"
      @toggle="(date) => store.toggle(h.id, date)"
      @edit="startEdit(h)"
      @delete="confirmDelete(h)"
    />
  </div>
</template>

<script>
import HabitCard from '../components/HabitCard.vue'
import { useHabitsStore } from '../stores/habits'
import { todayString } from '../utils'

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
      today: todayString(),
      editingId: null,
      showForm: false,
      form: { name: '', color: COLORS[0] }
    }
  },
  methods: {
    toggleForm() {
      if (this.showForm) this.cancel()
      else this.openAdd()
    },
    openAdd() {
      this.editingId = null
      this.form = { name: '', color: COLORS[0] }
      this.showForm = true
      this.focusName()
    },
    submit() {
      const name = this.form.name.trim()
      if (!name) return
      if (this.editingId) this.store.update({ id: this.editingId, name, color: this.form.color })
      else this.store.add({ name, color: this.form.color })
      this.cancel()
    },
    startEdit(habit) {
      this.editingId = habit.id
      this.form = { name: habit.name, color: habit.color || COLORS[0] }
      this.showForm = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
      this.focusName()
    },
    confirmDelete(habit) {
      if (confirm(`Delete habit "${habit.name}" and all its check-ins?`)) {
        this.store.remove(habit.id)
      }
    },
    cancel() {
      this.editingId = null
      this.showForm = false
      this.form = { name: '', color: COLORS[0] }
    },
    focusName() {
      this.$nextTick(() => { if (this.$refs.name) this.$refs.name.focus() })
    }
  }
}
</script>

<style scoped>
.view-head { display: flex; align-items: center; justify-content: space-between; margin: 4px 0 14px; }
.view-head .view-title { margin: 0; }
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
