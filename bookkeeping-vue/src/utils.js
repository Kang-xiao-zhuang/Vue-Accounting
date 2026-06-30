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
