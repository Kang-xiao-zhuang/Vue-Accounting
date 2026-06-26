<template>
  <div class="phone">
    <header class="app-header">
      <h1>💰 Bookkeeping</h1>
      <span class="active-user">👤 {{ activeUserName }}</span>
    </header>

    <main class="app-content">
      <p v-if="error" class="error-banner">{{ error }}</p>

      <RecordsView
        v-show="tab === 'records'"
        :period="period" :period-label="periodLabel" :is-current="isCurrentPeriod"
        :income="totalIncome" :expense="totalExpense" :balance="balance" :records="periodRecords"
        @update:period="setPeriod" @shift="shift" @today="goToday"
        @edit="openSheetForEdit" @remove="remove"
      />

      <AddView
        v-show="tab === 'add'"
        :has-user="!!activeUserId"
        @pick="openSheetForCategory"
      />

      <StatsView
        v-show="tab === 'stats'"
        :period="period" :period-label="periodLabel" :is-current="isCurrentPeriod"
        :income="totalIncome" :expense="totalExpense" :balance="balance" :records="periodRecords"
        @update:period="setPeriod" @shift="shift" @today="goToday"
      />

      <ProfileView
        v-show="tab === 'me'"
        :users="users" :active-user-id="activeUserId"
        @select="selectUser" @add="addUser" @rename="renameUser" @delete="deleteUser"
        @clear-records="clearMyRecords"
      />
    </main>

    <TabBar :tab="tab" @change="tab = $event" />

    <EntrySheet
      :visible="sheet.open"
      :editing="!!sheet.editingId"
      :initial="sheet.initial"
      @save="saveSheet"
      @close="closeSheet"
    />
  </div>
</template>

<script>
import api from './api'
import { fmt, weekRange, todayString } from './utils'
import TabBar from './components/TabBar.vue'
import EntrySheet from './components/EntrySheet.vue'
import RecordsView from './views/RecordsView.vue'
import AddView from './views/AddView.vue'
import StatsView from './views/StatsView.vue'
import ProfileView from './views/ProfileView.vue'

export default {
  name: 'App',
  components: { TabBar, EntrySheet, RecordsView, AddView, StatsView, ProfileView },
  data() {
    const today = todayString()
    return {
      today,
      anchor: today,
      period: 'day',
      tab: 'records',
      records: [],
      users: [],
      activeUserId: null,
      error: '',
      sheet: { open: false, editingId: null, initial: null }
    }
  },
  computed: {
    activeUserName() {
      const u = this.users.find(u => u.id === this.activeUserId)
      return u ? u.name : 'No user'
    },
    periodLabel() {
      const t = new Date(this.anchor + 'T00:00:00')
      if (this.period === 'day') {
        const pretty = t.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
        return (this.anchor === this.today ? 'Today · ' : '') + pretty
      } else if (this.period === 'week') {
        const { start, end } = weekRange(t)
        return fmt(start) + ' – ' + fmt(end)
      } else if (this.period === 'month') {
        return t.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      }
      return 'All time'
    },
    isCurrentPeriod() {
      if (this.period === 'all') return true
      if (this.period === 'month') return this.anchor.slice(0, 7) === this.today.slice(0, 7)
      if (this.period === 'week') {
        const a = weekRange(new Date(this.anchor + 'T00:00:00'))
        const n = weekRange(new Date(this.today + 'T00:00:00'))
        return fmt(a.start) === fmt(n.start)
      }
      return this.anchor === this.today
    },
    periodRecords() {
      if (this.period === 'all') return this.records
      const t = new Date(this.anchor + 'T00:00:00')
      if (this.period === 'day') {
        return this.records.filter(r => r.date === this.anchor)
      } else if (this.period === 'week') {
        const { start, end } = weekRange(t)
        const s = fmt(start), e = fmt(end)
        return this.records.filter(r => r.date >= s && r.date <= e)
      } else if (this.period === 'month') {
        const prefix = this.anchor.slice(0, 7)
        return this.records.filter(r => r.date.slice(0, 7) === prefix)
      }
      return this.records
    },
    totalIncome() {
      return this.periodRecords.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0)
    },
    totalExpense() {
      return this.periodRecords.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0)
    },
    balance() {
      return this.totalIncome - this.totalExpense
    }
  },
  methods: {
    // ---- records ----
    async load() {
      if (!this.activeUserId) {
        this.records = []
        return
      }
      try {
        this.records = await api.list(this.activeUserId)
        this.error = ''
      } catch (e) {
        this.error = 'Cannot reach the backend at /api. Make sure the Spring Boot server is running on port 8030.'
      }
    },
    setPeriod(p) { this.period = p },
    shift(dir) {
      const t = new Date(this.anchor + 'T00:00:00')
      if (this.period === 'day') t.setDate(t.getDate() + dir)
      else if (this.period === 'week') t.setDate(t.getDate() + dir * 7)
      else if (this.period === 'month') t.setMonth(t.getMonth() + dir)
      this.anchor = fmt(t)
    },
    goToday() { this.anchor = this.today },

    // ---- entry sheet ----
    openSheetForCategory({ type, category }) {
      if (!this.activeUserId) {
        this.error = 'Add a user on the “Me” tab first.'
        this.tab = 'me'
        return
      }
      this.sheet = {
        open: true,
        editingId: null,
        initial: { type, category, amount: null, date: this.today, note: '' }
      }
    },
    openSheetForEdit(record) {
      this.sheet = {
        open: true,
        editingId: record.id,
        initial: { type: record.type, category: record.category, amount: record.amount, date: record.date, note: record.note }
      }
    },
    closeSheet() {
      this.sheet = { open: false, editingId: null, initial: null }
    },
    async saveSheet(payload) {
      try {
        if (this.sheet.editingId) {
          await api.update(this.sheet.editingId, payload)
        } else {
          await api.create({ ...payload, userId: this.activeUserId })
        }
        this.closeSheet()
        await this.load()
      } catch (e) {
        this.error = 'Save failed. Check that the backend is running.'
      }
    },
    async remove(id) {
      try {
        await api.remove(id)
        await this.load()
      } catch (e) {
        this.error = 'Delete failed.'
      }
    },
    async clearMyRecords() {
      if (!this.activeUserId) return
      if (!confirm(`Delete ALL of ${this.activeUserName}'s records? This cannot be undone.`)) return
      try {
        await api.clear(this.activeUserId)
        await this.load()
      } catch (e) {
        this.error = 'Clear failed. Check that the backend is running.'
      }
    },

    // ---- users (CRUD) ----
    async loadUsers() {
      try {
        this.users = await api.listUsers()
        this.error = ''
      } catch (e) {
        this.error = 'Cannot reach the backend at /api. Make sure the Spring Boot server is running on port 8030.'
        return
      }
      const stored = Number(localStorage.getItem('bookkeeping-active-user'))
      if (stored && this.users.some(u => u.id === stored)) {
        this.activeUserId = stored
      } else if (this.users.length > 0) {
        this.activeUserId = this.users[0].id
      } else {
        this.activeUserId = null
      }
    },
    async selectUser(id) {
      this.activeUserId = id
      localStorage.setItem('bookkeeping-active-user', String(id))
      await this.load()
      this.tab = 'records'
    },
    async addUser(name) {
      try {
        const user = await api.createUser(name)
        await this.loadUsers()
        await this.selectUser(user.id)
        this.tab = 'me'
      } catch (e) {
        this.error = this.apiError(e) || 'Could not add user.'
      }
    },
    async renameUser({ id, name }) {
      try {
        await api.updateUser(id, name)
        await this.loadUsers()
      } catch (e) {
        this.error = this.apiError(e) || 'Could not rename user.'
      }
    },
    async deleteUser(user) {
      if (!confirm(`Delete user "${user.name}"? Their records will no longer be shown.`)) return
      try {
        await api.deleteUser(user.id)
        if (this.activeUserId === user.id) {
          localStorage.removeItem('bookkeeping-active-user')
        }
        await this.loadUsers()
        await this.load()
      } catch (e) {
        this.error = this.apiError(e) || 'Could not delete user.'
      }
    },
    apiError(e) {
      return e && e.response && e.response.data && e.response.data.message
    }
  },
  async mounted() {
    await this.loadUsers()
    await this.load()
    if (this.users.length === 0) this.tab = 'me'
  }
}
</script>
