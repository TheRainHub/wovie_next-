// The catalogue's filters live in the URL (?genre=&sort=&q=), so a filtered
// view can be shared, reloaded and navigated with Back. Pure helpers, shared by
// the server page, the API route and the client grid.

export const SORTS = {
  popular: 'Popular',
  top: 'Top rated',
  new: 'Newest',
  title: 'A–Z',
} as const

export type Sort = keyof typeof SORTS

export interface CatalogueQuery {
  sort: Sort
  genre: number | null
  q: string
  page: number
}

export const PAGE_SIZE = 20
const MAX_QUERY_LENGTH = 100

type Params = URLSearchParams | Record<string, string | string[] | undefined>

function read(params: Params, key: string) {
  const value = params instanceof URLSearchParams ? params.get(key) : params[key]
  return (Array.isArray(value) ? value[0] : value) ?? ''
}

export function parseCatalogueQuery(params: Params): CatalogueQuery {
  const sort = read(params, 'sort')
  const genre = Number.parseInt(read(params, 'genre'), 10)
  const page = Number.parseInt(read(params, 'page'), 10)
  return {
    sort: Object.hasOwn(SORTS, sort) ? (sort as Sort) : 'popular',
    genre: Number.isInteger(genre) && genre > 0 ? genre : null,
    q: read(params, 'q').trim().slice(0, MAX_QUERY_LENGTH),
    page: Number.isInteger(page) && page > 0 ? Math.min(page, 500) : 1,
  }
}

/** Query string for a catalogue view; defaults are left out to keep URLs short. */
export function catalogueSearch({ sort = 'popular', genre = null, q = '', page = 1 }: Partial<CatalogueQuery>) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (genre) params.set('genre', String(genre))
  if (sort !== 'popular') params.set('sort', sort)
  if (page > 1) params.set('page', String(page))
  const search = params.toString()
  return search ? `?${search}` : ''
}
