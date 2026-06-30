<template>
  <div>
    <div class="more-subhead">
      <button class="page-back" @click="$router.push('/more')" aria-label="Back to More">‹</button>
      <h2 class="view-title">Daily Checklist</h2>
    </div>

    <!-- day navigation -->
    <div class="nav-bar">
      <button class="nav-arrow" @click="store.shift(-1)" aria-label="Previous day">◀</button>
      <div class="nav-label">
        <span>{{ store.dateLabel }}</span>
        <button v-if="!store.isToday" class="nav-today" @click="store.goToday">Today</button>
      </div>
      <button class="nav-arrow" @click="store.shift(1)" aria-label="Next day">▶</button>
    </div>

    <!-- progress -->
    <div v-if="total > 0" class="progress-box">
      <div class="progress-head">
        <span>{{ doneCount }} / {{ total }} done</span>
        <span class="pct">{{ percent }}%</span>
      </div>
      <div class="bar"><div class="bar-fill" :style="{ width: percent + '%' }"></div></div>
    </div>

    <!-- add bar -->
    <div class="add-bar">
      <input
        v-model="newText"
        class="add-input"
        placeholder="Add a task for this day..."
        maxlength="255"
        @keyup.enter="add"
      />
      <button class="add-go" :disabled="!newText.trim()" @click="add" aria-label="Add task">＋</button>
    </div>

    <div v-if="items.length === 0" class="empty">Nothing for this day yet. Add your first task above! ✨</div>

    <!-- list -->
    <ul class="todo-list">
      <li v-for="t in items" :key="t.id" class="todo-item" :class="{ done: t.done }">
        <button class="check" :class="{ on: t.done }" @click="store.toggle(t.id)" :aria-label="(t.done ? 'Mark incomplete: ' : 'Mark done: ') + t.text" :aria-pressed="t.done">
          <span v-if="t.done">✓</span>
        </button>

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

        <button class="del" title="Delete" :aria-label="'Delete task ' + t.text" @click="store.remove(t.id)">🗑</button>
      </li>
    </ul>
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
    return { newText: '', editingId: null, editText: '' }
  },
  computed: {
    items() { return this.store.forDay },
    total() { return this.items.length },
    doneCount() { return this.items.filter(t => t.done).length },
    percent() { return this.total ? Math.round((this.doneCount / this.total) * 100) : 0 }
  },
  methods: {
    add() {
      const text = this.newText.trim()
      if (!text) return
      this.store.add(text)
      this.newText = ''
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
      const original = this.items.find(t => t.id === id)
      this.editingId = null
      if (text && original && text !== original.text) {
        this.store.update(id, text)
      }
    },
    cancelEdit() {
      this.editingId = null
    }
  }
}
</script>

<style scoped>
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

.add-bar { display: flex; gap: 8px; margin-bottom: 16px; }
.add-input { flex: 1; }
.add-go {
  width: 46px; flex-shrink: 0; border: none; border-radius: 10px;
  background: var(--primary); color: #fff; font-size: 22px; line-height: 1; cursor: pointer; transition: .15s;
}
.add-go:hover:not(:disabled) { background: var(--primary-dark); }
.add-go:disabled { opacity: .5; cursor: not-allowed; }

.todo-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.todo-item {
  display: flex; align-items: center; gap: 12px;
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

.todo-text { flex: 1; font-size: 15px; cursor: text; word-break: break-word; }
.todo-item.done .todo-text { text-decoration: line-through; color: var(--muted); }
.edit-input { flex: 1; padding: 6px 8px; font-size: 15px; }

.del {
  flex-shrink: 0; background: none; border: none; color: var(--muted);
  cursor: pointer; font-size: 15px; padding: 4px 6px; border-radius: 8px; transition: .15s;
}
.del:hover { background: var(--input); color: var(--expense); }
</style>
