<template>
  <div class="card habit-card">
    <div class="hc-top">
      <div class="hc-stats">🔥 {{ currentStreak }} · ✅ {{ total }}</div>
      <div class="hc-actions">
        <button class="icon-btn" @click="$emit('edit')" title="Edit">✎</button>
        <button class="icon-btn danger" @click="$emit('delete')" title="Delete">🗑</button>
      </div>
    </div>

    <div class="grid-scroll">
      <div class="grid">
        <div class="col" v-for="(col, ci) in weeks" :key="ci">
          <div
            v-for="cell in col"
            :key="cell.date"
            class="cell"
            :class="{ future: cell.future, checked: cell.checked }"
            :style="cell.checked ? { background: habit.color, borderColor: habit.color } : null"
            :title="cell.date"
            @click="cellClick(cell)"
          ></div>
        </div>
      </div>
    </div>

    <div class="hc-bottom">
      <div class="hc-name">
        <span class="hc-dot" :style="{ background: habit.color }"></span>
        <span class="hc-name-text">{{ habit.name }}</span>
      </div>
      <button
        class="checkin-fab"
        :class="{ done: checkedToday }"
        :style="fabStyle"
        :title="checkedToday ? 'Checked in today (tap to undo)' : 'Check in today'"
        @click="$emit('toggle', today)"
      ><span v-if="checkedToday">✓</span><span v-else class="fab-label">done!</span></button>
    </div>
  </div>
</template>

<script>
import { fmt } from '../utils'

const WEEKS = 53

export default {
  name: 'HabitCard',
  props: {
    habit: { type: Object, required: true },
    today: { type: String, required: true }
  },
  emits: ['toggle', 'edit', 'delete'],
  computed: {
    checkinSet() {
      return new Set(this.habit.checkins || [])
    },
    total() {
      return (this.habit.checkins || []).length
    },
    checkedToday() {
      return this.checkinSet.has(this.today)
    },
    fabStyle() {
      const color = this.habit.color || '#3dd6a3'
      return this.checkedToday
        ? { background: color, borderColor: color, color: '#fff' }
        : { background: 'transparent', borderColor: color, color: color }
    },
    currentStreak() {
      const set = this.checkinSet
      let streak = 0
      const d = new Date(this.today + 'T00:00:00')
      if (!set.has(fmt(d))) d.setDate(d.getDate() - 1) // allow streak ending yesterday
      while (set.has(fmt(d))) {
        streak++
        d.setDate(d.getDate() - 1)
      }
      return streak
    },
    weeks() {
      const set = this.checkinSet
      const today = new Date(this.today + 'T00:00:00')
      const dow = (today.getDay() + 6) % 7 // Monday = 0
      const start = new Date(today)
      start.setDate(today.getDate() - dow - (WEEKS - 1) * 7)
      const cols = []
      for (let w = 0; w < WEEKS; w++) {
        const col = []
        for (let d = 0; d < 7; d++) {
          const date = new Date(start)
          date.setDate(start.getDate() + w * 7 + d)
          const ds = fmt(date)
          col.push({ date: ds, future: ds > this.today, checked: set.has(ds) })
        }
        cols.push(col)
      }
      return cols
    }
  },
  mounted() {
    this.$nextTick(() => {
      const el = this.$el.querySelector('.grid-scroll')
      if (el) el.scrollLeft = el.scrollWidth
    })
  },
  methods: {
    cellClick(cell) {
      if (!cell.future) this.$emit('toggle', cell.date)
    }
  }
}
</script>

<style scoped>
.habit-card { margin-bottom: 14px; }

.hc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.hc-stats { font-size: 12px; color: var(--muted); }
.hc-actions { display: flex; gap: 2px; }
.icon-btn {
  background: none; border: none; color: var(--muted); cursor: pointer;
  font-size: 15px; padding: 5px 7px; border-radius: 8px;
}
.icon-btn:hover { background: var(--input); color: var(--text); }
.icon-btn.danger:hover { color: var(--expense); }

.grid-scroll { overflow-x: auto; padding-bottom: 6px; }
.grid { display: flex; gap: 3px; width: max-content; }
.col { display: flex; flex-direction: column; gap: 3px; }
.cell {
  width: 12px; height: 12px; border-radius: 3px;
  background: var(--input); border: 1px solid transparent; cursor: pointer;
}
.cell:hover { border-color: var(--primary); }
.cell.future { background: transparent; cursor: default; }
.cell.future:hover { border-color: transparent; }

.hc-bottom { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; }
.hc-name { display: flex; align-items: center; gap: 8px; min-width: 0; }
.hc-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.hc-name-text { font-size: 16px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.checkin-fab {
  width: 42px; height: 42px; flex-shrink: 0; border-radius: 50%;
  border: 2px solid; font-size: 18px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: .15s;
}
.checkin-fab:hover { transform: scale(1.06); }
.checkin-fab:active { transform: scale(0.94); }
.checkin-fab .fab-label { font-size: 12px; font-weight: 700; }
</style>
