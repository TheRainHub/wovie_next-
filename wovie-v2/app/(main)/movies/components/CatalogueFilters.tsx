import Link from 'next/link'
import { catalogueSearch, SORTS, type CatalogueQuery, type Sort } from '@/app/lib/catalog-query'

interface Props {
  genres: { id: number; name: string }[]
  query: CatalogueQuery
}

// Plain links: every filter is a URL, so Back, reload and sharing just work.
export default function CatalogueFilters({ genres, query }: Props) {
  const href = (change: Partial<CatalogueQuery>) => `/movies${catalogueSearch({ ...query, page: 1, ...change })}`

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Sort films" className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
        <span className="text-xs uppercase tracking-wider text-white/40 mr-2 flex-shrink-0">Sort</span>
        {(Object.keys(SORTS) as Sort[]).map(sort => (
          <Chip key={sort} href={href({ sort })} active={query.sort === sort}>
            {SORTS[sort]}
          </Chip>
        ))}
      </nav>

      <nav aria-label="Filter by genre" className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
        <Chip href={href({ genre: null })} active={query.genre === null}>
          All genres
        </Chip>
        {genres.map(g => (
          <Chip key={g.id} href={href({ genre: g.id })} active={query.genre === g.id}>
            {g.name}
          </Chip>
        ))}
      </nav>
    </div>
  )
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'page' : undefined}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
        active
          ? 'bg-white text-black'
          : 'border border-white/15 text-white/70 hover:text-white hover:border-white/30'
      }`}
    >
      {children}
    </Link>
  )
}
