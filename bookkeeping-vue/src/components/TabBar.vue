<template>
  <nav class="tab-bar">
    <button
      v-for="t in tabs"
      :key="t.key"
      :class="{ active: tab === t.key }"
      @click="$emit('change', t.key)"
    >
      <span class="tab-ico">{{ t.icon }}</span>
      <span>{{ t.label }}</span>
    </button>
  </nav>
</template>

<script>
export default {
  name: 'TabBar',
  props: {
    tab: { type: String, required: true }
  },
  emits: ['change'],
  data() {
    return {
      tabs: [
        { key: 'add', icon: '➕', label: 'Add' },
        { key: 'records', icon: '🧾', label: 'Records' },
        { key: 'habits', icon: '🔥', label: 'Habits' },
        { key: 'todos', icon: '📋', label: 'Daily' },
        { key: 'timer', icon: '⏲️', label: 'Timer' },
        { key: 'stats', icon: '📊', label: 'Stats' },
        { key: 'me', icon: '👤', label: 'Me' }
      ]
    }
  }
}
</script>
