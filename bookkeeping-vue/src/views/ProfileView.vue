<template>
  <div>
    <div class="more-subhead">
      <button class="page-back" @click="$router.push('/more')" aria-label="Back to More">‹</button>
      <h2 class="view-title">Account</h2>
    </div>

    <div class="card account-card">
      <span class="avatar">{{ initial }}</span>
      <div class="who">
        <div class="name">{{ user ? user.name : '—' }}</div>
        <div class="sub">Signed in</div>
      </div>
    </div>

    <div class="card setting-row">
      <span class="setting-label">Currency symbol</span>
      <select v-model="currency" class="currency-select">
        <option v-for="c in currencyOptions" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <div class="backup-row">
      <button class="btn-plain" :disabled="busy" @click="exportData">⬇ Export backup</button>
      <button class="btn-plain" :disabled="busy" @click="triggerImport">⬆ Import backup</button>
      <input ref="file" type="file" accept="application/json,.json" class="hidden-file" @change="onFile" />
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
import api from '../api'
import { toast } from '../toast'
import { useAuthStore } from '../stores/auth'
import { useRecordsStore } from '../stores/records'
import { currencyState, currencyOptions, setCurrency } from '../currency'

export default {
  name: 'ProfileView',
  setup() {
    return { authStore: useAuthStore(), recordsStore: useRecordsStore(), currencyOptions }
  },
  data() {
    return { busy: false }
  },
  computed: {
    user() { return this.authStore.user },
    initial() {
      const n = this.user && this.user.name ? this.user.name : '?'
      return n.trim().charAt(0).toUpperCase()
    },
    currency: {
      get() { return currencyState.symbol },
      set(v) { setCurrency(v) }
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
    },
    async exportData() {
      this.busy = true
      try {
        const data = await api.backup()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'bookkeeping-backup-' + new Date().toISOString().slice(0, 10) + '.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Backup downloaded')
      } catch (e) { /* handled by interceptor */ }
      finally { this.busy = false }
    },
    triggerImport() {
      this.$refs.file.click()
    },
    async onFile(e) {
      const file = e.target.files && e.target.files[0]
      e.target.value = '' // allow re-selecting the same file later
      if (!file) return
      let data
      try {
        data = JSON.parse(await file.text())
      } catch (err) {
        toast.error('That file is not valid JSON.')
        return
      }
      if (!confirm('Importing will REPLACE all your current data with this backup. Continue?')) return
      this.busy = true
      try {
        await api.restore(data)
        toast.success('Backup restored — reloading…')
        setTimeout(() => window.location.reload(), 600)
      } catch (err) { /* handled by interceptor */ }
      finally { this.busy = false }
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

.setting-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.setting-label { font-size: 15px; font-weight: 600; }
.currency-select { width: auto; padding: 8px 12px; font-size: 15px; border-radius: 9px; border: 1px solid var(--border); }

.btn-clear, .btn-logout {
  width: 100%; margin-top: 12px; padding: 12px;
  border: 1px solid var(--border); background: var(--card); color: var(--muted);
  border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: .15s;
}
.btn-clear:hover { background: var(--expense); color: #fff; border-color: var(--expense); }
.btn-logout:hover { background: var(--input); color: var(--text); border-color: var(--primary); }

.backup-row { display: flex; gap: 10px; margin-top: 12px; }
.btn-plain {
  flex: 1; padding: 12px; border: 1px solid var(--border); background: var(--card); color: var(--text);
  border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: .15s;
}
.btn-plain:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.btn-plain:disabled { opacity: .5; cursor: not-allowed; }
.hidden-file { display: none; }

.footer-tip { text-align: center; color: var(--muted); font-size: 12px; margin-top: 18px; }
</style>
