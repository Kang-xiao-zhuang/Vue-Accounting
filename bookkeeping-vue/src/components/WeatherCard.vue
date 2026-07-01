<template>
  <div>
    <button class="weather-card card" @click="sheetOpen = true">
      <template v-if="w.loading && w.temp === null">
        <span class="w-ico">⏳</span>
        <span class="w-main muted">…</span>
      </template>
      <template v-else-if="w.temp !== null">
        <span class="w-ico">{{ icon }}</span>
        <span class="w-main">{{ w.temp }}° · {{ $t(descKey) }}</span>
        <span class="w-city">{{ w.city || $t('weather.myLocation') }}</span>
        <span class="w-edit">📍</span>
      </template>
      <template v-else>
        <span class="w-ico">🌡️</span>
        <span class="w-main muted">{{ $t('weather.setLocation') }}</span>
        <span class="w-edit">›</span>
      </template>
    </button>

    <BottomSheet :visible="sheetOpen" :title="$t('weather.chooseLocation')" @close="sheetOpen = false">
      <button class="loc-btn" @click="locate">{{ $t('weather.useMyLocation') }}</button>
      <input class="loc-search" v-model="q" :placeholder="$t('weather.searchPh')" @input="onSearch" />
      <div class="loc-results">
        <button v-for="r in results" :key="r.lat + ',' + r.lon" class="loc-item" @click="choose(r)">
          <span>{{ r.name }}</span>
          <span class="loc-sub">{{ [r.admin, r.country].filter(Boolean).join(', ') }}</span>
        </button>
      </div>
    </BottomSheet>
  </div>
</template>

<script>
import { weatherState, weatherIcon, weatherDescKey, initWeather, useMyLocation, searchCity, setCity } from '../weather'
import BottomSheet from './BottomSheet.vue'

export default {
  name: 'WeatherCard',
  components: { BottomSheet },
  data() {
    return { sheetOpen: false, q: '', results: [] }
  },
  computed: {
    w() { return weatherState },
    icon() { return weatherIcon() },
    descKey() { return weatherDescKey() }
  },
  methods: {
    locate() { useMyLocation(); this.sheetOpen = false },
    onSearch() {
      clearTimeout(this._timer)
      this._timer = setTimeout(async () => { this.results = await searchCity(this.q) }, 300)
    },
    choose(r) {
      setCity(r)
      this.sheetOpen = false
      this.q = ''
      this.results = []
    }
  },
  mounted() { initWeather() }
}
</script>

<style scoped>
.weather-card {
  width: 100%; display: flex; align-items: center; gap: 10px; cursor: pointer;
  border: none; text-align: left; margin-bottom: 14px; color: var(--text); font: inherit;
}
.w-ico { font-size: 24px; flex-shrink: 0; }
.w-main { font-size: 15px; font-weight: 600; }
.w-main.muted { color: var(--muted); font-weight: 500; }
.w-city { flex: 1; text-align: right; font-size: 13px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.w-edit { flex-shrink: 0; color: var(--muted); font-size: 14px; }

.loc-btn {
  padding: 11px; border: 1px solid var(--primary); background: var(--input); color: var(--primary);
  border-radius: 11px; font-size: 15px; font-weight: 600; cursor: pointer;
}
.loc-btn:hover { background: var(--primary); color: #fff; }
.loc-search { width: 100%; }
.loc-results { display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
.loc-item {
  display: flex; flex-direction: column; gap: 2px; text-align: left;
  background: none; border: none; border-bottom: 1px solid var(--border);
  padding: 10px 4px; cursor: pointer; color: var(--text); font-size: 15px;
}
.loc-item:hover { background: var(--input); }
.loc-sub { font-size: 12px; color: var(--muted); }
</style>
