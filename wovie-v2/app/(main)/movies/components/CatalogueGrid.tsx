'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import PosterCard, { type PosterCardMovie } from '@/app/components/PosterCard'
import { catalogueSearch, type CatalogueQuery } from '@/app/lib/catalog-query'

interface Props {
  initialMovies: PosterCardMovie[]
  query: CatalogueQuery
  initialHasMore: boolean
}

// The server renders page one; this keeps loading pages as you scroll.
export default function CatalogueGrid({ initialMovies, query, initialHasMore }: Props) {
  const [movies, setMovies] = useState(initialMovies)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    setFailed(false)
    try {
      const res = await fetch(`/api/movies${catalogueSearch({ ...query, page: page + 1 })}`)
      if (!res.ok) throw new Error(`Catalogue page failed: ${res.status}`)
      const data: { movies: PosterCardMovie[]; hasMore: boolean } = await res.json()
      setMovies(prev => {
        const seen = new Set(prev.map(m => m.id))
        return [...prev, ...data.movies.filter(m => !seen.has(m.id))]
      })
      setPage(p => p + 1)
      setHasMore(data.hasMore)
    } catch (error) {
      console.error(error)
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [hasMore, loading, page, query])

  useEffect(() => {
    const el = sentinel.current
    if (!el || failed) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore()
    }, { rootMargin: '600px 0px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore, failed])

  return (
    <>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {movies.map((m, i) => (
          <li key={m.id}>
            <PosterCard movie={m} priority={i < 5} />
          </li>
        ))}
      </ul>

      {hasMore && (
        <div ref={sentinel} className="flex justify-center py-10 text-sm text-white/40" aria-live="polite">
          {failed ? (
            <button type="button" onClick={loadMore} className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80">
              Couldn&apos;t load more films. Try again
            </button>
          ) : loading ? (
            <span className="flex items-center gap-3">
              <span className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" aria-hidden />
              Loading more films…
            </span>
          ) : null}
        </div>
      )}

      {!hasMore && movies.length > 20 && (
        <p className="text-center text-white/25 text-sm py-10">That&apos;s all {movies.length} films</p>
      )}
    </>
  )
}
