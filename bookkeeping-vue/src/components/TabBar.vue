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
        { key: 'records', icon: '🧾', label: 'Records' },
        { key: 'add', icon: '➕', label: 'Add' },
        { key: 'stats', icon: '📊', label: 'Stats' },
        { key: 'me', icon: '👤', label: 'Me' }
      ]
    }
  }
}
</script>
