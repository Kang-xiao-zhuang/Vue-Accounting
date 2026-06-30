<template>
  <div class="card habit-card">
    <div class="hc-top">
      <div class="hc-stats">
        <span class="stat" :class="{ hot: currentStreak > 0 }" :title="'Current streak'">🔥 {{ currentStreak }}<span class="stat-unit">{{ currentStreak === 1 ? ' day' : ' days' }}</span></span>
        <span class="stat" :title="'Longest streak'">🏆 {{ longestStreak }} best</span>
        <span class="stat" :title="'Total check-ins'">✅ {{ total }}</span>
      </div>
      <div class="hc-actions">
        <button class="icon-btn" @click="$emit('edit')" title="Edit" :aria-label="'Edit habit ' + habit.name">✎</button>
        <button class="icon-btn danger" @click="$emit('delete')" title="Delete" :aria-label="'Delete habit ' + habit.name">🗑</button>
      </div>
    </div>

    <!-- ===== Grid (contribution heatmap) ===== -->
    <div v-if="view === 'grid'" class="grid-scroll">
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

    <!-- ===== Ring (last 30 days completion) ===== -->
    <div v-else-if="view === 'ring'" class="ring-wrap">
      <svg class="ring" viewBox="0 0 140 140">
        <circle class="ring-track" cx="70" cy="70" r="54" fill="none" stroke-width="12" />
        <circle
          class="ring-prog" cx="70" cy="70" r="54" fill="none" stroke-width="12" stroke-linecap="round"
          :stroke="habit.color"
          :stroke-dasharray="ringC"
          :stroke-dashoffset="ringC * (1 - ring.pct / 100)"
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div class="ring-center">
        <div class="ring-pct">{{ ring.pct }}%</div>
        <div class="ring-sub">{{ ring.done }}/30 days</div>
      </div>
    </div>

    <!-- ===== Week (7 circles) ===== -->
    <div v-else class="week-row">
      <button
        v-for="d in weekDays"
        :key="d.date"
        class="wk"
        :class="{ checked: d.checked, today: d.today, future: d.future }"
        :style="d.checked ? { background: habit.color, borderColor: habit.color } : null"
        :disabled="d.future"
        :title="d.date"
        @click="!d.future && $emit('toggle', d.date)"
      >
        <span class="wk-lbl">{{ d.label }}</span>
        <span class="wk-num">{{ d.dayNum }}</span>
      </button>
    </div>

    <div class="hc-bottom">
      <div class="hc-name">
        <span class="hc-icon" :style="{ background: habit.color }">{{ habit.icon || '🎯' }}</span>
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
    today: { type: String, required: true },
    view: { type: String, default: 'grid' } // grid | ring | week
  },
  emits: ['toggle', 'edit', 'delete'],
  data() {
    return { ringC: 2 * Math.PI * 54 }
  },
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
    longestStreak() {
      const dates = (this.habit.checkins || []).slice().sort()
      if (dates.length === 0) return 0
      let best = 1, run = 1
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1] + 'T00:00:00')
        const cur = new Date(dates[i] + 'T00:00:00')
        const diff = Math.round((cur - prev) / 86400000)
        if (diff === 0) continue
        run = diff === 1 ? run + 1 : 1
        if (run > best) best = run
      }
      return best
    },
    ring() {
      const set = this.checkinSet
      const today = new Date(this.today + 'T00:00:00')
      let done = 0
      for (let i = 0; i < 30; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        if (set.has(fmt(d))) done++
      }
      return { done, pct: Math.round((done / 30) * 100) }
    },
    weekDays() {
      const set = this.checkinSet
      const today = new Date(this.today + 'T00:00:00')
      const dow = (today.getDay() + 6) % 7 // Monday = 0
      const monday = new Date(today)
      monday.setDate(today.getDate() - dow)
      const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
      const out = []
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        const ds = fmt(d)
        out.push({ date: ds, label: labels[i], dayNum: d.getDate(), checked: set.has(ds), today: ds === this.today, future: ds > this.today })
      }
      return out
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
  watch: {
    view() { this.$nextTick(this.scrollGridToEnd) }
  },
  mounted() {
    this.$nextTick(this.scrollGridToEnd)
  },
  methods: {
    scrollGridToEnd() {
      const el = this.$el.querySelector('.grid-scroll')
      if (el) el.scrollLeft = el.scrollWidth
    },
    cellClick(cell) {
      if (!cell.future) this.$emit('toggle', cell.date)
    }
  }
}
</script>

<style scoped>
.habit-card { margin-bottom: 14px; }

.hc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.hc-stats { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); flex-wrap: wrap; }
.hc-stats .stat {
  display: inline-flex; align-items: baseline; gap: 2px;
  background: var(--input); padding: 3px 8px; border-radius: 999px; white-space: nowrap;
}
.hc-stats .stat.hot { color: var(--text); font-weight: 700; }
.hc-stats .stat-unit { font-size: 11px; opacity: .7; }
.hc-actions { display: flex; gap: 2px; }
.icon-btn {
  background: none; border: none; color: var(--muted); cursor: pointer;
  font-size: 15px; padding: 5px 7px; border-radius: 8px;
}
.icon-btn:hover { background: var(--input); color: var(--text); }
.icon-btn.danger:hover { color: var(--expense); }

/* Grid */
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

/* Ring */
.ring-wrap { position: relative; width: 150px; height: 150px; margin: 4px auto 8px; }
.ring { width: 100%; height: 100%; display: block; }
.ring-track { stroke: var(--input); }
.ring-prog { transition: stroke-dashoffset .4s ease; }
.ring-center {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; pointer-events: none;
}
.ring-pct { font-size: 28px; font-weight: 800; }
.ring-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

/* Week */
.week-row { display: flex; justify-content: space-between; gap: 4px; padding: 6px 0 8px; }
.wk {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
  background: none; border: none; cursor: pointer; padding: 0;
}
.wk .wk-lbl { font-size: 11px; color: var(--muted); }
.wk .wk-num {
  width: 30px; height: 30px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; color: var(--text);
  background: var(--input); border: 2px solid transparent; transition: .12s;
}
.wk.checked .wk-num { color: #fff; }
.wk.today .wk-num { border-color: var(--primary); }
.wk.future { cursor: default; opacity: .4; }

.hc-bottom { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; }
.hc-name { display: flex; align-items: center; gap: 8px; min-width: 0; }
.hc-icon {
  width: 30px; height: 30px; flex-shrink: 0; border-radius: 9px;
  display: flex; align-items: center; justify-content: center; font-size: 17px;
}
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
