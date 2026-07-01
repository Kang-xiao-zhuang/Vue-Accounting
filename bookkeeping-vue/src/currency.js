import { reactive } from 'vue'
import { formatMoney } from './utils'

const KEY = 'bookkeeping-currency'

// Reactive currency symbol, shared app-wide and persisted.
export const currencyState = reactive({
  symbol: localStorage.getItem(KEY) || '$'
})

// Common choices offered in settings.
export const currencyOptions = ['$', '¥', 'NT$', '€', '£', '₩', '₫', '฿']

export function setCurrency(sym) {
  currencyState.symbol = sym
  localStorage.setItem(KEY, sym)
}

/** Format a number as money with the current symbol, e.g. money(1234.5) -> "$1,234.50". */
export function money(v) {
  return currencyState.symbol + formatMoney(v)
}
