import { describe, expect, it } from 'vitest'
import { catalogueSearch, parseCatalogueQuery } from './catalog-query'

describe('parseCatalogueQuery', () => {
  it('defaults to popular films, first page, no filters', () => {
    expect(parseCatalogueQuery(new URLSearchParams())).toEqual({ sort: 'popular', genre: null, q: '', page: 1 })
  })

  it('reads URL search params and Next.js searchParams objects alike', () => {
    const expected = { sort: 'top', genre: 18, q: 'heat', page: 3 }
    expect(parseCatalogueQuery(new URLSearchParams('sort=top&genre=18&q=%20heat%20&page=3'))).toEqual(expected)
    expect(parseCatalogueQuery({ sort: 'top', genre: '18', q: ' heat ', page: ['3', '4'] })).toEqual(expected)
  })

  it('ignores values it does not understand', () => {
    expect(parseCatalogueQuery(new URLSearchParams('sort=rating&genre=abc&page=-2'))).toEqual({
      sort: 'popular',
      genre: null,
      q: '',
      page: 1,
    })
  })

  it('does not take inherited object keys for a sort', () => {
    expect(parseCatalogueQuery(new URLSearchParams('sort=constructor')).sort).toBe('popular')
  })

  it('caps the search text', () => {
    expect(parseCatalogueQuery(new URLSearchParams({ q: 'x'.repeat(500) })).q).toHaveLength(100)
  })
})

describe('catalogueSearch', () => {
  it('leaves defaults out of the URL', () => {
    expect(catalogueSearch({})).toBe('')
    expect(catalogueSearch({ sort: 'popular', page: 1 })).toBe('')
  })

  it('round-trips through parseCatalogueQuery', () => {
    const query = { sort: 'new' as const, genre: 35, q: 'love actually', page: 2 }
    expect(parseCatalogueQuery(new URLSearchParams(catalogueSearch(query)))).toEqual(query)
  })
})
