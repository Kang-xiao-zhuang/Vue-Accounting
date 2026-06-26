<template>
  <div>
    <h2 class="view-title">Users</h2>

    <!-- Add user -->
    <form class="add-row" @submit.prevent="add">
      <input v-model="newName" placeholder="New user name..." maxlength="64" />
      <button type="submit" class="btn-primary" :disabled="!newName.trim()">＋ Add</button>
    </form>

    <div v-if="users.length === 0" class="empty">No users yet. Add one above to start.</div>

    <!-- User list -->
    <ul class="user-list">
      <li v-for="u in users" :key="u.id" class="user-item" :class="{ active: u.id === activeUserId }">
        <template v-if="editingId === u.id">
          <input v-model="editName" class="edit-input" maxlength="64" @keyup.enter="saveEdit(u)" />
          <button class="icon-btn ok" @click="saveEdit(u)" title="Save">✓</button>
          <button class="icon-btn" @click="cancelEdit" title="Cancel">✕</button>
        </template>
        <template v-else>
          <button class="user-name" @click="$emit('select', u.id)">
            <span class="avatar">{{ initial(u.name) }}</span>
            <span class="name">{{ u.name }}</span>
            <span v-if="u.id === activeUserId" class="badge">Active</span>
          </button>
          <button class="icon-btn" @click="startEdit(u)" title="Rename">✎</button>
          <button class="icon-btn danger" @click="$emit('delete', u)" title="Delete">🗑</button>
        </template>
      </li>
    </ul>

    <button v-if="activeUserId" class="btn-clear" @click="$emit('clear-records')">
      🗑 Clear {{ activeName }}'s records
    </button>

    <p class="footer-tip">The active user’s records appear on the Records, Add, and Stats tabs.</p>
  </div>
</template>

<script>
export default {
  name: 'ProfileView',
  props: {
    users: { type: Array, default: () => [] },
    activeUserId: { type: [Number, null], default: null }
  },
  emits: ['select', 'add', 'rename', 'delete', 'clear-records'],
  data() {
    return { newName: '', editingId: null, editName: '' }
  },
  computed: {
    activeName() {
      const u = this.users.find(u => u.id === this.activeUserId)
      return u ? u.name : ''
    }
  },
  methods: {
    initial(name) {
      return (name || '?').trim().charAt(0).toUpperCase()
    },
    add() {
      const name = this.newName.trim()
      if (!name) return
      this.$emit('add', name)
      this.newName = ''
    },
    startEdit(u) {
      this.editingId = u.id
      this.editName = u.name
    },
    cancelEdit() {
      this.editingId = null
      this.editName = ''
    },
    saveEdit(u) {
      const name = this.editName.trim()
      if (name && name !== u.name) {
        this.$emit('rename', { id: u.id, name })
      }
      this.cancelEdit()
    }
  }
}
</script>

<style scoped>
.add-row { display: flex; gap: 10px; margin-bottom: 18px; }
.btn-primary {
  padding: 11px 16px; border: none; white-space: nowrap;
  background: var(--primary); color: #fff; border-radius: 10px;
  font-size: 14px; font-weight: 700; cursor: pointer;
}
.btn-primary:hover:not(:disabled) { background: var(--primary-dark); }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }

.user-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.user-item {
  display: flex; align-items: center; gap: 8px;
  background: var(--card); border: 1px solid var(--border);
  border-radius: 12px; padding: 8px 10px;
}
.user-item.active { border-color: var(--primary); }
.user-name {
  flex: 1; display: flex; align-items: center; gap: 10px;
  background: none; border: none; color: var(--text); cursor: pointer;
  font-size: 15px; text-align: left; padding: 4px;
}
.avatar {
  width: 34px; height: 34px; flex-shrink: 0; border-radius: 50%;
  background: var(--primary); color: #fff; font-weight: 700;
  display: flex; align-items: center; justify-content: center; font-size: 15px;
}
.name { flex: 1; }
.badge {
  font-size: 11px; font-weight: 600; color: var(--primary);
  background: var(--input); border: 1px solid var(--primary);
  padding: 2px 8px; border-radius: 20px;
}
.edit-input { flex: 1; }
.icon-btn {
  background: none; border: none; color: var(--muted); cursor: pointer;
  font-size: 16px; padding: 6px 8px; border-radius: 8px;
}
.icon-btn:hover { background: var(--input); color: var(--text); }
.icon-btn.ok:hover { color: var(--income); }
.icon-btn.danger:hover { color: var(--expense); }

.btn-clear {
  width: 100%; margin-top: 20px; padding: 11px;
  border: 1px solid var(--border); background: var(--card); color: var(--muted);
  border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: .15s;
}
.btn-clear:hover { background: var(--expense); color: #fff; border-color: var(--expense); }

.footer-tip { text-align: center; color: var(--muted); font-size: 12px; margin-top: 18px; }
</style>
