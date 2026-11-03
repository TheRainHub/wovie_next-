import { describe, expect, it } from 'vitest'
import { imageUrl, pickCertification, pickTrailer } from './tmdb'

describe('pickTrailer', () => {
  it('prefers an official YouTube trailer', () => {
    const trailer = pickTrailer({
      results: [
        { key: 'teaser', site: 'YouTube', type: 'Teaser' },
        { key: 'fan', site: 'YouTube', type: 'Trailer', official: false },
        { key: 'vimeo', site: 'Vimeo', type: 'Trailer', official: true },
        { key: 'official', site: 'YouTube', type: 'Trailer', official: true },
      ],
    })
    expect(trailer?.key).toBe('official')
  })

  it('falls back to any YouTube trailer, and to null', () => {
    expect(pickTrailer({ results: [{ key: 'a', site: 'YouTube', type: 'Trailer' }] })?.key).toBe('a')
    expect(pickTrailer({ results: [{ key: 'b', site: 'YouTube', type: 'Clip' }] })).toBeNull()
    expect(pickTrailer(undefined)).toBeNull()
  })
})

describe('pickCertification', () => {
  const releaseDates = {
    results: [
      { iso_3166_1: 'DE', release_dates: [{ certification: '12', type: 3 }] },
      { iso_3166_1: 'US', release_dates: [{ certification: '', type: 1 }, { certification: 'PG-13', type: 3 }] },
      { iso_3166_1: 'GB', release_dates: [{ certification: '12A', type: 3 }] },
    ],
  }

  it('takes the first preferred region that has a certification', () => {
    expect(pickCertification(releaseDates)).toEqual({ region: 'US', certification: 'PG-13' })
    expect(pickCertification(releaseDates, ['CZ', 'GB'])).toEqual({ region: 'GB', certification: '12A' })
  })

  it('returns null rather than guessing', () => {
    expect(pickCertification(releaseDates, ['CZ'])).toBeNull()
    expect(pickCertification(undefined)).toBeNull()
  })
})

describe('imageUrl', () => {
  it('builds TMDB image URLs and passes null through', () => {
    expect(imageUrl('/abc.jpg', 'w185')).toBe('https://image.tmdb.org/t/p/w185/abc.jpg')
    expect(imageUrl(null)).toBeNull()
  })
})
