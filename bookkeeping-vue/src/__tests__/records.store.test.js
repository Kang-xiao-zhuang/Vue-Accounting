import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRecordsStore } from '../stores/records'

describe('records store getters', () => {
  beforeEach(() => setActivePinia(createPinia()))

  const sample = () => ([
    { id: 1, type: 'expense', amount: 10, date: '2026-07-01' },
    { id: 2, type: 'income', amount: 100, date: '2026-07-01' },
    { id: 3, type: 'expense', amount: 5.5, date: '2026-06-15' }
  ])

  it('periodRecords filters by day', () => {
    const s = useRecordsStore()
    s.records = sample()
    s.period = 'day'
    s.anchor = '2026-07-01'
    expect(s.periodRecords.map(r => r.id)).toEqual([1, 2])
  })

  it('totals sum the current period without float drift', () => {
    const s = useRecordsStore()
    s.records = sample()
    s.period = 'day'
    s.anchor = '2026-07-01'
    expect(s.totalIncome).toBe(100)
    expect(s.totalExpense).toBe(10)
    expect(s.balance).toBe(90)
  })

  it('period "all" includes everything', () => {
    const s = useRecordsStore()
    s.records = sample()
    s.period = 'all'
    expect(s.periodRecords.length).toBe(3)
    expect(s.totalExpense).toBe(15.5)
  })

  it('period "month" filters by YYYY-MM prefix', () => {
    const s = useRecordsStore()
    s.records = sample()
    s.period = 'month'
    s.anchor = '2026-06-20'
    expect(s.periodRecords.map(r => r.id)).toEqual([3])
  })
})
