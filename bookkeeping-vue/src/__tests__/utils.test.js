import { describe, it, expect } from 'vitest'
import {
  round2, sumAmount, formatMoney, fmt, weekRange, currentStreak, longestStreak
} from '../utils'

describe('money math', () => {
  it('round2 avoids float drift', () => {
    expect(round2(0.1 + 0.2)).toBe(0.3)
    expect(round2(3.14159)).toBe(3.14)
    expect(round2(10)).toBe(10)
  })

  it('sumAmount sums in integer cents (no drift)', () => {
    expect(sumAmount([{ amount: 0.1 }, { amount: 0.2 }])).toBe(0.3)
    expect(sumAmount([{ amount: '10.50' }, { amount: '5.25' }])).toBe(15.75)
    expect(sumAmount([])).toBe(0)
  })

  it('formatMoney gives grouped 2-decimal strings', () => {
    expect(formatMoney(1234.5)).toBe('1,234.50')
    expect(formatMoney(0)).toBe('0.00')
    expect(formatMoney(1000000)).toBe('1,000,000.00')
  })
})

describe('dates', () => {
  it('fmt formats a Date as YYYY-MM-DD', () => {
    expect(fmt(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(fmt(new Date(2026, 11, 31))).toBe('2026-12-31')
  })

  it('weekRange returns a Monday-based 7-day window containing the date', () => {
    const { start, end } = weekRange(new Date('2026-06-30T00:00:00'))
    expect(start.getDay()).toBe(1) // Monday
    expect(Math.round((end - start) / 86400000)).toBe(6)
    expect(start <= new Date('2026-06-30T00:00:00')).toBe(true)
    expect(new Date('2026-06-30T00:00:00') <= end).toBe(true)
  })
})

describe('currentStreak', () => {
  it('counts consecutive days ending today', () => {
    expect(currentStreak(['2026-07-01', '2026-06-30', '2026-06-29'], '2026-07-01')).toBe(3)
  })
  it('still counts a streak ending yesterday (today not missed yet)', () => {
    expect(currentStreak(['2026-06-30', '2026-06-29'], '2026-07-01')).toBe(2)
  })
  it('is 0 when there is a gap before today/yesterday', () => {
    expect(currentStreak(['2026-06-28'], '2026-07-01')).toBe(0)
    expect(currentStreak([], '2026-07-01')).toBe(0)
  })
})

describe('longestStreak', () => {
  it('finds the longest consecutive run', () => {
    expect(longestStreak(['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-10'])).toBe(3)
  })
  it('handles single and empty', () => {
    expect(longestStreak(['2026-06-01'])).toBe(1)
    expect(longestStreak([])).toBe(0)
  })
  it('ignores duplicate dates', () => {
    expect(longestStreak(['2026-06-01', '2026-06-01', '2026-06-02'])).toBe(2)
  })
})
