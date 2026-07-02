<template>
  <div>
    <div class="more-subhead">
      <button class="page-back" @click="$router.push('/more')" aria-label="Back to More">‹</button>
      <h2 class="view-title">{{ $t('acct.title') }}</h2>
    </div>

    <div class="card account-card">
      <span class="avatar">{{ initial }}</span>
      <div class="who">
        <div class="name">{{ user ? user.name : '—' }}</div>
        <div class="sub">{{ $t('acct.signedIn') }}</div>
      </div>
    </div>

    <div class="card setting-row">
      <span class="setting-label">{{ $t('acct.language') }}</span>
      <span class="lang-toggle">
        <button v-for="l in languages" :key="l.key" :class="{ active: langKey === l.key }" @click="pickLang(l.key)">{{ l.label }}</button>
      </span>
    </div>

    <button class="card setting-row theme-row" @click="currencySheet = true">
      <span class="setting-label">{{ $t('acct.currency') }}</span>
      <span class="theme-current">{{ currency }} ›</span>
    </button>

    <button class="card setting-row theme-row" @click="themeSheet = true">
      <span class="setting-label">{{ $t('acct.theme') }}</span>
      <span class="theme-current">
        <span class="tsw">
          <span v-for="(c, i) in currentTheme.chips" :key="i" class="tchip" :style="{ background: c }"></span>
        </span>
        {{ currentTheme.icon }} {{ currentTheme.name }} ›
      </span>
    </button>

    <BottomSheet :visible="currencySheet" :title="$t('acct.chooseCurrency')" @close="currencySheet = false">
      <div class="cur-grid">
        <button
          v-for="c in currencyOptions"
          :key="c"
          class="cur-opt"
          :class="{ active: currency === c }"
          @click="pickCurrency(c)"
        >{{ c }}</button>
      </div>
    </BottomSheet>

    <BottomSheet :visible="themeSheet" :title="$t('acct.chooseTheme')" @close="themeSheet = false">
            <div class="theme-grid">
              <button
                v-for="t in themes"
                :key="t.key"
                class="theme-opt"
                :class="{ active: themeKey === t.key }"
                @click="pickTheme(t.key)"
              >
                <span class="tsw">
                  <span v-for="(c, i) in chipsFor(t)" :key="i" class="tchip" :style="{ background: c }"></span>
                </span>
                <span class="tname">{{ t.icon }} {{ t.name }}</span>
              </button>
            </div>

            <div v-if="themeKey === 'custom'" class="custom-editor">
              <div class="ce-row">
                <span>{{ $t('acct.base') }}</span>
                <span class="ce-base">
                  <button :class="{ active: custom.base === 'light' }" @click="setCustom({ base: 'light' })">{{ $t('acct.light') }}</button>
                  <button :class="{ active: custom.base === 'dark' }" @click="setCustom({ base: 'dark' })">{{ $t('acct.dark') }}</button>
                </span>
              </div>
              <label class="ce-row"><span>{{ $t('acct.primary') }}</span><input type="color" :value="custom.primary" @input="setCustom({ primary: $event.target.value })" /></label>
              <label class="ce-row"><span>{{ $t('common.income') }}</span><input type="color" :value="custom.income" @input="setCustom({ income: $event.target.value })" /></label>
              <label class="ce-row"><span>{{ $t('common.expense') }}</span><input type="color" :value="custom.expense" @input="setCustom({ expense: $event.target.value })" /></label>
            </div>
    </BottomSheet>

    <div class="backup-row">
      <button class="btn-plain" :disabled="busy" @click="exportData">{{ $t('acct.export') }}</button>
      <button class="btn-plain" :disabled="busy" @click="triggerImport">{{ $t('acct.import') }}</button>
      <input ref="file" type="file" accept="application/json,.json" class="hidden-file" @change="onFile" />
    </div>

    <BottomSheet :visible="importSheet" :title="$t('acct.import')" @close="importSheet = false">
      <p class="import-hint">{{ $t('acct.importChoose') }}</p>
      <button class="btn-plain" @click="doImport('merge')">{{ $t('acct.mergeBtn') }}</button>
      <button class="btn-clear import-replace" @click="doImport('replace')">{{ $t('acct.replaceBtn') }}</button>
    </BottomSheet>

    <button class="btn-clear" @click="clearRecords">
      {{ $t('acct.clear') }}
    </button>

    <button class="btn-logout" @click="logout">
      {{ $t('acct.logout') }}
    </button>

    <p class="footer-tip">{{ $t('acct.tip') }}</p>
  </div>
</template>

<script>
import api from '../api'
import { toast } from '../toast'
import { useAuthStore } from '../stores/auth'
import { useRecordsStore } from '../stores/records'
import { currencyState, currencyOptions, setCurrency } from '../currency'
import { themeState, themes, setTheme, customState, setCustom } from '../theme'
import { confirmDialog } from '../confirm'
import { t, localeState, languages, setLocale } from '../i18n'
import BottomSheet from '../components/BottomSheet.vue'

export default {
  name: 'ProfileView',
  components: { BottomSheet },
  setup() {
    return { authStore: useAuthStore(), recordsStore: useRecordsStore(), currencyOptions, themes, setCustom, languages }
  },
  data() {
    return { busy: false, themeSheet: false, currencySheet: false, importSheet: false, pendingBackup: null }
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
    currentTheme() { return themes.find(x => x.key === themeState.key) || themes[0] },
    custom() { return customState },
    langKey() { return localeState.lang }
  },
  methods: {
    pickLang(k) { setLocale(k) },
    chipsFor(t) {
      if (t.key === 'custom') {
        return [customState.primary, customState.income, customState.expense, customState.base === 'dark' ? '#0f1320' : '#f4f6fb']
      }
      return t.chips
    },
    pickTheme(k) {
      setTheme(k)
      if (k !== 'custom') this.themeSheet = false // keep sheet open to edit custom colors
    },
    pickCurrency(c) { setCurrency(c); this.currencySheet = false },
    async clearRecords() {
      const name = this.user ? this.user.name : ''
      const ok = await confirmDialog(t('acct.confirmClear', { name }), { danger: true, confirmText: t('acct.deleteAll') })
      if (ok) this.recordsStore.clear()
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
        toast.success(t('acct.backupDownloaded'))
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
        toast.error(t('acct.notJson'))
        return
      }
      this.pendingBackup = data
      this.importSheet = true
    },
    async doImport(mode) {
      this.importSheet = false
      if (!this.pendingBackup) return
      this.busy = true
      try {
        await api.restore(this.pendingBackup, mode)
        toast.success(t('acct.restored'))
        setTimeout(() => window.location.reload(), 600)
      } catch (err) { /* handled by interceptor */ }
      finally { this.busy = false; this.pendingBackup = null }
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
.lang-toggle { display: flex; gap: 6px; }
.lang-toggle button {
  padding: 6px 14px; border: 1px solid var(--border); background: var(--input);
  color: var(--muted); border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
}
.lang-toggle button.active { background: var(--primary); color: #fff; border-color: var(--primary); }

.cur-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.cur-opt {
  padding: 14px 0; border: 1.5px solid var(--border); background: var(--input);
  border-radius: 12px; font-size: 18px; font-weight: 700; color: var(--text); cursor: pointer; transition: .12s;
}
.cur-opt:hover { border-color: var(--primary); }
.cur-opt.active { border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary) inset; }

.theme-row { border: none; width: 100%; text-align: left; cursor: pointer; font: inherit; color: var(--text); }
.theme-current { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--muted); }

.theme-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }

.custom-editor { margin-top: 14px; display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--border); padding-top: 14px; }
.ce-row { display: flex; align-items: center; justify-content: space-between; font-size: 14px; color: var(--text); }
.ce-row input[type="color"] { width: 44px; height: 30px; border: 1px solid var(--border); border-radius: 8px; background: none; cursor: pointer; padding: 0; }
.ce-base { display: flex; gap: 6px; }
.ce-base button {
  padding: 6px 14px; border: 1px solid var(--border); background: var(--input);
  color: var(--muted); border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
}
.ce-base button.active { background: var(--primary); color: #fff; border-color: var(--primary); }
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

.import-hint { font-size: 14px; color: var(--muted); }
.import-replace { margin-top: 0; }

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
