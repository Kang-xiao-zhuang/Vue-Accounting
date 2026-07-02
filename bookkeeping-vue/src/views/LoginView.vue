<template>
  <div class="login">
    <div class="login-brand">
      <div class="login-logo">💰</div>
      <h1>{{ $t('app.name') }}</h1>
      <p class="subtitle">{{ mode === 'login' ? $t('login.subLogin') : $t('login.subRegister') }}</p>
    </div>

    <form class="login-card card" @submit.prevent="submit">
      <div class="field">
        <label for="login-name">{{ $t('login.username') }}</label>
        <input id="login-name" v-model="name" autocomplete="username" maxlength="64" :placeholder="$t('login.usernamePh')" />
      </div>
      <div class="field">
        <label for="login-pw">{{ $t('login.password') }}</label>
        <input
          id="login-pw" v-model="password" type="password"
          :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
          placeholder="••••••" @keyup.enter="submit"
        />
        <p v-if="mode === 'register'" class="pw-hint">{{ $t('login.pwHint') }}</p>
      </div>

      <button class="btn-primary" type="submit" :disabled="!canSubmit || busy">
        {{ busy ? $t('login.busy') : (mode === 'login' ? $t('login.login') : $t('login.register')) }}
      </button>

      <p class="switch">
        {{ mode === 'login' ? $t('login.noAccount') : $t('login.haveAccount') }}
        <button type="button" class="link" @click="toggleMode">
          {{ mode === 'login' ? $t('login.toRegister') : $t('login.toLogin') }}
        </button>
      </p>
    </form>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { toast } from '../toast'
import { t } from '../i18n'

export default {
  name: 'LoginView',
  setup() {
    return { authStore: useAuthStore() }
  },
  data() {
    return { mode: 'login', name: '', password: '', busy: false }
  },
  computed: {
    canSubmit() {
      return this.name.trim().length > 0 && this.password.length >= 6
    }
  },
  methods: {
    toggleMode() {
      this.mode = this.mode === 'login' ? 'register' : 'login'
    },
    async submit() {
      if (!this.canSubmit || this.busy) return
      this.busy = true
      try {
        const name = this.name.trim()
        if (this.mode === 'login') await this.authStore.login(name, this.password)
        else await this.authStore.register(name, this.password)
        toast.success(this.mode === 'login'
          ? t('login.welcomeBack', { name: this.authStore.user.name })
          : t('login.created', { name: this.authStore.user.name }))
        this.password = ''
        this.$router.push({ name: 'records' })
      } catch (e) {
        // error toast already shown by the axios interceptor
      } finally {
        this.busy = false
      }
    }
  }
}
</script>

<style scoped>
.login {
  flex: 1; display: flex; flex-direction: column; justify-content: center;
  padding: 24px 20px; gap: 22px;
}
.login-brand { text-align: center; }
.login-logo {
  width: 64px; height: 64px; margin: 0 auto 12px; border-radius: 18px;
  background: var(--input); display: flex; align-items: center; justify-content: center; font-size: 32px;
}
.login-brand h1 { font-size: 22px; }
.login-brand .subtitle { margin-top: 6px; }

.login-card { display: flex; flex-direction: column; gap: 14px; }
.field label { display: block; font-size: 13px; color: var(--muted); margin-bottom: 5px; }
.btn-primary {
  margin-top: 4px; padding: 13px; border: none;
  background: var(--primary); color: #fff; border-radius: 11px;
  font-size: 16px; font-weight: 700; cursor: pointer; transition: .15s;
}
.btn-primary:hover:not(:disabled) { background: var(--primary-dark); }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }
.pw-hint { font-size: 12px; color: var(--muted); margin-top: 6px; }
.switch { text-align: center; font-size: 13px; color: var(--muted); }
.link {
  background: none; border: none; color: var(--primary); font-weight: 700;
  cursor: pointer; font-size: 13px; padding: 0 2px;
}
</style>
