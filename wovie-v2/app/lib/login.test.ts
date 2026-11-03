import { describe, expect, it } from 'vitest'
import { loginHref, safeReturnPath } from './login'
import { parseListName } from './lists'

describe('safeReturnPath', () => {
  it('follows same-site paths', () => {
    expect(safeReturnPath('/lists/abc')).toBe('/lists/abc')
  })

  it.each(['https://evil.example', '//evil.example', '/\\evil.example', '', null, '/'])(
    'sends %s to the catalogue',
    value => expect(safeReturnPath(value)).toBe('/movies'),
  )
})

describe('loginHref', () => {
  it('opens the login form and remembers where to come back to', () => {
    expect(loginHref('/movies/42')).toBe('/?view=login&callbackUrl=%2Fmovies%2F42')
    expect(loginHref('/movies')).toBe('/?view=login')
  })
})

describe('parseListName', () => {
  it('trims and collapses spaces', () => {
    expect(parseListName('  Friday   night ')).toBe('Friday night')
  })
  it.each(['', '   ', 'x'.repeat(61), 42, null])('rejects %s', value => expect(parseListName(value)).toBeNull())
})
