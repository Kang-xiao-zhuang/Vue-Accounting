<template>
  <div>
    <h2 class="view-title">More</h2>
    <div class="more-grid">
      <router-link v-for="i in items" :key="i.to" :to="i.to" class="more-card">
        <span class="mc-ico">{{ i.icon }}</span>
        <span class="mc-text">
          <span class="mc-label">{{ i.label }}</span>
          <span class="mc-desc">{{ i.desc }}</span>
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
        { to: '/habits', icon: '🔥', label: 'Habits', desc: 'Track daily habits & streaks' },
        { to: '/daily', icon: '📋', label: 'Daily Checklist', desc: 'To-dos per day' },
        { to: '/timer', icon: '⏲️', label: 'Timer', desc: 'Countdown & stopwatch' },
        { to: '/budgets', icon: '🎯', label: 'Budgets', desc: 'Monthly spending limits' },
        { to: '/recurring', icon: '🔁', label: 'Recurring', desc: 'Auto-generated entries' },
        { to: '/me', icon: '👤', label: 'Account', desc: 'Profile & log out' }
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
