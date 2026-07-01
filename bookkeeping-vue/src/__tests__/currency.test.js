import { describe, it, expect } from 'vitest'
import { money, setCurrency, currencyState } from '../currency'

describe('currency', () => {
  it('defaults to $ and formats with the symbol', () => {
    expect(currencyState.symbol).toBe('$')
    expect(money(5)).toBe('$5.00')
    expect(money(1234.5)).toBe('$1,234.50')
  })

  it('setCurrency changes the symbol used by money()', () => {
    setCurrency('¥')
    expect(currencyState.symbol).toBe('¥')
    expect(money(5)).toBe('¥5.00')
    setCurrency('$') // restore
  })
})
