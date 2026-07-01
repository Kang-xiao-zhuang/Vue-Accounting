// Format a Date to a local YYYY-MM-DD string.
export function fmt(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayString() {
  return fmt(new Date())
}

// Monday-based week range for a given date.
export function weekRange(d) {
  const day = (d.getDay() + 6) % 7 // 0 = Monday
  const start = new Date(d)
  start.setDate(d.getDate() - day)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start, end }
}

export function prettyToday() {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  })
}

// ===== Money =====
// JS floats drift (0.1 + 0.2 !== 0.3), which is unacceptable for a ledger.
// We sum in integer cents and only divide back to a number at the end.

/** Round a number to 2 decimal places, safely. */
export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100
}

/** Sum the `amount` of a list of records without floating-point drift. */
export function sumAmount(records) {
  const cents = records.reduce((s, r) => s + Math.round(Number(r.amount) * 100), 0)
  return cents / 100
}

/** Format a money value as a fixed 2-decimal, grouped string, e.g. 1234.5 -> "1,234.50". */
export function formatMoney(n) {
  return round2(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ===== Habit streaks =====

/** Consecutive check-in days ending today (or yesterday, so today isn't "missed" yet). */
export function currentStreak(checkins, today) {
  const set = new Set(checkins || [])
  let streak = 0
  const d = new Date(today + 'T00:00:00')
  if (!set.has(fmt(d))) d.setDate(d.getDate() - 1) // allow a streak ending yesterday
  while (set.has(fmt(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

/** Longest run of consecutive check-in days across all history. */
export function longestStreak(checkins) {
  const dates = (checkins || []).slice().sort()
  if (dates.length === 0) return 0
  let best = 1, run = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + 'T00:00:00')
    const cur = new Date(dates[i] + 'T00:00:00')
    const diff = Math.round((cur - prev) / 86400000)
    if (diff === 0) continue // duplicate date
    run = diff === 1 ? run + 1 : 1
    if (run > best) best = run
  }
  return best
}
