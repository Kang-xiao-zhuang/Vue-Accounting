import { reactive } from 'vue'
import { localeState } from './i18n'

const LS = 'bookkeeping-weather-loc'

export const weatherState = reactive({
  loading: false,
  error: false,
  temp: null,   // °C, rounded
  code: null,   // WMO weather code
  city: '',
  lat: null,
  lon: null
})

// WMO weather code -> emoji + i18n description key.
const WMO = {
  0: ['☀️', 'weather.clear'],
  1: ['🌤️', 'weather.mainlyClear'],
  2: ['⛅', 'weather.partlyCloudy'],
  3: ['☁️', 'weather.overcast'],
  45: ['🌫️', 'weather.fog'], 48: ['🌫️', 'weather.fog'],
  51: ['🌦️', 'weather.drizzle'], 53: ['🌦️', 'weather.drizzle'], 55: ['🌦️', 'weather.drizzle'],
  56: ['🌦️', 'weather.drizzle'], 57: ['🌦️', 'weather.drizzle'],
  61: ['🌧️', 'weather.rain'], 63: ['🌧️', 'weather.rain'], 65: ['🌧️', 'weather.rain'],
  66: ['🌧️', 'weather.rain'], 67: ['🌧️', 'weather.rain'],
  71: ['🌨️', 'weather.snow'], 73: ['🌨️', 'weather.snow'], 75: ['🌨️', 'weather.snow'], 77: ['🌨️', 'weather.snow'],
  80: ['🌦️', 'weather.showers'], 81: ['🌦️', 'weather.showers'], 82: ['🌦️', 'weather.showers'],
  85: ['🌨️', 'weather.snow'], 86: ['🌨️', 'weather.snow'],
  95: ['⛈️', 'weather.thunder'], 96: ['⛈️', 'weather.thunder'], 99: ['⛈️', 'weather.thunder']
}

export function weatherIcon() {
  const m = WMO[weatherState.code]
  return m ? m[0] : '🌡️'
}
export function weatherDescKey() {
  const m = WMO[weatherState.code]
  return m ? m[1] : 'weather.unknown'
}

async function fetchWeather(lat, lon) {
  weatherState.loading = true
  weatherState.error = false
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
    const res = await fetch(url)
    const data = await res.json()
    if (!data.current) throw new Error('no data')
    weatherState.temp = Math.round(data.current.temperature_2m)
    weatherState.code = data.current.weather_code
    weatherState.lat = lat
    weatherState.lon = lon
  } catch (e) {
    weatherState.error = true
  } finally {
    weatherState.loading = false
  }
}

async function reverseCity(lat, lon) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${localeState.lang}`
    const res = await fetch(url)
    const data = await res.json()
    return data.city || data.locality || data.principalSubdivision || ''
  } catch (e) {
    return ''
  }
}

function save() {
  localStorage.setItem(LS, JSON.stringify({ lat: weatherState.lat, lon: weatherState.lon, city: weatherState.city }))
}

export function useMyLocation() {
  if (!navigator.geolocation) {
    weatherState.error = true
    return
  }
  weatherState.loading = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords
      await fetchWeather(latitude, longitude)
      weatherState.city = await reverseCity(latitude, longitude)
      save()
    },
    () => { weatherState.loading = false; weatherState.error = true },
    { timeout: 8000, maximumAge: 600000 }
  )
}

export async function searchCity(q) {
  if (!q || !q.trim()) return []
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=6&language=${localeState.lang}`
    const res = await fetch(url)
    const data = await res.json()
    return (data.results || []).map(r => ({
      name: r.name,
      admin: r.admin1 || '',
      country: r.country || '',
      lat: r.latitude,
      lon: r.longitude
    }))
  } catch (e) {
    return []
  }
}

export async function setCity(c) {
  weatherState.city = c.name
  await fetchWeather(c.lat, c.lon)
  save()
}

/** Load saved location, or try geolocation on first use. Skips if already loaded. */
export function initWeather() {
  if (weatherState.temp != null || weatherState.loading) return
  let saved = null
  try { saved = JSON.parse(localStorage.getItem(LS) || 'null') } catch (e) { /* ignore */ }
  if (saved && saved.lat != null) {
    weatherState.city = saved.city || ''
    fetchWeather(saved.lat, saved.lon)
  } else {
    useMyLocation()
  }
}
