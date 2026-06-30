<template>
  <div>
    <div class="period-tabs">
      <button
        v-for="p in order"
        :key="p"
        :class="{ active: period === p }"
        @click="$emit('update:period', p)"
      >{{ labels[p] }}</button>
    </div>

    <div class="nav-bar" v-if="period !== 'all'">
      <button class="nav-arrow" @click="$emit('shift', -1)" aria-label="Previous period">◀</button>
      <div class="nav-label">
        <span>{{ label }}</span>
        <button v-if="!isCurrent" class="nav-today" @click="$emit('today')">Today</button>
      </div>
      <button class="nav-arrow" @click="$emit('shift', 1)" aria-label="Next period">▶</button>
    </div>
    <p class="subtitle all-label" v-else>All time</p>
  </div>
</template>

<script>
export default {
  name: 'PeriodNav',
  props: {
    period: { type: String, required: true },
    label: { type: String, default: '' },
    isCurrent: { type: Boolean, default: true }
  },
  emits: ['update:period', 'shift', 'today'],
  data() {
    return {
      order: ['day', 'week', 'month', 'all'],
      labels: { day: 'Day', week: 'Week', month: 'Month', all: 'All' }
    }
  }
}
</script>

<style scoped>
.period-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.period-tabs button {
  flex: 1; padding: 9px; border: 1px solid var(--border);
  background: var(--card); border-radius: 9px; cursor: pointer;
  font-size: 14px; font-weight: 600; color: var(--muted); transition: .15s;
}
.period-tabs button.active { background: var(--primary); color: #fff; border-color: var(--primary); }

.nav-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: -8px 0 16px; }
.nav-arrow {
  width: 38px; height: 38px; border-radius: 9px; flex-shrink: 0;
  border: 1px solid var(--border); background: var(--card); color: var(--text);
  font-size: 14px; cursor: pointer; transition: .15s;
}
.nav-arrow:hover { background: var(--input); border-color: var(--primary); }
.nav-label { flex: 1; text-align: center; font-size: 14px; color: var(--muted); display: flex; align-items: center; justify-content: center; gap: 10px; }
.nav-today {
  padding: 4px 10px; font-size: 12px; font-weight: 600; cursor: pointer;
  border-radius: 7px; border: 1px solid var(--primary); background: var(--input); color: var(--primary);
}
.nav-today:hover { background: var(--primary); color: #fff; }
.all-label { margin-top: -8px; }
</style>
