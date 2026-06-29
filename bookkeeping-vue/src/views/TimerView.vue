<template>
  <div class="timer-view">
    <h2 class="view-title">{{ mode === 'timer' ? 'Timer' : 'Stopwatch' }}</h2>

    <!-- mode switch -->
    <div class="mode-toggle">
      <button :class="{ active: mode === 'timer' }" @click="setMode('timer')">⏲️ Timer</button>
      <button :class="{ active: mode === 'stopwatch' }" @click="setMode('stopwatch')">⏱️ Stopwatch</button>
    </div>

    <div class="dial-wrap">
      <svg class="dial" viewBox="0 0 220 220" @pointerdown="onPointerDown">
        <!-- ===== outer ring = minutes ===== -->
        <circle class="track" cx="110" cy="110" :r="RO" fill="none" :stroke-width="SW" />
        <line
          v-for="t in outerTicks" :key="'o' + t.i"
          :x1="t.x1" :y1="t.y1" :x2="t.x2" :y2="t.y2"
          class="tick" :class="{ major: t.major }"
        />
        <circle
          class="progress min" :class="{ finished }"
          cx="110" cy="110" :r="RO" fill="none" :stroke-width="SW" stroke-linecap="round"
          :stroke-dasharray="CO" :stroke-dashoffset="CO * (1 - outerFrac)"
          transform="rotate(-90 110 110)"
        />
        <circle v-if="mode === 'timer' && status === 'idle'" class="handle" :cx="outerHandle.x" :cy="outerHandle.y" r="10" />

        <!-- ===== inner ring = seconds ===== -->
        <circle class="track" cx="110" cy="110" :r="RI" fill="none" :stroke-width="SW" />
        <line
          v-for="t in innerTicks" :key="'i' + t.i"
          :x1="t.x1" :y1="t.y1" :x2="t.x2" :y2="t.y2"
          class="tick minor"
        />
        <circle
          class="progress sec" :class="{ finished, smooth: mode === 'stopwatch' }"
          cx="110" cy="110" :r="RI" fill="none" :stroke-width="SW" stroke-linecap="round"
          :stroke-dasharray="CI" :stroke-dashoffset="CI * (1 - innerFrac)"
          transform="rotate(-90 110 110)"
        />
        <circle v-if="mode === 'timer' && status === 'idle'" class="handle sec" :cx="innerHandle.x" :cy="innerHandle.y" r="9" />
      </svg>

      <div class="dial-center">
        <div class="time" :class="{ finished }">
          {{ displayMain }}<span v-if="displayCs" class="cs">.{{ displayCs }}</span>
        </div>
        <div class="sub">{{ subLabel }}</div>
      </div>
    </div>

    <!-- ===== Timer mode ===== -->
    <template v-if="mode === 'timer'">
      <div class="presets">
        <button
          v-for="p in presets" :key="p.label"
          class="preset" :class="{ active: status === 'idle' && totalSet === p.sec }"
          @click="setPreset(p)"
        >{{ p.label }}</button>
      </div>
      <div class="controls">
        <button class="btn-cancel" :disabled="status === 'idle'" @click="reset">Reset</button>
        <button class="btn-primary" :disabled="displaySeconds <= 0" @click="toggle">{{ primaryLabel }}</button>
      </div>
    </template>

    <!-- ===== Stopwatch mode ===== -->
    <template v-else>
      <div class="controls">
        <button class="btn-cancel" :disabled="!swRunning && swElapsedMs === 0" @click="swRunning ? lap() : swReset()">
          {{ swRunning ? 'Lap' : 'Reset' }}
        </button>
        <button class="btn-primary" @click="swToggle">{{ swRunning ? 'Stop' : (swElapsedMs > 0 ? 'Resume' : 'Start') }}</button>
      </div>

      <div v-if="lapRows.length" class="laps">
        <div class="lap-row" v-for="r in lapRows" :key="r.n">
          <span class="lap-n">Lap {{ r.n }}</span>
          <span class="lap-split">+{{ r.split }}</span>
          <span class="lap-total">{{ r.total }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
const RO = 92, RI = 64, SW = 11
const CO = 2 * Math.PI * RO
const CI = 2 * Math.PI * RI
const STORE_KEY = 'bookkeeping-timer'
const SW_KEY = 'bookkeeping-stopwatch'

function pointOn(r, v) {
  const a = (v / 60) * 2 * Math.PI
  return { x: 110 + r * Math.sin(a), y: 110 - r * Math.cos(a) }
}
const pad = (n) => String(n).padStart(2, '0')

// ms -> "MM:SS" or "H:MM:SS"
function fmtClock(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export default {
  name: 'TimerView',
  data() {
    return {
      RO, RI, SW, CO, CI,
      mode: 'timer',
      presets: [
        { label: '30s', sec: 30 }, { label: '1m', sec: 60 }, { label: '3m', sec: 180 },
        { label: '5m', sec: 300 }, { label: '10m', sec: 600 }, { label: '25m', sec: 1500 }
      ],
      // timer
      setMin: 5, setSec: 0,
      remainingSec: 300,
      status: 'idle',            // idle | running | paused | finished
      endAt: null,
      timerId: null,
      audioCtx: null,
      dragRing: 'min',
      // stopwatch
      swRunning: false,
      swBaseMs: 0,               // accumulated before current run
      swStartedAt: null,         // when current run began
      swElapsedMs: 0,            // displayed elapsed
      swLaps: [],                // absolute ms at each lap
      swId: null
    }
  },
  computed: {
    finished() { return this.mode === 'timer' && this.status === 'finished' },
    totalSet() { return this.setMin * 60 + this.setSec },
    displaySeconds() { return this.status === 'idle' ? this.totalSet : this.remainingSec },
    dispMin() { return Math.floor(this.displaySeconds / 60) },
    dispSec() { return this.displaySeconds % 60 },
    outerFrac() {
      if (this.mode === 'stopwatch') return (Math.floor(this.swElapsedMs / 60000) % 60) / 60
      return Math.min(1, this.dispMin / 60)
    },
    innerFrac() {
      if (this.mode === 'stopwatch') return ((this.swElapsedMs / 1000) % 60) / 60
      return this.dispSec / 60
    },
    outerHandle() { return pointOn(RO, this.dispMin) },
    innerHandle() { return pointOn(RI, this.dispSec) },
    displayMain() {
      return this.mode === 'stopwatch'
        ? fmtClock(this.swElapsedMs)
        : pad(Math.max(0, this.dispMin)) + ':' + pad(Math.max(0, this.dispSec))
    },
    displayCs() {
      return this.mode === 'stopwatch' ? pad(Math.floor((this.swElapsedMs % 1000) / 10)) : ''
    },
    subLabel() {
      if (this.mode === 'stopwatch') {
        return this.swRunning ? 'Running' : (this.swElapsedMs > 0 ? 'Stopped' : 'Stopwatch')
      }
      if (this.status === 'running') return 'Remaining'
      if (this.status === 'paused') return 'Paused'
      if (this.status === 'finished') return "Time's up!"
      return 'Outer = min · inner = sec'
    },
    primaryLabel() {
      if (this.status === 'running') return 'Pause'
      if (this.status === 'paused') return 'Resume'
      if (this.status === 'finished') return 'Start again'
      return 'Start'
    },
    outerTicks() { return this.buildTicks(84, 78, 74, true) },
    innerTicks() { return this.buildTicks(57, 52, 52, false) },
    lapRows() {
      const rows = []
      for (let i = 0; i < this.swLaps.length; i++) {
        const total = this.swLaps[i]
        const split = total - (i > 0 ? this.swLaps[i - 1] : 0)
        rows.push({ n: i + 1, total: fmtClock(total) + '.' + pad(Math.floor((total % 1000) / 10)), split: fmtClock(split) + '.' + pad(Math.floor((split % 1000) / 10)) })
      }
      return rows.reverse()
    }
  },
  methods: {
    setMode(m) { this.mode = m; this.persistSw() },
    buildTicks(rOut, rMinor, rMajor, withMajor) {
      const out = []
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * 2 * Math.PI
        const major = withMajor && i % 5 === 0
        const rIn = major ? rMajor : rMinor
        out.push({
          i,
          x1: 110 + rOut * Math.sin(a), y1: 110 - rOut * Math.cos(a),
          x2: 110 + rIn * Math.sin(a), y2: 110 - rIn * Math.cos(a),
          major
        })
      }
      return out
    },

    // ---- dial dragging (timer only) ----
    onPointerDown(e) {
      if (this.mode !== 'timer' || this.status !== 'idle') return
      const rect = this.$el.querySelector('.dial').getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      const dUnits = Math.sqrt(dx * dx + dy * dy) * (220 / rect.width)
      this.dragRing = dUnits >= (RO + RI) / 2 ? 'min' : 'sec'
      this.updateFromEvent(e)
      this._move = (ev) => this.updateFromEvent(ev)
      this._up = () => {
        window.removeEventListener('pointermove', this._move)
        window.removeEventListener('pointerup', this._up)
      }
      window.addEventListener('pointermove', this._move)
      window.addEventListener('pointerup', this._up)
    },
    updateFromEvent(e) {
      const rect = this.$el.querySelector('.dial').getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      let a = Math.atan2(dx, -dy)
      if (a < 0) a += 2 * Math.PI
      const val = Math.round((a / (2 * Math.PI)) * 60) % 60
      if (this.dragRing === 'min') this.setMin = val
      else this.setSec = val
      this.remainingSec = this.totalSet
      this.persist()
    },
    setPreset(p) {
      if (this.status === 'running') return
      this.setMin = Math.floor(p.sec / 60)
      this.setSec = p.sec % 60
      this.remainingSec = this.totalSet
      this.status = 'idle'
      this.endAt = null
      this.persist()
    },

    // ---- timer run control ----
    toggle() {
      if (this.status === 'running') { this.pause(); return }
      if (this.status === 'idle' || this.status === 'finished') this.remainingSec = this.totalSet
      this.start()
    },
    start() {
      if (this.remainingSec <= 0) return
      this.ensureAudio()
      this.status = 'running'
      this.endAt = Date.now() + this.remainingSec * 1000
      this.startTick()
      this.persist()
    },
    pause() {
      this.remainingSec = this.computeRemaining()
      this.status = 'paused'
      this.endAt = null
      this.clearTick()
      this.persist()
    },
    reset() {
      this.clearTick()
      this.status = 'idle'
      this.remainingSec = this.totalSet
      this.endAt = null
      this.persist()
    },
    computeRemaining() {
      return this.endAt ? Math.max(0, Math.round((this.endAt - Date.now()) / 1000)) : this.remainingSec
    },
    startTick() {
      this.clearTick()
      this.timerId = setInterval(() => {
        this.remainingSec = this.computeRemaining()
        if (this.remainingSec <= 0) this.finish()
      }, 250)
    },
    clearTick() { if (this.timerId) { clearInterval(this.timerId); this.timerId = null } },
    finish() {
      this.clearTick()
      this.status = 'finished'
      this.remainingSec = 0
      this.endAt = null
      this.persist()
      this.alarm()
    },

    // ---- stopwatch ----
    swToggle() { this.swRunning ? this.swStop() : this.swStart() },
    swStart() {
      this.swStartedAt = Date.now()
      this.swRunning = true
      this.startSwTick()
      this.persistSw()
    },
    swStop() {
      this.swBaseMs += Date.now() - this.swStartedAt
      this.swStartedAt = null
      this.swRunning = false
      this.swElapsedMs = this.swBaseMs
      this.clearSwTick()
      this.persistSw()
    },
    swReset() {
      this.clearSwTick()
      this.swRunning = false
      this.swBaseMs = 0
      this.swStartedAt = null
      this.swElapsedMs = 0
      this.swLaps = []
      this.persistSw()
    },
    lap() {
      this.swLaps.push(this.swElapsedMs)
      this.persistSw()
    },
    computeSwElapsed() {
      return this.swBaseMs + (this.swRunning && this.swStartedAt ? Date.now() - this.swStartedAt : 0)
    },
    startSwTick() {
      this.clearSwTick()
      this.swId = setInterval(() => { this.swElapsedMs = this.computeSwElapsed() }, 47)
    },
    clearSwTick() { if (this.swId) { clearInterval(this.swId); this.swId = null } },

    // ---- alarm ----
    ensureAudio() {
      try {
        if (!this.audioCtx) {
          const AC = window.AudioContext || window.webkitAudioContext
          if (AC) this.audioCtx = new AC()
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume()
      } catch (e) { /* no audio */ }
    },
    alarm() {
      const ctx = this.audioCtx
      if (ctx) {
        const now = ctx.currentTime
        for (let i = 0; i < 4; i++) {
          const t = now + i * 0.5
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain); gain.connect(ctx.destination)
          osc.type = 'sine'; osc.frequency.value = 880
          gain.gain.setValueAtTime(0.0001, t)
          gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02)
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4)
          osc.start(t); osc.stop(t + 0.42)
        }
      }
      if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300])
    },

    // ---- persistence ----
    persist() {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify({
          setMin: this.setMin, setSec: this.setSec,
          remainingSec: this.remainingSec, status: this.status, endAt: this.endAt
        }))
      } catch (e) { /* ignore */ }
    },
    persistSw() {
      try {
        localStorage.setItem(SW_KEY, JSON.stringify({
          mode: this.mode, running: this.swRunning, baseMs: this.swBaseMs,
          startedAt: this.swStartedAt, laps: this.swLaps
        }))
      } catch (e) { /* ignore */ }
    },
    restore() {
      let s
      try { s = JSON.parse(localStorage.getItem(STORE_KEY)) } catch (e) { s = null }
      if (s) {
        this.setMin = s.setMin ?? 5
        this.setSec = s.setSec ?? 0
        this.remainingSec = s.remainingSec ?? this.totalSet
        if (s.status === 'running' && s.endAt) {
          this.endAt = s.endAt
          const rem = this.computeRemaining()
          if (rem > 0) { this.remainingSec = rem; this.status = 'running'; this.startTick() }
          else { this.status = 'finished'; this.remainingSec = 0; this.endAt = null }
        } else if (s.status === 'paused') {
          this.status = 'paused'
        } else {
          this.status = 'idle'; this.remainingSec = this.totalSet
        }
      }

      let w
      try { w = JSON.parse(localStorage.getItem(SW_KEY)) } catch (e) { w = null }
      if (w) {
        this.mode = w.mode === 'stopwatch' ? 'stopwatch' : 'timer'
        this.swBaseMs = w.baseMs ?? 0
        this.swLaps = Array.isArray(w.laps) ? w.laps : []
        if (w.running && w.startedAt) {
          this.swStartedAt = w.startedAt
          this.swRunning = true
          this.swElapsedMs = this.computeSwElapsed()
          this.startSwTick()
        } else {
          this.swElapsedMs = this.swBaseMs
        }
      }
    }
  },
  mounted() { this.restore() },
  beforeUnmount() { this.clearTick(); this.clearSwTick() }
}
</script>

<style scoped>
.timer-view { display: flex; flex-direction: column; }

.mode-toggle { display: flex; gap: 8px; margin: 4px 0 6px; }
.mode-toggle button {
  flex: 1; padding: 10px; border: 1px solid var(--border);
  background: var(--input); border-radius: 10px; cursor: pointer;
  font-size: 14px; font-weight: 600; color: var(--muted); transition: .15s;
}
.mode-toggle button.active { background: var(--primary); color: #fff; border-color: var(--primary); }

.dial-wrap {
  position: relative; width: 100%; max-width: 300px;
  margin: 12px auto 4px; aspect-ratio: 1 / 1;
}
.dial { width: 100%; height: 100%; display: block; touch-action: none; cursor: pointer; }

.track { stroke: var(--input); }
.progress { transition: stroke-dashoffset .25s linear; }
.progress.smooth { transition: stroke-dashoffset .05s linear; }
.progress.min { stroke: var(--primary); }
.progress.sec { stroke: var(--income); }
.progress.finished { stroke: var(--expense); }
.tick { stroke: var(--border); stroke-width: 2; }
.tick.major { stroke: var(--muted); stroke-width: 2.5; }
.tick.minor { stroke: var(--border); stroke-width: 1.5; }
.handle { fill: var(--primary); stroke: var(--card); stroke-width: 3; cursor: grab; }
.handle.sec { fill: var(--income); }

.dial-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  pointer-events: none;
}
.time { font-size: 44px; font-weight: 800; letter-spacing: 1px; font-variant-numeric: tabular-nums; }
.time .cs { font-size: 22px; font-weight: 700; color: var(--muted); }
.time.finished { color: var(--expense); animation: blink 1s steps(2, start) infinite; }
@keyframes blink { 50% { opacity: .3; } }
.sub { font-size: 11px; color: var(--muted); margin-top: 4px; }

.presets { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin: 16px 0 8px; }
.preset {
  padding: 8px 14px; border: 1px solid var(--border);
  background: var(--input); color: var(--muted);
  border-radius: 999px; font-size: 14px; font-weight: 600; cursor: pointer; transition: .12s;
}
.preset:hover { color: var(--text); border-color: var(--primary); }
.preset.active { background: var(--primary); color: #fff; border-color: var(--primary); }

.controls { display: flex; gap: 10px; margin-top: 10px; }
.btn-primary {
  flex: 1; padding: 13px; border: none;
  background: var(--primary); color: #fff; border-radius: 12px;
  font-size: 16px; font-weight: 700; cursor: pointer; transition: .15s;
}
.btn-primary:hover:not(:disabled) { background: var(--primary-dark); }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }
.btn-cancel {
  padding: 13px 20px; border: 1px solid var(--border); background: var(--input);
  color: var(--muted); border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer;
}
.btn-cancel:hover:not(:disabled) { color: var(--text); }
.btn-cancel:disabled { opacity: .4; cursor: not-allowed; }

.laps { margin-top: 14px; display: flex; flex-direction: column; gap: 1px; max-height: 220px; overflow-y: auto; }
.lap-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 4px; border-bottom: 1px solid var(--border);
  font-size: 14px; font-variant-numeric: tabular-nums;
}
.lap-n { color: var(--muted); font-weight: 600; }
.lap-split { color: var(--income); font-weight: 600; }
.lap-total { color: var(--text); font-weight: 700; }
</style>
