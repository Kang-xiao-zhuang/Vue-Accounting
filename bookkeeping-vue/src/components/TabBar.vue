<template>
  <nav class="tab-bar">
    <router-link v-for="t in tabs" :key="t.to" :to="t.to" class="tab-link">
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
        { to: '/add', icon: '➕', label: 'Add' },
        { to: '/records', icon: '🧾', label: 'Records' },
        { to: '/habits', icon: '🔥', label: 'Habits' },
        { to: '/daily', icon: '📋', label: 'Daily' },
        { to: '/timer', icon: '⏲️', label: 'Timer' },
        { to: '/stats', icon: '📊', label: 'Stats' },
        { to: '/me', icon: '👤', label: 'Me' }
      ]
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
.tab-link.router-link-active { color: var(--primary); }
.tab-ico { font-size: 21px; line-height: 1; }
</style>
