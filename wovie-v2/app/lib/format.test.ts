import { describe, expect, it } from 'vitest'
import { formatDate, formatMoney, formatRuntime, formatVotes, isRecentRelease, yearOf } from './format'

describe('formatRuntime', () => {
  it.each([
    [135, '2h 15min'],
    [120, '2h'],
    [45, '45min'],
    [0, ''],
    [null, ''],
  ])('%s → %s', (minutes, expected) => expect(formatRuntime(minutes)).toBe(expected))
})

describe('formatVotes', () => {
  it.each([
    [1, '1 vote'],
    [950, '950 votes'],
    [12_400, '12.4K votes'],
    [2_500_000, '2.5M votes'],
  ])('%s → %s', (n, expected) => expect(formatVotes(n)).toBe(expected))
})

describe('formatMoney', () => {
  it('shows nothing for an unknown (zero) amount', () => {
    expect(formatMoney(0)).toBeNull()
  })
  it('uses millions and billions', () => {
    expect(formatMoney(165_000_000)).toBe('$165M')
    expect(formatMoney(2_100_000_000)).toBe('$2.1B')
  })
})

describe('dates', () => {
  it('reads TMDB dates as UTC', () => {
    expect(yearOf('2026-01-01')).toBe('2026')
    expect(formatDate('2026-03-12')).toBe('Mar 12, 2026')
    expect(formatDate('not a date')).toBe('')
  })
})

describe('isRecentRelease', () => {
  const now = new Date('2026-11-03T12:00:00Z')

  it('is true for a film out within the last 90 days', () => {
    expect(isRecentRelease('2026-10-01', now)).toBe(true)
  })
  it('is false for an older film', () => {
    expect(isRecentRelease('2026-06-01', now)).toBe(false)
  })
  it('is false for a film that is not out yet', () => {
    expect(isRecentRelease('2026-12-25', now)).toBe(false)
  })
  it('is false without a date', () => {
    expect(isRecentRelease(null, now)).toBe(false)
  })
})
