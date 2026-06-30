<template>
  <div>
    <h2 class="view-title">Account</h2>

    <div class="card account-card">
      <span class="avatar">{{ initial }}</span>
      <div class="who">
        <div class="name">{{ user ? user.name : '—' }}</div>
        <div class="sub">Signed in</div>
      </div>
    </div>

    <button class="btn-clear" @click="clearRecords">
      🗑 Clear all my records
    </button>

    <button class="btn-logout" @click="logout">
      ⎋ Log out
    </button>

    <p class="footer-tip">Your records, habits and checklist are private to this account.</p>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useRecordsStore } from '../stores/records'

export default {
  name: 'ProfileView',
  setup() {
    return { authStore: useAuthStore(), recordsStore: useRecordsStore() }
  },
  computed: {
    user() { return this.authStore.user },
    initial() {
      const n = this.user && this.user.name ? this.user.name : '?'
      return n.trim().charAt(0).toUpperCase()
    }
  },
  methods: {
    clearRecords() {
      const name = this.user ? this.user.name : ''
      if (confirm(`Delete ALL of ${name}'s records? This cannot be undone.`)) {
        this.recordsStore.clear()
      }
    },
    logout() {
      this.authStore.logout()
      this.$router.push({ name: 'login' })
    }
  }
}
</script>

<style scoped>
.account-card { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.avatar {
  width: 48px; height: 48px; flex-shrink: 0; border-radius: 50%;
  background: var(--primary); color: #fff; font-weight: 700; font-size: 20px;
  display: flex; align-items: center; justify-content: center;
}
.who .name { font-size: 18px; font-weight: 700; }
.who .sub { font-size: 13px; color: var(--muted); margin-top: 2px; }

.btn-clear, .btn-logout {
  width: 100%; margin-top: 12px; padding: 12px;
  border: 1px solid var(--border); background: var(--card); color: var(--muted);
  border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: .15s;
}
.btn-clear:hover { background: var(--expense); color: #fff; border-color: var(--expense); }
.btn-logout:hover { background: var(--input); color: var(--text); border-color: var(--primary); }

.footer-tip { text-align: center; color: var(--muted); font-size: 12px; margin-top: 18px; }
</style>
