<template>
  <div class="phone">
    <header v-if="showChrome" class="app-header">
      <h1>💰 Bookkeeping</h1>
      <div class="header-right">
        <button class="theme-btn" @click="cycleTheme" :title="'Theme: ' + themeName" :aria-label="'Switch theme (current: ' + themeName + ')'">{{ themeIcon }}</button>
        <span class="active-user">👤 {{ userName }}</span>
      </div>
    </header>

    <main class="app-content">
      <div v-if="loading && showChrome" class="app-loading"><span class="spinner"></span></div>
      <router-view v-else />
    </main>

    <TabBar v-if="showChrome" />

    <EntrySheet
      v-if="showChrome"
      :visible="ui.sheet.open"
      :editing="!!ui.sheet.editingId"
      :initial="ui.sheet.initial"
      @save="onSave"
      @close="ui.close()"
    />

    <Toast />
  </div>
</template>

<script>
import TabBar from './components/TabBar.vue'
import EntrySheet from './components/EntrySheet.vue'
import Toast from './components/Toast.vue'
import { useAuthStore } from './stores/auth'
import { useRecordsStore } from './stores/records'
import { useHabitsStore } from './stores/habits'
import { useTodosStore } from './stores/todos'
import { useUiStore } from './stores/ui'
import { useRecurringStore } from './stores/recurring'
import { useBudgetsStore } from './stores/budgets'
import { themeState, themes, cycleTheme, initTheme } from './theme'

export default {
  name: 'App',
  components: { TabBar, EntrySheet, Toast },
  setup() {
    return {
      authStore: useAuthStore(),
      recordsStore: useRecordsStore(),
      habitsStore: useHabitsStore(),
      todosStore: useTodosStore(),
      recurringStore: useRecurringStore(),
      budgetsStore: useBudgetsStore(),
      ui: useUiStore(),
      cycleTheme
    }
  },
  data() {
    return { loading: true }
  },
  computed: {
    showChrome() {
      return this.authStore.isAuthed && this.$route.name !== 'login'
    },
    userName() {
      return this.authStore.user ? this.authStore.user.name : ''
    },
    currentTheme() {
      return themes.find(t => t.key === themeState.key) || themes[1]
    },
    themeIcon() { return this.currentTheme.icon },
    themeName() { return this.currentTheme.name }
  },
  watch: {
    'authStore.isAuthed'(now, before) {
      if (now && !before) this.loadAll()
    }
  },
  methods: {
    async loadAll() {
      this.loading = true
      try {
        await this.authStore.fetchMe() // validates the stored token + refreshes account info
        await this.recurringStore.run() // materialize any due recurring records before loading
        await Promise.all([
          this.recordsStore.load(), this.habitsStore.load(),
          this.todosStore.load(), this.budgetsStore.load()
        ])
      } catch (e) {
        // 401 -> handler logged out and redirected to /login
      } finally {
        this.loading = false
      }
    },
    async onSave(payload) {
      const editingId = this.ui.sheet.editingId
      if (editingId) await this.recordsStore.update(editingId, payload)
      else await this.recordsStore.create(payload)
      this.ui.close()
    }
  },
  mounted() {
    initTheme()
    if (this.authStore.isAuthed) this.loadAll()
    else this.loading = false
  }
}
</script>
