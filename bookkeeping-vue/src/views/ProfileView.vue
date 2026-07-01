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

    <button class="card setting-row theme-row" @click="currencySheet = true">
      <span class="setting-label">Currency symbol</span>
      <span class="theme-current">{{ currency }} ›</span>
    </button>

    <button class="card setting-row theme-row" @click="themeSheet = true">
      <span class="setting-label">Theme</span>
      <span class="theme-current">
        <span class="tsw">
          <span v-for="(c, i) in currentTheme.chips" :key="i" class="tchip" :style="{ background: c }"></span>
        </span>
        {{ currentTheme.icon }} {{ currentTheme.name }} ›
      </span>
    </button>

    <teleport to=".phone">
      <transition name="sheet">
        <div v-if="currencySheet" class="sheet-overlay" @click.self="currencySheet = false">
          <div class="sheet">
            <div class="sheet-handle"></div>
            <div class="sheet-head">
              <span class="sheet-title">Choose currency</span>
              <button class="sheet-x" @click="currencySheet = false" aria-label="Close">✕</button>
            </div>
            <div class="cur-grid">
              <button
                v-for="c in currencyOptions"
                :key="c"
                class="cur-opt"
                :class="{ active: currency === c }"
                @click="pickCurrency(c)"
              >{{ c }}</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <teleport to=".phone">
      <transition name="sheet">
        <div v-if="themeSheet" class="sheet-overlay" @click.self="themeSheet = false">
          <div class="sheet">
            <div class="sheet-handle"></div>
            <div class="sheet-head">
              <span class="sheet-title">Choose theme</span>
              <button class="sheet-x" @click="themeSheet = false" aria-label="Close">✕</button>
            </div>
            <div class="theme-grid">
              <button
                v-for="t in themes"
                :key="t.key"
                class="theme-opt"
                :class="{ active: themeKey === t.key }"
                @click="pickTheme(t.key)"
              >
                <span class="tsw">
                  <span v-for="(c, i) in t.chips" :key="i" class="tchip" :style="{ background: c }"></span>
                </span>
                <span class="tname">{{ t.icon }} {{ t.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

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
import { themeState, themes, setTheme } from '../theme'

export default {
  name: 'ProfileView',
  setup() {
    return { authStore: useAuthStore(), recordsStore: useRecordsStore(), currencyOptions, themes }
  },
  data() {
    return { busy: false, themeSheet: false, currencySheet: false }
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
    },
    themeKey() { return themeState.key },
    currentTheme() { return themes.find(t => t.key === themeState.key) || themes[0] }
  },
  methods: {
    pickTheme(k) { setTheme(k); this.themeSheet = false },
    pickCurrency(c) { setCurrency(c); this.currencySheet = false },
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

.cur-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.cur-opt {
  padding: 14px 0; border: 1.5px solid var(--border); background: var(--input);
  border-radius: 12px; font-size: 18px; font-weight: 700; color: var(--text); cursor: pointer; transition: .12s;
}
.cur-opt:hover { border-color: var(--primary); }
.cur-opt.active { border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary) inset; }

.theme-row { border: none; width: 100%; text-align: left; cursor: pointer; font: inherit; color: var(--text); }
.theme-current { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--muted); }

/* slide-up theme sheet */
.sheet-overlay { position: absolute; inset: 0; z-index: 30; background: rgba(0, 0, 0, 0.55); display: flex; align-items: flex-end; }
.sheet {
  width: 100%; background: var(--card); border-radius: 20px 20px 0 0;
  padding: 10px 18px calc(18px + env(safe-area-inset-bottom));
  display: flex; flex-direction: column; gap: 12px; max-height: 80%;
}
.sheet-handle { width: 40px; height: 4px; border-radius: 2px; background: var(--border); margin: 4px auto 6px; }
.sheet-head { display: flex; align-items: center; justify-content: space-between; }
.sheet-title { font-size: 16px; font-weight: 700; }
.sheet-x { background: none; border: none; color: var(--muted); font-size: 18px; cursor: pointer; }
.sheet .theme-grid { overflow-y: auto; padding-bottom: 4px; }

.sheet-enter-active, .sheet-leave-active { transition: opacity .2s; }
.sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform .25s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }

.theme-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.theme-opt {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px;
  border: 1.5px solid var(--border); background: var(--input);
  border-radius: 12px; cursor: pointer; transition: .12s;
}
.theme-opt:hover { border-color: var(--primary); }
.theme-opt.active { border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary) inset; }
.tsw { display: flex; flex-shrink: 0; border-radius: 6px; overflow: hidden; border: 1px solid var(--border); }
.tchip { width: 12px; height: 26px; }
.tname { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

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
