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
      <span>{{ t.label }}</span>
    </router-link>
  </nav>
</template>

<script>
export default {
  name: 'TabBar',
  data() {
    return {
      tabs: [
        { to: '/records', icon: '🧾', label: 'Records', match: ['records'] },
        { to: '/add', icon: '➕', label: 'Add', match: ['add'] },
        { to: '/stats', icon: '📊', label: 'Stats', match: ['stats'] },
        // "More" stays highlighted while on any of its sub-pages.
        { to: '/more', icon: '⋯', label: 'More', match: ['more', 'habits', 'daily', 'timer', 'budgets', 'recurring', 'me'] }
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
