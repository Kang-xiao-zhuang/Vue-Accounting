<template>
  <div>
    <div class="more-subhead">
      <button class="page-back" @click="$router.push('/more')" aria-label="Back to More">‹</button>
      <h2 class="view-title">{{ $t('todo.title') }}</h2>
      <button class="layout-btn" @click="toggleLayout" :title="layout === 'ring' ? 'List view' : 'Ring view'" aria-label="Toggle layout">{{ layout === 'ring' ? '☰' : '◐' }}</button>
    </div>

    <!-- day navigation -->
    <div class="nav-bar">
      <button class="nav-arrow" @click="store.shift(-1)" aria-label="Previous day">◀</button>
      <div class="nav-label">
        <span>{{ store.dateLabel }}</span>
        <button v-if="!store.isToday" class="nav-today" @click="store.goToday">{{ $t('common.today') }}</button>
      </div>
      <button class="nav-arrow" @click="store.shift(1)" aria-label="Next day">▶</button>
    </div>

    <!-- add form -->
    <div class="add-card card">
      <div class="add-bar">
        <input v-model="newText" class="add-input" :placeholder="$t('todo.addPh')" maxlength="255" @keyup.enter="add" />
        <button class="add-go" :disabled="!newText.trim()" @click="add" aria-label="Add task">＋</button>
      </div>
      <div class="add-opts">
        <div class="prio-pick">
          <button
            v-for="p in [2, 1, 0]" :key="p"
            class="flag-btn" :class="{ active: newPriority === p }"
            :style="{ color: prioColor(p) }" :title="$t('todo.priority')"
            @click="newPriority = p"
          >⚑</button>
        </div>
        <input type="date" class="opt-in" v-model="newDate" />
        <input type="time" class="opt-in" v-model="newStart" />
        <span class="tilde">~</span>
        <input type="time" class="opt-in" v-model="newEnd" />
      </div>
    </div>

    <div v-if="items.length === 0" class="empty">{{ $t('todo.none') }}</div>

    <!-- sort toggle -->
    <div v-if="items.length" class="sort-toggle">
      <button :class="{ active: sortMode === 'priority' }" @click="sortMode = 'priority'">{{ $t('todo.byPriority') }}</button>
      <button :class="{ active: sortMode === 'time' }" @click="sortMode = 'time'">{{ $t('todo.byTime') }}</button>
    </div>

    <!-- completion + list (layout: list = stacked bar; ring = ring left, list right) -->
    <div class="todo-main" :class="layout">
      <div v-if="total > 0" class="completion">
        <div v-if="layout === 'ring'" class="ring-side">
          <svg class="tring" viewBox="0 0 100 100">
            <circle class="tr-track" cx="50" cy="50" r="40" fill="none" stroke-width="10" />
            <circle
              class="tr-prog" cx="50" cy="50" r="40" fill="none" stroke-width="10" stroke-linecap="round"
              :stroke-dasharray="ringC" :stroke-dashoffset="ringC * (1 - percent / 100)"
              :style="{ stroke: ringColor }"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div class="tr-center">
            <div class="tr-pct">{{ percent }}%</div>
            <div class="tr-sub">{{ doneCount }}/{{ total }}</div>
          </div>
        </div>
        <div v-else class="progress-box">
          <div class="progress-head">
            <span>{{ $t('todo.done', { done: doneCount, total: total }) }}</span>
            <span class="pct">{{ percent }}%</span>
          </div>
          <div class="bar"><div class="bar-fill" :style="{ width: percent + '%' }"></div></div>
        </div>
      </div>

      <ul class="todo-list">
      <li v-for="t in items" :key="t.id" class="todo-item" :class="{ done: t.done }">
        <button class="check" :class="{ on: t.done }" @click="store.toggle(t.id)" :aria-label="(t.done ? 'Mark incomplete: ' : 'Mark done: ') + t.text" :aria-pressed="t.done">
          <span v-if="t.done">✓</span>
        </button>

        <button class="flag" :style="{ color: prioColor(t.priority) }" :title="$t('todo.priority')" @click="cyclePriority(t)">⚑</button>

        <div class="todo-body">
          <input
            v-if="editingId === t.id"
            ref="editInput"
            v-model="editText"
            class="edit-input"
            maxlength="255"
            @keyup.enter="saveEdit"
            @keyup.esc="cancelEdit"
            @blur="saveEdit"
          />
          <span v-else class="todo-text" @click="startEdit(t)">{{ t.text }}</span>
          <span v-if="t.startTime" class="todo-time">🕒 {{ t.startTime }}<template v-if="t.endTime">~{{ t.endTime }}</template></span>
        </div>

        <button class="del" title="Delete" :aria-label="'Delete task ' + t.text" @click="store.remove(t.id)">🗑</button>
      </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { useTodosStore } from '../stores/todos'

export default {
  name: 'TodosView',
  setup() {
    return { store: useTodosStore() }
  },
  data() {
    return {
      newText: '', newPriority: 0, newDate: '', newStart: '', newEnd: '',
      editingId: null, editText: '', sortMode: 'priority',
      layout: localStorage.getItem('bookkeeping-todo-layout') === 'ring' ? 'ring' : 'list'
    }
  },
  computed: {
    ringC() { return 2 * Math.PI * 40 },
    // hue shifts from red (0%) → amber (~50%) → green (100%): greener the more complete
    ringColor() { return `hsl(${Math.round(this.percent * 1.2)}, 72%, 45%)` },
    items() {
      const list = [...this.store.forDay]
      if (this.sortMode === 'time') {
        return list.sort((a, b) => this.tk(a).localeCompare(this.tk(b)) || (this.pr(b) - this.pr(a)) || (a.id - b.id))
      }
      return list.sort((a, b) => (this.pr(b) - this.pr(a)) || this.tk(a).localeCompare(this.tk(b)) || (a.id - b.id))
    },
    total() { return this.store.forDay.length },
    doneCount() { return this.store.forDay.filter(t => t.done).length },
    percent() { return this.total ? Math.round((this.doneCount / this.total) * 100) : 0 }
  },
  watch: {
    'store.anchor'(v) { this.newDate = v } // keep the add-form date on the viewed day
  },
  methods: {
    pr(t) { return t.priority || 0 },
    tk(t) { return t.startTime || '99:99' },
    prioColor(p) { return p === 2 ? 'var(--expense)' : p === 1 ? '#ffb84d' : 'var(--muted)' },
    add() {
      const text = this.newText.trim()
      if (!text) return
      this.store.add({
        text,
        date: this.newDate || this.store.anchor,
        priority: this.newPriority,
        startTime: this.newStart || null,
        endTime: this.newEnd || null
      })
      this.newText = ''
      this.newStart = ''
      this.newEnd = ''
      this.newPriority = 0
    },
    cyclePriority(t) {
      this.store.update(t.id, { priority: (this.pr(t) + 1) % 3 })
    },
    toggleLayout() {
      this.layout = this.layout === 'ring' ? 'list' : 'ring'
      localStorage.setItem('bookkeeping-todo-layout', this.layout)
    },
    startEdit(t) {
      this.editingId = t.id
      this.editText = t.text
      this.$nextTick(() => {
        const el = this.$refs.editInput
        const input = Array.isArray(el) ? el[0] : el
        if (input) input.focus()
      })
    },
    saveEdit() {
      if (this.editingId == null) return
      const id = this.editingId
      const text = this.editText.trim()
      const original = this.store.forDay.find(t => t.id === id)
      this.editingId = null
      if (text && original && text !== original.text) {
        this.store.update(id, { text })
      }
    },
    cancelEdit() {
      this.editingId = null
    }
  },
  mounted() {
    this.newDate = this.store.anchor
  }
}
</script>

<style scoped>
.layout-btn {
  margin-left: auto; width: 34px; height: 34px; flex-shrink: 0;
  border: 1px solid var(--border); background: var(--card); color: var(--text);
  border-radius: 9px; font-size: 15px; cursor: pointer; transition: .15s;
}
.layout-btn:hover { background: var(--input); border-color: var(--primary); }

.nav-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
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

.progress-box { margin-bottom: 14px; }
.progress-head { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); margin-bottom: 6px; }
.progress-head .pct { font-weight: 700; color: var(--text); }
.bar { height: 8px; background: var(--input); border-radius: 999px; overflow: hidden; }
.bar-fill { height: 100%; background: var(--income); border-radius: 999px; transition: width .3s ease; }

/* layout: list = completion (bar) stacked above list; ring = ring left, list right */
.todo-main.ring { display: flex; align-items: center; gap: 14px; }
.todo-main.ring .completion { flex-shrink: 0; }
.todo-main.ring .todo-list { flex: 1; min-width: 0; }
.ring-side { position: relative; width: 108px; height: 108px; }
.tring { width: 100%; height: 100%; display: block; }
.tr-track { stroke: var(--input); }
.tr-prog { stroke: var(--income); transition: stroke-dashoffset .4s ease, stroke .4s ease; }
.tr-center {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; pointer-events: none;
}
.tr-pct { font-size: 22px; font-weight: 800; color: var(--text); line-height: 1; }
.tr-sub { font-size: 12px; color: var(--muted); margin-top: 3px; }
@media (max-width: 360px) {
  .todo-main.ring { flex-direction: column; align-items: center; }
  .todo-main.ring .todo-list { width: 100%; }
}

.add-card { margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px; }
.add-bar { display: flex; gap: 8px; }
.add-input { flex: 1; }
.add-go {
  width: 46px; flex-shrink: 0; border: none; border-radius: 10px;
  background: var(--primary); color: #fff; font-size: 22px; line-height: 1; cursor: pointer; transition: .15s;
}
.add-go:hover:not(:disabled) { background: var(--primary-dark); }
.add-go:disabled { opacity: .5; cursor: not-allowed; }
.add-opts { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.prio-pick { display: flex; gap: 4px; }
.flag-btn {
  width: 30px; height: 30px; border: 1px solid var(--border); background: var(--input);
  border-radius: 8px; font-size: 15px; cursor: pointer; transition: .12s;
}
.flag-btn.active { border-color: currentColor; background: var(--card); transform: scale(1.08); }
.opt-in { width: auto; flex: 1; min-width: 90px; padding: 7px 8px; font-size: 13px; border-radius: 8px; }
.tilde { color: var(--muted); }

.sort-toggle { display: flex; gap: 8px; margin-bottom: 12px; }
.sort-toggle button {
  flex: 1; padding: 7px; border: 1px solid var(--border); background: var(--input);
  color: var(--muted); border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer;
}
.sort-toggle button.active { background: var(--primary); color: #fff; border-color: var(--primary); }

.todo-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.todo-item {
  display: flex; align-items: center; gap: 10px;
  background: var(--card); border: 1px solid var(--border);
  border-radius: 12px; padding: 12px 14px; box-shadow: var(--shadow);
}
.check {
  width: 24px; height: 24px; flex-shrink: 0; border-radius: 50%;
  border: 2px solid var(--border); background: transparent; color: #fff;
  cursor: pointer; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; transition: .15s;
}
.check:hover { border-color: var(--income); }
.check.on { background: var(--income); border-color: var(--income); }
.flag { flex-shrink: 0; background: none; border: none; font-size: 16px; cursor: pointer; padding: 2px; line-height: 1; }

.todo-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.todo-text { font-size: 15px; cursor: text; word-break: break-word; }
.todo-item.done .todo-text { text-decoration: line-through; color: var(--muted); }
.todo-time { font-size: 12px; color: var(--muted); }
.edit-input { width: 100%; padding: 6px 8px; font-size: 15px; }

.del {
  flex-shrink: 0; background: none; border: none; color: var(--muted);
  cursor: pointer; font-size: 15px; padding: 4px 6px; border-radius: 8px; transition: .15s;
}
.del:hover { background: var(--input); color: var(--expense); }
</style>
