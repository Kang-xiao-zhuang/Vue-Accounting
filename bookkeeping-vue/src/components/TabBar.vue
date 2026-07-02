<template>
  <nav class="tab-bar">
    <router-link
      v-for="t in tabs"
      :key="t.to"
      :to="t.to"
      class="tab-link"
      :class="{ active: isActive(t) }"
    >
      <span class="tab-ico">{{ t.icon }}</span>
      <span>{{ $t(t.labelKey) }}</span>
    </router-link>
  </nav>
</template>

<script>
export default {
  name: 'TabBar',
  data() {
    return {
      tabs: [
        { to: '/records', icon: '🧾', labelKey: 'nav.records', match: ['records'] },
        { to: '/add', icon: '➕', labelKey: 'nav.add', match: ['add'] },
        { to: '/stats', icon: '📊', labelKey: 'nav.stats', match: ['stats'] },
        // "More" stays highlighted while on any of its sub-pages.
        { to: '/more', icon: '⋯', labelKey: 'nav.more', match: ['more', 'habits', 'daily', 'timer', 'budgets', 'recurring', 'history', 'me'] }
      ]
    }
  },
  methods: {
    isActive(t) {
      return t.match.includes(this.$route.name)
    }
  }
}
</script>

<style scoped>
.tab-link {
  flex: 1; text-decoration: none; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  color: var(--muted); font-size: 11px; font-weight: 600; transition: color .15s;
}
.tab-link.active { color: var(--primary); }
.tab-ico { font-size: 21px; line-height: 1; }
</style>
