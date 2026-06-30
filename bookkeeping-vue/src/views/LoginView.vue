<template>
  <div class="login">
    <div class="login-brand">
      <div class="login-logo">💰</div>
      <h1>Daily Bookkeeping</h1>
      <p class="subtitle">{{ mode === 'login' ? 'Welcome back — sign in to continue.' : 'Create an account to get started.' }}</p>
    </div>

    <form class="login-card card" @submit.prevent="submit">
      <div class="field">
        <label for="login-name">Username</label>
        <input id="login-name" v-model="name" autocomplete="username" maxlength="64" placeholder="your name" />
      </div>
      <div class="field">
        <label for="login-pw">Password</label>
        <input
          id="login-pw" v-model="password" type="password"
          :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
          placeholder="••••••" @keyup.enter="submit"
        />
      </div>

      <button class="btn-primary" type="submit" :disabled="!canSubmit || busy">
        {{ busy ? 'Please wait…' : (mode === 'login' ? 'Log in' : 'Create account') }}
      </button>

      <p class="switch">
        {{ mode === 'login' ? "No account yet?" : 'Already have an account?' }}
        <button type="button" class="link" @click="toggleMode">
          {{ mode === 'login' ? 'Register' : 'Log in' }}
        </button>
      </p>
    </form>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { toast } from '../toast'

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
      return this.name.trim().length > 0 && this.password.length >= 4
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
          ? `Welcome back, ${this.authStore.user.name}!`
          : `Account created — welcome, ${this.authStore.user.name}!`)
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
.switch { text-align: center; font-size: 13px; color: var(--muted); }
.link {
  background: none; border: none; color: var(--primary); font-weight: 700;
  cursor: pointer; font-size: 13px; padding: 0 2px;
}
</style>
