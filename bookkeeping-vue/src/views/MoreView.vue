<template>
  <div>
    <h2 class="view-title">{{ $t('more.title') }}</h2>
    <div class="more-grid">
      <router-link v-for="i in items" :key="i.to" :to="i.to" class="more-card">
        <span class="mc-ico">{{ i.icon }}</span>
        <span class="mc-text">
          <span class="mc-label">{{ $t(i.labelKey) }}</span>
          <span class="mc-desc">{{ $t(i.descKey) }}</span>
        </span>
        <span class="mc-arrow">›</span>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MoreView',
  data() {
    return {
      items: [
        { to: '/history', icon: '📜', labelKey: 'more.history', descKey: 'more.historyDesc' },
        { to: '/habits', icon: '🔥', labelKey: 'more.habits', descKey: 'more.habitsDesc' },
        { to: '/daily', icon: '📋', labelKey: 'more.daily', descKey: 'more.dailyDesc' },
        { to: '/timer', icon: '⏲️', labelKey: 'more.timer', descKey: 'more.timerDesc' },
        { to: '/budgets', icon: '🎯', labelKey: 'more.budgets', descKey: 'more.budgetsDesc' },
        { to: '/recurring', icon: '🔁', labelKey: 'more.recurring', descKey: 'more.recurringDesc' },
        { to: '/me', icon: '👤', labelKey: 'more.account', descKey: 'more.accountDesc' }
      ]
    }
  }
}
</script>

<style scoped>
.more-grid { display: flex; flex-direction: column; gap: 10px; }
.more-card {
  display: flex; align-items: center; gap: 14px;
  text-decoration: none; color: var(--text);
  background: var(--card); border: 1px solid var(--border);
  border-radius: 14px; padding: 14px 16px; box-shadow: var(--shadow);
  transition: .12s;
}
.more-card:hover { border-color: var(--primary); transform: translateY(-1px); }
.mc-ico {
  width: 42px; height: 42px; flex-shrink: 0; border-radius: 11px; background: var(--input);
  display: flex; align-items: center; justify-content: center; font-size: 22px;
}
.mc-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.mc-label { font-size: 16px; font-weight: 700; }
.mc-desc { font-size: 12px; color: var(--muted); }
.mc-arrow { flex-shrink: 0; color: var(--muted); font-size: 22px; }
</style>
